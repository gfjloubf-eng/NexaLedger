import { useEffect, useMemo, useState } from 'react';

import FinCard from '../components/ui/FinCard';
import FinEmptyState from '../components/ui/FinEmptyState';
import FinLoadingCard from '../components/ui/FinLoadingCard';



import { useAuth } from '../context/AuthProvider';

import type { Customer } from '../types/customer';
import type { Invoice } from '../types/invoice';
import type { Payment } from '../types/payment';

import { loadCustomers } from '../lib/customerPersistence';
import { loadInvoices } from '../lib/invoicePersistence';
import { loadPayments } from '../lib/paymentPersistence';

import { buildCustomerStatements } from '../systems/smart-statements/statementEngine';

import { formatCurrency } from '../utils/formatCurrency';

type RiskTier = 'high' | 'medium' | 'low';

type RiskMeta = {
  tier: RiskTier;
  label: string;
  bg: string;
  border: string;
  text: string;
  icon: string;
};

const RISK_META: Record<RiskTier, RiskMeta> = {
  high: {
    tier: 'high',
    label: 'عالي',
    bg: 'rgba(229,138,138,0.10)',
    border: 'rgba(229,138,138,0.30)',
    text: '#FCA5A5',
    icon: '⚠️',
  },
  medium: {
    tier: 'medium',
    label: 'متوسط',
    bg: 'rgba(246,197,111,0.10)',
    border: 'rgba(246,197,111,0.30)',
    text: '#F6C56F',
    icon: '🟡',
  },
  low: {
    tier: 'low',
    label: 'منخفض',
    bg: 'rgba(124,255,178,0.10)',
    border: 'rgba(124,255,178,0.28)',
    text: '#7CFFB2',
    icon: '✅',
  },
};

const safeNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const daysBetween = (aMs: number, bMs: number) => {
  const diff = Math.abs(aMs - bMs);
  return Math.floor(diff / (24 * 60 * 60 * 1000));
};

const getLastPaymentAtMs = (payments: Payment[], customerId: string) => {
  let last = 0;
  for (const p of payments) {
    if (p.customerId !== customerId) continue;
    if (p.createdAt > last) last = p.createdAt;
  }
  return last;
};

