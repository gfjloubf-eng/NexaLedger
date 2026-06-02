import { useEffect, useMemo, useState } from 'react';

import FinCard from '../components/ui/FinCard';
import FinModal from '../components/ui/FinModal';
import { Button, Input } from '../components/ui';

import { useAuth } from '../context/AuthProvider';

import type { Customer } from '../types/customer';
import type { Invoice } from '../types/invoice';
import type { Payment } from '../types/payment';

import { loadCustomers } from '../lib/customerPersistence';
import { loadInvoices } from '../lib/invoicePersistence';
import { loadPayments } from '../lib/paymentPersistence';

import { buildCustomerStatements, invoiceTimelineAmount, paymentTimelineAmount } from '../systems/smart-statements/statementEngine';

import type { StatementTimelineItem } from '../systems/smart-statements/statementTypes';

import { formatCurrency } from '../utils/formatCurrency';

const EMPTY = {
  title: 'لا توجد بيانات كشف حساب',
  description: 'أضف عملاء وفواتير ومدفوعات لبدء إنشاء كشوف الحساب.',
  actionLabel: 'عرض العملاء',
} as const;



type StatementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
  statement: ReturnType<typeof buildCustomerStatements>[number] | null;
};

function StatementModal({ isOpen, onClose, customer, statement }: StatementModalProps) {
  const latest = statement?.latestActivity ?? null;

  const renderTimelineRow = (item: StatementTimelineItem) => {
    if (item.kind === 'invoice') {
      const overdue = item.overdue;
      const signAmount = invoiceTimelineAmount(item.amount);

      return (
        <div
          key={item.id}
          className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
        >
          <div className="space-y-1">
            <div
              className={
                'text-sm font-semibold ' +
                (overdue ? 'text-amber-500 dark:text-amber-300' : 'text-emerald-500 dark:text-emerald-300')
              }
            >
              📄 فاتورة #{item.invoiceNumber}
            </div>
            <div className="text-xs text-slate-900 dark:text-white">
              {overdue ? 'متأخرة' : 'نشطة'}
            </div>
          </div>

          <div className={"text-sm font-extrabold tabular-nums " + (overdue ? 'text-amber-500 dark:text-amber-300' : 'text-emerald-500 dark:text-emerald-300')}>
            +{formatCurrency(signAmount, { locale: 'ar-SA' })}
          </div>
        </div>
      );
    }

    const signAmount = paymentTimelineAmount(item.amount);
    return (
      <div
        key={item.id}
        className="flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
      >
        <div className="space-y-1">
          <div className="text-sm font-semibold text-blue-500 dark:text-blue-300">💳 دفعة</div>
          <div className="text-xs text-slate-900 dark:text-white">مدفوعات</div>
        </div>
        <div className="text-sm font-extrabold tabular-nums text-blue-500 dark:text-blue-300">
          {signAmount < 0 ? '-' : ''}{formatCurrency(Math.abs(signAmount), { locale: 'ar-SA' })}
        </div>
      </div>
    );
  };

  return (
    <FinModal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? 'كشف الحساب' : 'كشف الحساب'}
      description="عرض الرصيد والحركة المالية الكاملة للعملاء"
      className="max-w-3xl"
    >
      {statement && customer ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="text-sm text-slate-900 dark:text-white">اسم العميل</div>
            <div className="mt-1 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {customer.name}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-900 dark:text-white">إجمالي الفواتير</div>
              <div className="mt-1 text-lg font-extrabold tabular-nums text-blue-500 dark:text-blue-300">
                {formatCurrency(statement.totals.totalInvoices, { locale: 'ar-SA' })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="text-xs text-slate-900 dark:text-white">إجمالي المدفوعات</div>
              <div className="mt-1 text-lg font-extrabold tabular-nums text-emerald-500 dark:text-emerald-300">
                {formatCurrency(statement.totals.totalPayments, { locale: 'ar-SA' })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2">
              <div className="text-xs text-slate-900 dark:text-white">الرصيد الحالي</div>
              <div
                className="mt-1 text-2xl font-extrabold tabular-nums text-rose-500 dark:text-rose-300"
              >
                {formatCurrency(statement.totals.outstandingBalance, { locale: 'ar-SA' })}
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-sm font-extrabold text-slate-900 dark:text-white">الزمنية الموحدة</div>
            {statement.timeline.length ? (
              <div className="space-y-3">
                {statement.timeline.map(renderTimelineRow)}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-slate-900 dark:text-white">
                لا توجد فواتير أو دفعات لهذا العميل.
              </div>
            )}
          </div>

          {latest ? null : null}
        </div>
      ) : (
        <div className="text-sm text-slate-900 dark:text-white">لا توجد بيانات.</div>
      )}
    </FinModal>
  );
}

