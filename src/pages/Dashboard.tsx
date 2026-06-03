import React, { useEffect, useMemo, useState } from 'react';

import FinCard from '../components/ui/FinCard';
import { Card } from '../components/ui';
import FinEmptyState from '../components/ui/FinEmptyState';

import { useAuth } from '../context/AuthProvider';

import type { Customer } from '../types/customer';
import type { Invoice } from '../types/invoice';
import type { Payment } from '../types/payment';

import { loadCustomers } from '../lib/customerPersistence';
import { loadInvoices } from '../lib/invoicePersistence';
import { loadPayments } from '../lib/paymentPersistence';

import { formatCurrency } from '../utils/formatCurrency';

type ExecutiveKpis = {
  customersCount: number;
  invoicesTotal: number;
  paymentsTotal: number;
  outstandingBalance: number;
};

type ActivityItem = {
  id: string;
  kind: 'customer' | 'invoice' | 'payment';
  title: string;
  subtitle: string;
  createdAt: number;
};

const toNumber = (n: unknown): number => {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
};

const formatDate = (ms: number) => {
  const d = new Date(ms);
  return d.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
};

const Dashboard: React.FC = () => {
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
        console.error('[Dashboard] failed to load data', e);
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

  const kpis: ExecutiveKpis = useMemo(() => {
    const invoicesTotal = invoices.reduce((s, inv) => s + toNumber(inv.amount), 0);
    const paymentsTotal = payments.reduce((s, pay) => s + toNumber(pay.amount), 0);
    const outstandingBalance = invoicesTotal - paymentsTotal;

    return {
      customersCount: customers.length,
      invoicesTotal,
      paymentsTotal,
      outstandingBalance,
    };
  }, [customers.length, invoices, payments]);

  const customerById = useMemo(() => {
    const m = new Map<string, Customer>();
    for (const c of customers) m.set(c.id, c);
    return m;
  }, [customers]);

  const outstandingByCustomerId = useMemo(() => {
    const map = new Map<string, number>();

    for (const inv of invoices) {
      map.set(inv.customerId, (map.get(inv.customerId) ?? 0) + toNumber(inv.amount));
    }

    for (const pay of payments) {
      map.set(pay.customerId, (map.get(pay.customerId) ?? 0) - toNumber(pay.amount));
    }

    return map;
  }, [invoices, payments]);

  const topCustomers = useMemo(() => {
    return customers
      .map((c) => {
        const outstanding = outstandingByCustomerId.get(c.id) ?? 0;
        return {
          id: c.id,
          name: c.name,
          outstanding,
        };
      })
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);
  }, [customers, outstandingByCustomerId]);

  const timeline = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    for (const c of customers) {
      items.push({
        id: `customer:${c.id}`,
        kind: 'customer',
        title: '👤 عميل',
        subtitle: c.name,
        createdAt: toNumber(c.createdAt),
      });
    }

    for (const inv of invoices) {
      items.push({
        id: `invoice:${inv.id}`,
        kind: 'invoice',
        title: '📄 فاتورة',
        subtitle: inv.invoiceNumber,
        createdAt: toNumber(inv.createdAt),
      });
    }

    for (const pay of payments) {
      items.push({
        id: `payment:${pay.id}`,
        kind: 'payment',
        title: '💳 دفعة',
        subtitle: customerById.get(pay.customerId)?.name ?? '—',
        createdAt: toNumber(pay.createdAt),
      });
    }

    items.sort((a, b) => b.createdAt - a.createdAt);
    return items.slice(0, 10);
  }, [customers, invoices, payments, customerById]);

  const hasAnyData = customers.length > 0 || invoices.length > 0 || payments.length > 0;

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-4 py-6 sm:py-8">
      {/* Executive Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-emerald-200 dark:text-emerald-200/90">
          أنا داخل لوحة التحكم
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
          لوحة التحكم التنفيذية
        </h1>

        <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/80 leading-relaxed">
          نظرة شاملة على الأداء المالي للنشاط
        </p>
      </div>

      {/* Executive KPI Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FinCard className="p-5 bg-[#0B1018]/30 border border-white/10">
          <div className="text-xs text-slate-500 dark:text-slate-300/70">إجمالي العملاء</div>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold tabular-nums text-blue-600 dark:text-blue-300">
            {kpis.customersCount.toLocaleString('ar-SA')}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/70">Customers</div>
        </FinCard>

        <FinCard className="p-5 bg-[#0B1018]/30 border border-white/10">
          <div className="text-xs text-slate-500 dark:text-slate-300/70">إجمالي الفواتير</div>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
            {formatCurrency(kpis.invoicesTotal, { locale: 'ar-SA' })}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/70">Invoices</div>
        </FinCard>

        <FinCard className="p-5 bg-[#0B1018]/30 border border-white/10">
          <div className="text-xs text-slate-500 dark:text-slate-300/70">إجمالي المدفوعات</div>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold tabular-nums text-violet-700 dark:text-violet-300">
            {formatCurrency(kpis.paymentsTotal, { locale: 'ar-SA' })}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/70">Payments</div>
        </FinCard>

        <FinCard className="p-5 bg-[#0B1018]/30 border border-white/10">
          <div className="text-xs text-slate-500 dark:text-slate-300/70">الرصيد المستحق</div>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
            {formatCurrency(kpis.outstandingBalance, { locale: 'ar-SA' })}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-300/70">
            Invoices − Payments
          </div>
        </FinCard>
      </div>

      {/* Top customers + Latest activity */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <section className="lg:col-span-5">
          <Card className="p-5 bg-[#0B1018]/20 border border-white/10 rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">TOP CUSTOMERS</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  العملاء الأعلى رصيدًا
                </h2>
              </div>
            </div>

            {!loading && topCustomers.length === 0 ? (
              <div className="mt-4">
                <FinEmptyState
                  title="لا توجد بيانات بعد"
                  subtitle="ابدأ بإضافة عميل ثم فاتورة ومدفوعات لعرض الرصيد المستحق."
                  actionLabel="إضافة فواتير"
                  onAction={() => {
                    window.location.href = '/invoices';
                  }}
                />
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {topCustomers.map((c, idx) => (
                  <div
                    key={c.id}
                    className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 px-4 py-3 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {idx + 1}. {c.name}
                      </div>
                    </div>
                    <div className="text-sm font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
                      {formatCurrency(c.outstanding, { locale: 'ar-SA' })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </section>

        <section className="lg:col-span-7">
          <Card className="p-5 bg-[#0B1018]/20 border border-white/10 rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">LATEST ACTIVITY</div>
                <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  أحدث التحديثات
                </h2>
              </div>
            </div>

            {!loading && timeline.length === 0 ? (
              <div className="mt-4">
                <FinEmptyState
                  title="لا توجد أنشطة بعد"
                  subtitle="ابدأ بإنشاء عميل أو فاتورة أو دفع لبدء ظهور السجل الزمني."
                  actionLabel="إضافة فاتورة"
                  onAction={() => {
                    window.location.href = '/invoices';
                  }}
                />
              </div>
            ) : (
              <div className="mt-4">
                <div className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 overflow-hidden">
                  <ul className="divide-y divide-white/5">
                    {timeline.map((it) => (
                      <li
                        key={it.id}
                        className="px-4 py-3 flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {it.title}
                          </div>
                          <div className="mt-1 text-xs text-slate-600 dark:text-slate-300/70 truncate">
                            {it.subtitle}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-300/70 whitespace-nowrap">
                          {formatDate(it.createdAt)}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </section>
      </div>

      {/* Financial Health */}
      <div className="mt-4">
        <Card className="p-5 bg-[#0B1018]/20 border border-white/10 rounded-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.10em] text-slate-500 uppercase">FINANCIAL HEALTH</div>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                الصحة المالية
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300/70">
                مؤشرات أساسية لفهم الوضع خلال ثوانٍ
              </p>
            </div>
          </div>

          {!loading && !hasAnyData ? (
            <div className="mt-4">
              <FinEmptyState
                title="لا توجد بيانات كافية"
                subtitle="عندما تتوفر بيانات العملاء والفواتير والمدفوعات ستظهر هذه المؤشرات فورًا."
                actionLabel="إضافة عميل"
                onAction={() => {
                  window.location.href = '/customers';
                }}
              />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 p-4">
                <div className="text-xs text-slate-500 dark:text-slate-300/70">Total Revenue</div>
                <div className="mt-2 text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                  {formatCurrency(kpis.invoicesTotal, { locale: 'ar-SA' })}
                </div>
              </div>

              <div className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 p-4">
                <div className="text-xs text-slate-500 dark:text-slate-300/70">Total Payments</div>
                <div className="mt-2 text-xl font-extrabold tabular-nums text-violet-700 dark:text-violet-300">
                  {formatCurrency(kpis.paymentsTotal, { locale: 'ar-SA' })}
                </div>
              </div>

              <div className="rounded-2xl bg-[#121A24]/40 ring-1 ring-white/8 p-4">
                <div className="text-xs text-slate-500 dark:text-slate-300/70">Outstanding Balance</div>
                <div className="mt-2 text-xl font-extrabold tabular-nums text-rose-700 dark:text-rose-300">
                  {formatCurrency(kpis.outstandingBalance, { locale: 'ar-SA' })}
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;


