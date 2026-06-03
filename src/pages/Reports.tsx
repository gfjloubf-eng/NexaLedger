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

const MONTHS_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
] as const;

const toFiniteNumber = (v: unknown): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
};

const safeAvg = (sum: number, count: number) => {
  if (!count) return 0;
  return sum / count;
};

const getYear = (ms: number) => new Date(ms).getFullYear();
const getMonthIndex = (ms: number) => new Date(ms).getMonth();

type ReportKpiCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  colorClassName: string;
};

function ReportKpiCard({ title, value, subtitle, colorClassName }: ReportKpiCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#0B1018]/30 p-5">
      <div className="text-xs text-slate-900 dark:text-white">{title}</div>
      <div className={`mt-2 text-2xl md:text-3xl font-extrabold tabular-nums ${colorClassName}`}>{value}</div>
      {subtitle ? <div className="mt-1 text-xs text-slate-900 dark:text-white">{subtitle}</div> : null}
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-1 text-xs font-semibold text-emerald-300 dark:text-emerald-200">
        {eyebrow}
      </div>
      <div>
        <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-900 dark:text-white leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        setLoading(false);
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
        console.error('[Financial Reports] load failed', e);
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

  const now = useMemo(() => new Date(), []);

  const statements = useMemo(() => {
    if (!customers.length) return [];
    return buildCustomerStatements({ customers, invoices, payments, nowMs: now.getTime() });
  }, [customers, invoices, payments, now]);

  const hasAnyData = customers.length > 0 || invoices.length > 0 || payments.length > 0;

  const derived = useMemo(() => {
    const invoiceCount = invoices.length;
    const revenueTotal = invoices.reduce((s, inv) => s + toFiniteNumber(inv.amount), 0);
    const revenueAvg = safeAvg(revenueTotal, invoiceCount);

    const paymentCount = payments.length;
    const paymentsTotal = payments.reduce((s, pay) => s + toFiniteNumber(pay.amount), 0);
    const paymentAvg = safeAvg(paymentsTotal, paymentCount);

    const outstandingByCustomer = new Map<string, number>();
    const overdueByCustomerId = new Map<string, boolean>();
    for (const st of statements) {
      outstandingByCustomer.set(st.customer.id, toFiniteNumber(st.totals.outstandingBalance));
      const overdue = st.timeline.some((t) => t.kind === 'invoice' && (t as any).overdue === true);
      overdueByCustomerId.set(st.customer.id, overdue);
    }

    const totalOutstanding = Array.from(outstandingByCustomer.values()).reduce((s, v) => s + v, 0);
    const overdueCustomers = Array.from(outstandingByCustomer.entries()).filter(([cid, out]) => out > 0 && overdueByCustomerId.get(cid)).length;

    const largest = Array.from(outstandingByCustomer.entries()).sort((a, b) => b[1] - a[1])[0];
    const largestOutstandingBalance = largest ? largest[1] : 0;

    // Top customers by current outstanding (Highest value first)
    const topCustomers = Array.from(outstandingByCustomer.entries())
      .map(([customerId, currentBalance]) => {
        const customer = customers.find((c) => c.id === customerId);
        const totalCollections = payments
          .filter((p) => p.customerId === customerId)
          .reduce((s, p) => s + toFiniteNumber(p.amount), 0);
        return {
          customerId,
          name: customer?.name ?? '—',
          currentBalance,
          totalCollections,
        };
      })
      .sort((a, b) => b.currentBalance - a.currentBalance)
      .slice(0, 5);

    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    const monthInvoices = invoices.filter((inv) => {
      const dt = new Date(inv.createdAt);
      return dt.getFullYear() === year && dt.getMonth() === monthIndex;
    });

    const monthPayments = payments.filter((pay) => {
      const dt = new Date(pay.createdAt);
      return dt.getFullYear() === year && dt.getMonth() === monthIndex;
    });

    const monthInvoicesTotal = monthInvoices.reduce((s, inv) => s + toFiniteNumber(inv.amount), 0);
    const monthPaymentsTotal = monthPayments.reduce((s, pay) => s + toFiniteNumber(pay.amount), 0);
    const netMonthMovement = monthInvoicesTotal - monthPaymentsTotal;

    const yearInvoices = invoices.filter((inv) => getYear(inv.createdAt) === year);
    const yearPayments = payments.filter((pay) => getYear(pay.createdAt) === year);

    const yearRevenue = yearInvoices.reduce((s, inv) => s + toFiniteNumber(inv.amount), 0);
    const yearPaymentsTotal = yearPayments.reduce((s, pay) => s + toFiniteNumber(pay.amount), 0);

    // Year outstanding: sum of invoice totals minus payments totals within the year
    const yearOutstanding = yearInvoices.reduce((s, inv) => s + toFiniteNumber(inv.amount), 0) -
      yearPayments.reduce((s, pay) => s + toFiniteNumber(pay.amount), 0);

    // Best performing month (within year): maximize net movement (revenue - payments)
    const monthBuckets = new Array(12).fill(0).map(() => ({ invoicesTotal: 0, paymentsTotal: 0 }));
    for (const inv of yearInvoices) {
      const mi = getMonthIndex(inv.createdAt);
      monthBuckets[mi].invoicesTotal += toFiniteNumber(inv.amount);
    }
    for (const pay of yearPayments) {
      const mi = getMonthIndex(pay.createdAt);
      monthBuckets[mi].paymentsTotal += toFiniteNumber(pay.amount);
    }
    const monthNet = monthBuckets.map((b) => b.invoicesTotal - b.paymentsTotal);
    const bestMonthIndex = monthNet.reduce((best, v, idx) => (v > monthNet[best] ? idx : best), 0);
    const bestMonthLabel = MONTHS_AR[bestMonthIndex];

    const totalCollectionsYear = yearPaymentsTotal;

    // Executive: best customer (highest totalCollections)
    const collectionsByCustomer = new Map<string, number>();
    for (const pay of payments) {
      collectionsByCustomer.set(pay.customerId, (collectionsByCustomer.get(pay.customerId) ?? 0) + toFiniteNumber(pay.amount));
    }
    const bestCustomer = Array.from(collectionsByCustomer.entries())
      .map(([cid, totalCollections]) => {
        const customer = customers.find((c) => c.id === cid);
        return {
          customerId: cid,
          name: customer?.name ?? '—',
          totalCollections,
        };
      })
      .sort((a, b) => b.totalCollections - a.totalCollections)[0] ?? null;

    // Executive: highest debt (max current outstanding)
    const highestDebt = Array.from(outstandingByCustomer.entries()).sort((a, b) => b[1] - a[1])[0];
    const highestDebtCustomer = highestDebt
      ? {
          name: customers.find((c) => c.id === highestDebt[0])?.name ?? '—',
          balance: highestDebt[1],
        }
      : null;

    return {
      revenueTotal,
      invoiceCount,
      revenueAvg,
      paymentsTotal,
      paymentCount,
      paymentAvg,
      totalOutstanding,
      overdueCustomers,
      largestOutstandingBalance,
      topCustomers,
      monthInvoicesCount: monthInvoices.length,
      monthPaymentsCount: monthPayments.length,
      monthInvoicesTotal,
      monthPaymentsTotal,
      netMonthMovement,
      year,
      yearRevenue,
      yearPaymentsTotal,
      yearOutstanding,
      bestMonthLabel,
      bestCustomer,
      highestDebtCustomer,
      totalCollectionsYear,
    };
  }, [customers, invoices, payments, statements, now]);

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
            أنا داخل التقارير المالية
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">التقارير المالية</h1>
          <p className="text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">
            تقارير تنفيذية لاتخاذ القرارات المالية
          </p>
        </div>

        <FinEmptyState
          icon="report"
          title="لا توجد بيانات مالية بعد"
          subtitle="ابدأ بإضافة العملاء والفواتير والمدفوعات، ثم ستظهر التقارير فورًا."
          actionLabel="الذهاب إلى الفواتير"
          onAction={() => {
            window.location.href = '/invoices';
          }}
        />
      </div>
    );
  }

  const emptyValue = (n: number) => formatCurrency(n, { locale: 'ar-SA' });

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-4 py-8 space-y-6">
      {/* Identity */}
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-4 py-1 text-xs font-semibold text-emerald-300 dark:text-emerald-200">
          أنا داخل التقارير المالية
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">التقارير المالية</h1>
        <p className="text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">تقارير تنفيذية لاتخاذ القرارات المالية</p>
      </div>

      {/* Revenue + Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Revenue Report"
            title="إيراداتك في لمحة"
            subtitle="إجمالي الفواتير، عددها، ومتوسط قيمتها"
          />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReportKpiCard
              title="إجمالي الإيرادات"
              value={emptyValue(derived.revenueTotal)}
              colorClassName="text-emerald-700 dark:text-emerald-300"
            />
            <ReportKpiCard
              title="عدد الفواتير"
              value={derived.invoiceCount.toLocaleString('ar-SA')}
              subtitle="Invoices"
              colorClassName="text-emerald-700 dark:text-emerald-300"
            />
            <ReportKpiCard
              title="متوسط قيمة الفاتورة"
              value={emptyValue(derived.revenueAvg)}
              subtitle="Avg"
              colorClassName="text-emerald-700 dark:text-emerald-300"
            />
          </div>
        </FinCard>

        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Payments Report"
            title="المدفوعات التي دخلت"
            subtitle="إجمالي المدفوعات، عددها، ومتوسطها"
          />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReportKpiCard
              title="إجمالي المدفوعات"
              value={emptyValue(derived.paymentsTotal)}
              colorClassName="text-blue-700 dark:text-blue-300"
            />
            <ReportKpiCard
              title="عدد المدفوعات"
              value={derived.paymentCount.toLocaleString('ar-SA')}
              subtitle="Payments"
              colorClassName="text-blue-700 dark:text-blue-300"
            />
            <ReportKpiCard
              title="متوسط قيمة الدفعة"
              value={emptyValue(derived.paymentAvg)}
              subtitle="Avg"
              colorClassName="text-blue-700 dark:text-blue-300"
            />
          </div>
        </FinCard>
      </div>

      {/* Outstanding + Top customers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Outstanding Balances"
            title="المديونيات الحالية"
            subtitle="صافي المستحقات مع تحليل التأخير"
          />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReportKpiCard
              title="إجمالي المديونيات"
              value={emptyValue(derived.totalOutstanding)}
              colorClassName="text-rose-700 dark:text-rose-300"
            />
            <ReportKpiCard
              title="العملاء المتأخرون"
              value={derived.overdueCustomers.toLocaleString('ar-SA')}
              subtitle="Overdue"
              colorClassName="text-rose-700 dark:text-rose-300"
            />
            <ReportKpiCard
              title="أكبر مديونية"
              value={emptyValue(derived.largestOutstandingBalance)}
              subtitle="Max"
              colorClassName="text-rose-700 dark:text-rose-300"
            />
          </div>
        </FinCard>

        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Top Customers"
            title="أفضل العملاء (حسب الرصيد الحالي)"
            subtitle="ترتيب تنازلي من الأعلى قيمة"
          />

          {derived.topCustomers.length === 0 ? (
            <div className="mt-5">
              <FinEmptyState
                title="لا توجد أرصدة حالية"
                subtitle="عندما تتوفر فواتير ومدفوعات، ستظهر قائمة أفضل العملاء هنا."
              />
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {derived.topCustomers.map((c, idx) => (
                <div
                  key={c.customerId}
                  className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 px-4 py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {idx + 1}. {c.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-900 dark:text-white">
                      إجمالي التحصيلات: {formatCurrency(c.totalCollections, { locale: 'ar-SA' })}
                    </div>
                  </div>
                  <div className="text-sm font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
                    {formatCurrency(c.currentBalance, { locale: 'ar-SA' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </FinCard>
      </div>

      {/* Monthly + Yearly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Monthly Summary"
            title={`ملخص الشهر الحالي (${MONTHS_AR[new Date().getMonth()]})`}
            subtitle="الفواتير، المدفوعات، وصافي الحركة المالية"
          />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReportKpiCard
              title="فواتير الشهر"
              value={emptyValue(derived.monthInvoicesTotal)}
              colorClassName="text-slate-900 dark:text-white"
            />
            <ReportKpiCard
              title="مدفوعات الشهر"
              value={emptyValue(derived.monthPaymentsTotal)}
              colorClassName="text-blue-700 dark:text-blue-300"
            />
            <ReportKpiCard
              title="صافي الحركة المالية"
              value={emptyValue(derived.netMonthMovement)}
              subtitle={derived.netMonthMovement >= 0 ? 'Net +' : 'Net -'}
              colorClassName={derived.netMonthMovement >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}
            />
          </div>
        </FinCard>

        <FinCard className="p-5">
          <SectionHeader
            eyebrow="Yearly Summary"
            title={`ملخص السنة (${derived.year})`}
            subtitle="إجمالي السنة مع المديونيات السنوية"
          />

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ReportKpiCard
              title="إيرادات السنة"
              value={emptyValue(derived.yearRevenue)}
              colorClassName="text-emerald-700 dark:text-emerald-300"
            />
            <ReportKpiCard
              title="مدفوعات السنة"
              value={emptyValue(derived.yearPaymentsTotal)}
              colorClassName="text-blue-700 dark:text-blue-300"
            />
            <ReportKpiCard
              title="المديونيات السنوية"
              value={emptyValue(derived.yearOutstanding)}
              colorClassName="text-rose-700 dark:text-rose-300"
            />
          </div>
        </FinCard>
      </div>

      {/* Executive Insights */}
      <FinCard className="p-6">
        <SectionHeader
          eyebrow="Executive Insights"
          title="لقطات تنفيذية لاتخاذ القرار"
          subtitle="أهم النتائج التي تحتاجها الآن بدون فتح عدة أقسام"
        />

        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-3xl border border-white/10 bg-[#0B1018]/30 p-5">
            <div className="text-xs text-slate-900 dark:text-white">⭐ أفضل عميل</div>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">{derived.bestCustomer?.name ?? '—'}</div>
            <div className="mt-1 text-xs text-slate-900 dark:text-white">💰 {formatCurrency(derived.bestCustomer?.totalCollections ?? 0, { locale: 'ar-SA' })}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1018]/30 p-5">
            <div className="text-xs text-slate-900 dark:text-white">⚠ أعلى مديونية</div>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">{derived.highestDebtCustomer?.name ?? '—'}</div>
            <div className="mt-1 text-xs text-slate-900 dark:text-white">{formatCurrency(derived.highestDebtCustomer?.balance ?? 0, { locale: 'ar-SA' })}</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1018]/30 p-5">
            <div className="text-xs text-slate-900 dark:text-white">📈 أعلى شهر أداء</div>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white">{derived.bestMonthLabel}</div>
            <div className="mt-1 text-xs text-slate-900 dark:text-white">Net movement</div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#0B1018]/30 p-5">
            <div className="text-xs text-slate-900 dark:text-white">💰 إجمالي التحصيلات</div>
            <div className="mt-2 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">{formatCurrency(derived.totalCollectionsYear, { locale: 'ar-SA' })}</div>
            <div className="mt-1 text-xs text-slate-900 dark:text-white">{derived.year}</div>
          </div>
        </div>
      </FinCard>

      {/* Mobile-friendly note */}
      <div className="text-sm text-slate-900 dark:text-white/80">
        تم بناء التقارير من بيانات العملاء والفواتير والمدفوعات — متوافق مع RTL ومناسب للهاتف.
      </div>
    </div>
  );
}