const DecisionCenter: React.FC = () => {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        if (!cancelled) setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [c, i, p] = await Promise.all([
          loadCustomers(user.id),
          loadInvoices(user.id),
          loadPayments(user.id),
        ]);

        if (cancelled) return;
        setCustomers(c);
        setInvoices(i);
        setPayments(p);
      } catch (e) {
        console.error('[DecisionCenter] load failed', e);
        if (!cancelled) {
          setCustomers([]);
          setInvoices([]);
          setPayments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const nowMs = useMemo(() => Date.now(), []);

  const statements = useMemo(() => {
    if (!customers.length) return [];
    return buildCustomerStatements({ customers, invoices, payments, nowMs });
  }, [customers, invoices, payments, nowMs]);

  const hasAnyData = customers.length > 0 || invoices.length > 0 || payments.length > 0;

  const derived = useMemo(() => {
    const outstandingByCustomer = new Map<string, number>();
    const overdueCountByCustomer = new Map<string, number>();
    const invoicesByCustomer = new Map<string, Invoice[]>();

    for (const c of customers) {
      outstandingByCustomer.set(c.id, 0);
      overdueCountByCustomer.set(c.id, 0);
      invoicesByCustomer.set(c.id, []);
    }

    for (const inv of invoices) {
      const arr = invoicesByCustomer.get(inv.customerId);
      if (arr) arr.push(inv);
    }

    for (const st of statements) {
      outstandingByCustomer.set(st.customer.id, safeNumber(st.totals.outstandingBalance));

      const overdueInvoices = st.timeline.filter(
        (t) => t.kind === 'invoice' && (t as any).overdue === true
      );
      overdueCountByCustomer.set(st.customer.id, overdueInvoices.length);
    }

    const lastPaymentAtByCustomer = new Map<string, number>();
    for (const c of customers) {
      lastPaymentAtByCustomer.set(c.id, getLastPaymentAtMs(payments, c.id));
    }

    const tierForCustomer = (customerId: string): RiskTier => {
      const outstanding = outstandingByCustomer.get(customerId) ?? 0;
      const overdueCount = overdueCountByCustomer.get(customerId) ?? 0;
      const lastPaymentAt = lastPaymentAtByCustomer.get(customerId) ?? 0;

      const daysSinceLastPayment =
        lastPaymentAt > 0 ? daysBetween(nowMs, lastPaymentAt) : Infinity;

      if (outstanding > 0 && overdueCount >= 2) return 'high';
      if (outstanding > 0 && daysSinceLastPayment >= 60) return 'high';
      if (outstanding > 0 && overdueCount >= 1) return 'medium';
      if (outstanding > 0 && daysSinceLastPayment >= 30) return 'medium';

      if (outstanding <= 0) return 'low';
      return 'low';
    };

    const riskByCustomerId = new Map<string, RiskTier>();
    for (const c of customers) {
      riskByCustomerId.set(c.id, tierForCustomer(c.id));
    }

    const criticalLateCustomers = customers
      .map((c) => {
        const lastPay = lastPaymentAtByCustomer.get(c.id) ?? 0;
        const daysSinceLastPay = lastPay > 0 ? daysBetween(nowMs, lastPay) : Infinity;
        const outstanding = outstandingByCustomer.get(c.id) ?? 0;
        return { customer: c, daysSinceLastPay, outstanding };
      })
      .filter((x) => x.outstanding > 0 && x.daysSinceLastPay >= 60)
      .sort((a, b) => b.daysSinceLastPay - a.daysSinceLastPay);

    const criticalOverdueInvoicesToday = customers
      .map((c) => ({
        customer: c,
        overdueCount: overdueCountByCustomer.get(c.id) ?? 0,
        outstanding: outstandingByCustomer.get(c.id) ?? 0,
      }))
      .filter((x) => x.outstanding > 0 && x.overdueCount >= 1)
      .sort((a, b) => b.overdueCount - a.overdueCount);

    const withoutPaymentsSince30 = customers
      .map((c) => {
        const lastPay = lastPaymentAtByCustomer.get(c.id) ?? 0;
        const daysSinceLastPay = lastPay > 0 ? daysBetween(nowMs, lastPay) : Infinity;
        const outstanding = outstandingByCustomer.get(c.id) ?? 0;
        return { customer: c, daysSinceLastPay, outstanding };
      })
      .filter((x) => x.outstanding > 0 && x.daysSinceLastPay >= 30)
      .sort((a, b) => b.daysSinceLastPay - a.daysSinceLastPay);

    const sortedByOutstanding = customers
      .map((c) => ({
        customer: c,
        outstanding: outstandingByCustomer.get(c.id) ?? 0,
        overdueCount: overdueCountByCustomer.get(c.id) ?? 0,
      }))
      .filter((x) => x.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding);

    const highestDebtCustomer = sortedByOutstanding[0] ?? null;

    const totalReceivable = Array.from(outstandingByCustomer.values()).reduce(
      (s, v) => s + safeNumber(v),
      0
    );

    const collectionEasy = sortedByOutstanding
      .filter((x) => (riskByCustomerId.get(x.customer.id) ?? 'low') !== 'high')
      .sort((a, b) => a.overdueCount - b.overdueCount)
      .slice(0, 5);

    const collectionBig = sortedByOutstanding.slice(0, 5);

    const byCustomerCollections = new Map<string, number>();
    for (const p of payments) {
      byCustomerCollections.set(
        p.customerId,
        (byCustomerCollections.get(p.customerId) ?? 0) + safeNumber(p.amount)
      );
    }

    let best: { customerId: string; total: number } | null = null;
    for (const [cid, total] of byCustomerCollections.entries()) {
      if (!best || total > best.total) best = { customerId: cid, total };
    }

    const topCustomerByCollections = best
      ? {
          customer: customers.find((c) => c.id === best.customerId) ?? null,
          total: best.total,
        }
      : null;

    const highRiskCustomers = customers
      .filter((c) => (riskByCustomerId.get(c.id) ?? 'low') === 'high')
      .sort(
        (a, b) =>
          (outstandingByCustomer.get(b.id) ?? 0) - (outstandingByCustomer.get(a.id) ?? 0)
      );

    const activityHigh = customers
      .map((c) => {
        const recentInvoices = (invoicesByCustomer.get(c.id) ?? []).filter(
          (inv) => daysBetween(nowMs, inv.createdAt) <= 14
        );
        const recentPayments = payments.filter(
          (p) => p.customerId === c.id && daysBetween(nowMs, p.createdAt) <= 14
        );
        return { customer: c, recentCount: recentInvoices.length + recentPayments.length };
      })
      .sort((a, b) => b.recentCount - a.recentCount);

    return {
      outstandingByCustomer,
      overdueCountByCustomer,
      lastPaymentAtByCustomer,
      riskByCustomerId,
      criticalLateCustomers,
      criticalOverdueInvoicesToday,
      withoutPaymentsSince30,
      highestDebtCustomer,
      totalReceivable,
      collectionEasy,
      collectionBig,
      topCustomerByCollections,
      highRiskCustomers,
      activityHigh,
    };
  }, [customers, invoices, payments, statements, nowMs]);

  const riskCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const c of customers) {
      const tier = derived.riskByCustomerId.get(c.id) ?? 'low';
      counts[tier] += 1;
    }
    return counts;
  }, [customers, derived.riskByCustomerId]);

  const recommendedActions = useMemo(() => {
    const actions: { label: string; action: () => void }[] = [];

    const late = derived.criticalLateCustomers[0]?.customer;
    if (late) {
      actions.push({
        label: `⚠ اتصل بالعميل ${late.name}`,
        action: () => {
          window.location.href = '/customers';
        },
      });
    }

    const overdueInvoiceTimeline = statements
      .flatMap((st) => st.timeline)
      .filter((t) => t.kind === 'invoice' && (t as any).overdue === true) as any[];

    if (overdueInvoiceTimeline.length > 0) {
      const first = overdueInvoiceTimeline[0];
      actions.push({
        label: `راجع الفاتورة رقم ${first.invoiceNumber}`,
        action: () => {
          window.location.href = '/invoices';
        },
      });
    }

    const followUpCustomer = derived.criticalOverdueInvoicesToday[1]?.customer ??
      derived.criticalOverdueInvoicesToday[0]?.customer;

    if (followUpCustomer) {
      actions.push({
        label: `تابع العميل ${followUpCustomer.name}`,
        action: () => {
          window.location.href = '/customers';
        },
      });
    }

    const paymentNeededCustomer = derived.collectionBig[0]?.customer ?? derived.collectionEasy[0]?.customer;
    if (paymentNeededCustomer) {
      actions.push({
        label: 'أرسل تذكير دفع',
        action: () => {
          window.location.href = '/payments';
        },
      });
    }

    return actions.slice(0, 4);
  }, [derived, statements]);

  const executiveSummary = useMemo(() => {
    const lateCustomersCount = derived.criticalLateCustomers.length;
    const totalReceivable = derived.totalReceivable;
    const bestOpportunity = derived.collectionBig[0]?.outstanding ?? 0;
    const highRiskCount = derived.highRiskCustomers.length;

    return {
      lateCustomersCount,
      totalReceivable,
      bestOpportunity,
      highRiskCount,
    };
  }, [derived]);

  if (loading) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-4 py-8 space-y-6">
        <div className="space-y-3">
          <div className="h-10 w-56 rounded-full bg-white/10" />
          <div className="h-12 w-72 rounded-3xl bg-white/10" />
          <div className="h-5 w-[420px] rounded-2xl bg-white/10" />
        </div>
        <FinLoadingCard />
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-4 py-8 space-y-6">
        <div className="space-y-3">
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-1 text-xs font-semibold text-emerald-300 dark:text-emerald-200">
            أنا داخل مركز القرار
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">مركز القرار</h1>
          <p className="text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">أهم القرارات المالية التي تحتاج انتباهك الآن</p>
        </div>

        <FinEmptyState
          title="لا توجد بيانات كافية لاتخاذ قرارات"
          subtitle="عندما تتوفر العملاء والفواتير والمدفوعات سيتم توليد إجراءات حاسمة هنا تلقائيًا."
          actionLabel="اذهب إلى الفواتير"
          onAction={() => {
            window.location.href = '/invoices';
          }}
        />
      </div>
    );
  }

  const criticalLateCustomersTop = derived.criticalLateCustomers.slice(0, 4);
  const criticalOverdueInvoicesCount = derived.criticalOverdueInvoicesToday.reduce(
    (s, x) => s + x.overdueCount,
    0
  );

  const bestCollectionOpportunity = derived.collectionBig[0];
  const bestEasyOpportunity = derived.collectionEasy[0];

  const riskCard = (tier: RiskTier) => {
    const meta = RISK_META[tier];
    const count = riskCounts[tier];
    return (
      <div
        className="rounded-2xl border bg-white/5 p-4 flex items-start justify-between gap-3"
        style={{
          background: meta.bg,
          borderColor: meta.border,
          color: meta.text,
        }}
      >
        <div className="space-y-1">
          <div className="text-xs font-semibold">{meta.icon} {meta.label}</div>
          <div className="text-2xl font-extrabold tabular-nums" aria-label={`عدد ${meta.label}`}>{count}</div>
        </div>
        <div className="text-xs" style={{ color: meta.text }}>
          Risk
        </div>
      </div>
    );
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-4 py-8 space-y-6">
      {/* Identity */}
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-1 text-xs font-semibold text-emerald-300 dark:text-emerald-200">
          أنا داخل مركز القرار
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">مركز القرار</h1>
        <p className="text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">أهم القرارات المالية التي تحتاج انتباهك الآن</p>
      </div>

      {/* Executive Summary */}
      <FinCard className="p-5 md:p-6 subtleGlow">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Executive Summary</div>
            <div className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">اليوم لديك:</div>
            <div className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-200/90 leading-relaxed">
              <div>• {executiveSummary.lateCustomersCount} عملاء متأخرين</div>
              <div>• {formatCurrency(executiveSummary.totalReceivable, { locale: 'ar-SA' })} رصيد مستحق</div>
              <div>• أكبر فرصة تحصيل {formatCurrency(executiveSummary.bestOpportunity, { locale: 'ar-SA' })}</div>
              <div>• عميل واحد عالي الخطورة</div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1018]/20 px-4 py-3">
            <div className="text-xs text-slate-500">تركيز القرار</div>
            <div className="mt-1 text-3xl font-extrabold tabular-nums text-emerald-600 dark:text-emerald-300">
              {Math.min(99, 25 + executiveSummary.lateCustomersCount * 10 + executiveSummary.highRiskCount * 15)}%
            </div>
          </div>
        </div>
      </FinCard>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 1) Critical Actions Today */}
        <section className="lg:col-span-5 space-y-4">
          <FinCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Critical Actions Today</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">ماذا تحتاج اليوم؟</h2>
              </div>
              <div className="text-2xl" aria-hidden>🧭</div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">العملاء المتأخرون</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-200/80">
                  {criticalLateCustomersTop.length ? (
                    <div className="space-y-2">
                      {criticalLateCustomersTop.map((x) => (
                        <div key={x.customer.id} className="flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">{x.customer.name}</div>
                          <div className="text-xs font-semibold text-rose-400">{x.daysSinceLastPay} يوم</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    'لا يوجد متأخرون في هذه اللحظة.'
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">أعلى مديونية</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-200/80">
                  {derived.highestDebtCustomer ? (
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">{derived.highestDebtCustomer.customer.name}</div>
                      <div className="text-xs font-extrabold tabular-nums text-rose-400">
                        {formatCurrency(derived.highestDebtCustomer.outstanding, { locale: 'ar-SA' })}
                      </div>
                    </div>
                  ) : (
                    'لا توجد مديونيات حالية.'
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">العملاء بدون دفعات منذ فترة</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-200/80">
                  {derived.withoutPaymentsSince30.length ? (
                    <div className="space-y-2">
                      {derived.withoutPaymentsSince30.slice(0, 3).map((x) => (
                        <div key={x.customer.id} className="flex items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">{x.customer.name}</div>
                          <div className="text-xs font-semibold text-amber-300">{x.daysSinceLastPay} يوم</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    'لا يوجد عملاء بحاجة متابعة خلال آخر 30 يومًا.'
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">متابعة اليوم</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-200/80">
                  {criticalOverdueInvoicesCount > 0 ? (
                    `لديك ${criticalOverdueInvoicesCount} فاتورة/فواتير تحتاج متابعة.`
                  ) : (
                    'لا توجد فواتير تحتاج متابعة اليوم.'
                  )}
                </div>
              </div>
            </div>
          </FinCard>

          <FinCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Executive Alerts</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">تنبيهات تنفيذية</h2>
              </div>
              <div className="text-2xl" aria-hidden>🔔</div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
                <div className="text-sm font-semibold text-rose-200">⚠ عميل لم يدفع منذ 60 يوم</div>
                <div className="text-xs font-extrabold tabular-nums text-rose-200">{derived.criticalLateCustomers.length}</div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3">
                <div className="text-sm font-semibold text-rose-200">⚠ 4 فواتير غير مسددة</div>
                <div className="text-xs font-extrabold tabular-nums text-rose-200">{Math.min(99, derived.criticalOverdueInvoicesToday.reduce((s, x) => s + x.overdueCount, 0))}</div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm font-semibold text-slate-100">⭐ أفضل عميل</div>
                <div className="text-xs font-extrabold tabular-nums text-slate-100">
                  {derived.topCustomerByCollections?.customer?.name ?? '—'}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-sm font-semibold text-slate-100">📈 نشاط مرتفع</div>
                <div className="text-xs font-extrabold tabular-nums text-slate-100">
                  {derived.activityHigh[0]?.customer.name ?? '—'}
                </div>
              </div>
            </div>
          </FinCard>
        </section>

        {/* 2) Collection Opportunities + 3) Risk Radar */}
        <section className="lg:col-span-7 space-y-4">
          <FinCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Collection Opportunities</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">فرص التحصيل</h2>
              </div>
              <div className="text-2xl" aria-hidden>💎</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-500">أسهل فرصة تحصيل</div>
                <div className="mt-2 text-lg font-extrabold tabular-nums text-emerald-300">
                  {bestEasyOpportunity
                    ? formatCurrency(bestEasyOpportunity.outstanding, { locale: 'ar-SA' })
                    : '—'}
                </div>
                <div className="mt-1 text-xs text-slate-500">{bestEasyOpportunity?.customer.name ?? ''}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-500">أكبر فرصة تحصيل</div>
                <div className="mt-2 text-lg font-extrabold tabular-nums text-rose-300">
                  {bestCollectionOpportunity
                    ? formatCurrency(bestCollectionOpportunity.outstanding, { locale: 'ar-SA' })
                    : '—'}
                </div>
                <div className="mt-1 text-xs text-slate-500">{bestCollectionOpportunity?.customer.name ?? ''}</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-slate-500">إجمالي الأموال القابلة للتحصيل</div>
                <div className="mt-2 text-lg font-extrabold tabular-nums text-blue-300">
                  {formatCurrency(derived.totalReceivable, { locale: 'ar-SA' })}
                </div>
                <div className="mt-1 text-xs text-slate-500">Receivable</div>
              </div>
            </div>
          </FinCard>

          <FinCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Risk Radar</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">رادار المخاطر</h2>
              </div>
              <div className="text-2xl" aria-hidden>🛰️</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {riskCard('high')}
              {riskCard('medium')}
              {riskCard('low')}
            </div>
          </FinCard>

          {/* 5) Recommended Actions */}
          <FinCard className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">Recommended Actions</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-white">إجراءات مقترحة</h2>
              </div>
              <div className="text-2xl" aria-hidden>✅</div>
            </div>

            {recommendedActions.length ? (
              <div className="mt-4 space-y-2">
                {recommendedActions.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={a.action}
                    className="w-full text-right rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 py-3"
                  >
                    <div className="text-sm font-semibold text-slate-100">{a.label}</div>
                    <div className="text-xs text-slate-500 mt-1">افتح القسم المناسب</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <FinEmptyState
                  title="لا توجد إجراءات مقترحة الآن"
                  subtitle="عندما تتوفر فواتير أو مدفوعات غير مكتملة، سيتم اقتراح خطوات واضحة مباشرة."
                />
              </div>
            )}
          </FinCard>

          {/* 4) Executive Alerts already in left column */}
        </section>
      </div>

      {/* small helper */}
      <div className="text-sm text-slate-900 dark:text-white/80">
        مركز القرار يعتمد على العملاء والفواتير والمدفوعات + منطق المديونية/التأخر داخل Statements.
      </div>
    </div>
  );
};

export default DecisionCenter;