export default function Statements() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsCustomerId, setDetailsCustomerId] = useState<string | null>(null);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [rowsCustomers, rowsInvoices, rowsPayments] = await Promise.all([
        loadCustomers(user.id),
        loadInvoices(user.id),
        loadPayments(user.id),
      ]);
      setCustomers(rowsCustomers);
      setInvoices(rowsInvoices);
      setPayments(rowsPayments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!user?.id) return;
      await refresh();
      if (cancelled) return;
    };
    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const statements = useMemo(() => {
    if (!customers.length) return [];
    const nowMs = Date.now();
    return buildCustomerStatements({ customers, invoices, payments, nowMs });
  }, [customers, invoices, payments]);





  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statements;

    return statements.filter((s) => {
      const hay = `${s.customer.name ?? ''} ${s.customer.phone ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [statements, query]);

  const hasAnyFinancialData = invoices.length > 0 || payments.length > 0;

  const activeStatement = useMemo(() => {
    if (!detailsCustomerId) return null;
    return statements.find((s) => s.customer.id === detailsCustomerId) ?? null;
  }, [statements, detailsCustomerId]);

  const activeCustomer = activeStatement?.customer ?? null;

  const overviewLatestLabel = (statement: (typeof statements)[number]) => {
    if (!statement.latestActivity) return 'لا نشاط';
    const item = statement.latestActivity;
    if (item.kind === 'invoice') return item.overdue ? 'فاتورة متأخرة' : 'فاتورة جديدة';
    return 'دفعة جديدة';
  };

  const openDetails = (customerId: string) => {
    setDetailsCustomerId(customerId);
    setDetailsOpen(true);
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-0 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-emerald-200 dark:text-emerald-400"
                aria-hidden="true"
              >
                أنا داخل كشف الحساب
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
              كشف الحساب
            </h1>
            <p className="text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">
              عرض الرصيد والحركة المالية الكاملة للعملاء
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <FinCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-900 dark:text-white mb-2">بحث عن عميل</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="اسم العميل أو رقم الهاتف…"
              dir="rtl"
            />
          </div>
          <div>
            <Button
              type="button"
              className="w-full md:w-auto px-6 py-3"
              onClick={() => {
                setQuery('');
              }}
              variant="secondary"
            >
              إعادة ضبط
            </Button>
          </div>
        </div>
      </FinCard>

      {/* Empty */}
      {filtered.length === 0 && !loading ? (
        <FinCard className="p-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <span className="text-3xl" aria-hidden>
                🧾
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {EMPTY.title}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-900 dark:text-white leading-relaxed">
                {EMPTY.description}
              </p>
            </div>

            <Button type="button" className="px-7 py-3 rounded-2xl" onClick={() => { window.location.href = '/customers'; }}>
              {EMPTY.actionLabel}
            </Button>
          </div>
        </FinCard>
      ) : null}

      {/* Results */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((s) => {
            const overdueCount = s.timeline.filter((t) => t.kind === 'invoice' && t.overdue).length;
            const latestLabel = overviewLatestLabel(s);

            return (
              <FinCard key={s.customer.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                      {s.customer.name}
                    </div>
                    <div className="text-sm text-slate-900 dark:text-white">
                      {s.customer.phone ?? '—'}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button
                      type="button"
                      className="px-4 py-2 rounded-xl"
                      onClick={() => openDetails(s.customer.id)}
                    >
                      عرض كشف الحساب
                    </Button>
                    {overdueCount > 0 ? (
                      <div className="inline-flex items-center rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 dark:text-amber-300">
                        {overdueCount} فواتير متأخرة
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Overview cards */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-900 dark:text-white">إجمالي الفواتير</div>
                      <div className="text-xs font-semibold text-blue-500 dark:text-blue-300">Blue</div>
                    </div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-blue-500 dark:text-blue-300">
                      {formatCurrency(s.totals.totalInvoices, { locale: 'ar-SA' })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-900 dark:text-white">إجمالي المدفوعات</div>
                      <div className="text-xs font-semibold text-emerald-500 dark:text-emerald-300">Emerald</div>
                    </div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-emerald-500 dark:text-emerald-300">
                      {formatCurrency(s.totals.totalPayments, { locale: 'ar-SA' })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-900 dark:text-white">الرصيد المستحق</div>
                      <div className="text-xs font-semibold text-rose-500 dark:text-rose-300">Rose</div>
                    </div>
                    <div className="mt-1 text-xl font-extrabold tabular-nums text-rose-500 dark:text-rose-300">
                      {formatCurrency(s.totals.outstandingBalance, { locale: 'ar-SA' })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs text-slate-900 dark:text-white">آخر نشاط</div>
                      <div className="text-xs font-semibold text-amber-500 dark:text-amber-300">Amber</div>
                    </div>
                    <div className="mt-1 text-sm font-extrabold text-amber-500 dark:text-amber-300">
                      {latestLabel}
                    </div>
                  </div>
                </div>

                {/* Preview timeline */}
                <div className="mt-4 space-y-3">
                  {s.timeline.slice(0, 3).map((item) => {
                    if (item.kind === 'invoice') {
                      const overdue = item.overdue;
                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                        >
                          <div className="text-sm font-semibold">
                            <span className={overdue ? 'text-amber-500 dark:text-amber-300' : 'text-emerald-500 dark:text-emerald-300'}>
                              📄 فاتورة #{item.invoiceNumber}
                            </span>
                          </div>
                          <div className={overdue ? 'text-sm font-extrabold tabular-nums text-amber-500 dark:text-amber-300' : 'text-sm font-extrabold tabular-nums text-emerald-500 dark:text-emerald-300'}>
                            +{formatCurrency(item.amount, { locale: 'ar-SA' })}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.02] p-4"
                      >
                        <div className="text-sm font-semibold text-blue-500 dark:text-blue-300">💳 دفعة</div>
                        <div className="text-sm font-extrabold tabular-nums text-blue-500 dark:text-blue-300">
                          -{formatCurrency(item.amount, { locale: 'ar-SA' })}
                        </div>
                      </div>
                    );
                  })}

                  {s.timeline.length > 3 ? (
                    <div className="text-xs text-slate-900 dark:text-white text-center">… عرض المزيد داخل كشف الحساب</div>
                  ) : null}
                </div>
              </FinCard>
            );
          })}
        </div>
      ) : null}

      {/* Details Modal */}
      <StatementModal
        isOpen={detailsOpen}
        onClose={() => {
          setDetailsOpen(false);
          setDetailsCustomerId(null);
        }}
        customer={activeCustomer}
        statement={activeStatement}
      />

      {/* Hidden but keep jsx tidy */}
      {hasAnyFinancialData ? null : null}
    </div>
  );
}

