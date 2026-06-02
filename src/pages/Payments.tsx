import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '../components/ui';
import FinCard from '../components/ui/FinCard';
import FinModal from '../components/ui/FinModal';

import { useAuth } from '../context/AuthProvider';
import type { Customer } from '../types/customer';
import type { Invoice } from '../types/invoice';
import type { Payment, PaymentMethod } from '../types/payment';
import {
  deletePayment,
  loadPayment,
  loadPayments,
  savePayment,
  updatePayment,
} from '../lib/paymentPersistence';
import { loadCustomers } from '../lib/customerPersistence';
import { loadInvoices } from '../lib/invoicePersistence';
import { formatCurrency } from '../utils/formatCurrency';

type PaymentFormState = {
  customerId: string;
  invoiceId?: string;
  amount: string;
  method: PaymentMethod;
  notes: string;
};

const EMPTY = {
  title: 'لا توجد مدفوعات بعد',
  description: 'ابدأ بإضافة أول دفعة مالية لتتبع التدفقات النقدية.',
  actionLabel: 'إضافة دفعة جديدة',
} as const;

const METHOD_META: Record<PaymentMethod, { label: string; className: string }> = {
  cash: {
    label: 'نقدًا',
    className:
      'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-200',
  },
  bank: {
    label: 'بنك',
    className:
      'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-200',
  },
  transfer: {
    label: 'تحويل',
    className:
      'bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-200',
  },
};

function safeAmount(input: string): number {
  const n = Number(String(input).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

export default function Payments() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const [queryCustomer, setQueryCustomer] = useState('');
  const [queryAmount, setQueryAmount] = useState('');

  const [loading, setLoading] = useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPaymentId, setEditPaymentId] = useState<string | null>(null);

  const [form, setForm] = useState<PaymentFormState>({
    customerId: '',
    invoiceId: undefined,
    amount: '',
    method: 'cash',
    notes: '',
  });

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [_, setDetailsTargetId] = useState<string | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsPayment, setDetailsPayment] = useState<Payment | null>(null);

  const customerById = useMemo(() => {
    const m = new Map<string, Customer>();
    for (const c of customers) m.set(c.id, c);
    return m;
  }, [customers]);

  const invoiceById = useMemo(() => {
    const m = new Map<string, Invoice>();
    for (const inv of invoices) m.set(inv.id, inv);
    return m;
  }, [invoices]);

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
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const filteredPayments = useMemo(() => {
    const qc = queryCustomer.trim().toLowerCase();
    const qa = queryAmount.trim();

    const amountQuery = qa ? safeAmount(qa) : null;

    return payments.filter((p) => {
      const customer = customerById.get(p.customerId);
      const customerName = customer?.name ?? '';

      const okCustomer = !qc
        ? true
        : customerName.toLowerCase().includes(qc);

      const okAmount = amountQuery === null
        ? true
        : p.amount === amountQuery;

      return okCustomer && okAmount;
    });
  }, [payments, queryCustomer, queryAmount, customerById]);

  const openAdd = () => {
    setIsEditMode(false);
    setEditPaymentId(null);

    setForm({
      customerId: customers[0]?.id ?? '',
      invoiceId: undefined,
      amount: '',
      method: 'cash',
      notes: '',
    });

    setIsPaymentModalOpen(true);
  };

  const openEdit = (p: Payment) => {
    setIsEditMode(true);
    setEditPaymentId(p.id);

    setForm({
      customerId: p.customerId,
      invoiceId: p.invoiceId ?? undefined,
      amount: String(p.amount),
      method: p.method,
      notes: p.notes ?? '',
    });

    setIsPaymentModalOpen(true);
  };

  const submit = async () => {
    if (!user?.id) return;

    const customerId = form.customerId;
    const amount = safeAmount(form.amount);

    if (!customerId) return;
    if (!amount || !Number.isFinite(amount)) return;

    setLoading(true);
    try {
      const payload = {
        customerId,
        invoiceId: form.invoiceId || undefined,
        amount,
        method: form.method,
        notes: form.notes.trim() || undefined,
      };

      if (!isEditMode || !editPaymentId) {
        await savePayment(user.id, payload);
      } else {
        await updatePayment(user.id, editPaymentId, payload);
      }

      await refresh();
      setIsPaymentModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const openDelete = (id: string) => {
    setDeleteTargetId(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!user?.id) return;
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await deletePayment(user.id, deleteTargetId);
      await refresh();
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDetails = async (id: string) => {
    setDetailsTargetId(id);
    if (!user?.id) return;
    const row = await loadPayment(user.id, id);
    setDetailsPayment(row);
    setIsDetailsModalOpen(true);
  };

  const invoiceOptionsForCustomer = useMemo(() => {
    const cid = form.customerId;
    if (!cid) return [];
    return invoices.filter((inv) => inv.customerId === cid);
  }, [form.customerId, invoices]);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-0 py-8 space-y-6">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-emerald-200 dark:text-emerald-200/90" aria-hidden="true">
                أنا داخل قسم المدفوعات
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
              إدارة المدفوعات
            </h1>

            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/80 leading-relaxed">
              تسجيل ومتابعة مدفوعات العملاء
            </p>
          </div>
        </div>
      </div>

      <FinCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">بحث عن عميل</label>
            <Input value={queryCustomer} onChange={(e) => setQueryCustomer(e.target.value)} placeholder="اسم العميل…" dir="rtl" />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">مبلغ</label>
            <Input value={queryAmount} onChange={(e) => setQueryAmount(e.target.value)} placeholder="مثال: 12500" dir="rtl" />
          </div>

          <div className="md:col-span-1">
            <Button type="button" className="w-full md:w-auto px-6 py-3" onClick={openAdd}>
              إضافة دفعة جديدة
            </Button>
          </div>
        </div>
      </FinCard>

      {filteredPayments.length === 0 && !loading ? (
        <FinCard className="p-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <span className="text-3xl" aria-hidden>
                💸
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{EMPTY.title}</h2>
              <p className="mt-2 text-sm md:text-base text-slate-700 dark:text-slate-200/80 leading-relaxed">{EMPTY.description}</p>
            </div>

            <Button type="button" className="px-7 py-3 rounded-2xl" onClick={openAdd}>
              {EMPTY.actionLabel}
            </Button>
          </div>
        </FinCard>
      ) : null}

      {filteredPayments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPayments.map((p) => {
            const customer = customerById.get(p.customerId);
            const methodMeta = METHOD_META[p.method];
            const dateLabel = new Date(p.createdAt).toLocaleDateString('ar-SA');

            return (
              <FinCard key={p.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-700 dark:text-white">{customer?.name ?? '—'}</div>

                    <div className="text-lg font-semibold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(p.amount, { locale: 'ar-SA' })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${methodMeta.className}`}>
                        {methodMeta.label}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 dark:text-white/90">
                      تاريخ الدفع: {dateLabel}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Button type="button" className="px-4 py-2 rounded-xl" onClick={() => void openDetails(p.id)}>
                      تفاصيل
                    </Button>

                    <div className="flex items-center gap-2">
                      <Button type="button" variant="secondary" className="px-4 py-2 rounded-xl" onClick={() => openEdit(p)}>
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 hover:bg-rose-500/15"
                        onClick={() => openDelete(p.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </FinCard>
            );
          })}
        </div>
      ) : null}

      <FinModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setIsEditMode(false);
          setEditPaymentId(null);
        }}
        title={isEditMode ? 'تعديل الدفع' : 'إضافة دفع'}
        description="أدخل بيانات الدفع بدقة — يمكن تعديلها لاحقًا."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">العميل *</label>
            <select
              className="w-full input mt-2"
              value={form.customerId}
              onChange={(e) => setForm((s) => ({ ...s, customerId: e.target.value, invoiceId: undefined }))}
              dir="rtl"
              aria-label="customer"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">فاتورة مرتبطة (اختياري)</label>
            <select
              className="w-full input mt-2"
              value={form.invoiceId ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, invoiceId: e.target.value || undefined }))}
              dir="rtl"
              aria-label="invoice"
            >
              <option value="">— بدون فاتورة —</option>
              {invoiceOptionsForCustomer.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">المبلغ *</label>
            <Input
              value={form.amount}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">طريقة الدفع</label>
            <select
              className="w-full input mt-2"
              value={form.method}
              onChange={(e) => setForm((s) => ({ ...s, method: e.target.value as PaymentMethod }))}
              dir="rtl"
              aria-label="method"
            >
              <option value="cash">نقدًا</option>
              <option value="bank">بنك</option>
              <option value="transfer">تحويل</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">ملاحظات</label>
            <Input
              value={form.notes}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="اختياري"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPaymentModalOpen(false);
                setIsEditMode(false);
                setEditPaymentId(null);
              }}
            >
              إلغاء
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={loading} aria-busy={loading}>
              {isEditMode ? 'حفظ التعديل' : 'إضافة'}
            </Button>
          </div>
        </div>
      </FinModal>

      <FinModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        title="تأكيد الإزالة"
        description="سيتم حذف عملية الدفع من السجل."
        className="max-w-lg"
      >
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setIsDeleteModalOpen(false);
              setDeleteTargetId(null);
            }}
          >
            تراجع
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            aria-busy={isDeleting}
            onClick={() => void confirmDelete()}
            className="bg-rose-500/15 border border-rose-400/20 text-rose-200 hover:bg-rose-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            حذف
          </Button>
        </div>
      </FinModal>

      <FinModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsTargetId(null);
          setDetailsPayment(null);
        }}
        title="تفاصيل الدفع"
        description="عرض معلومات عملية الدفع بالكامل."
      >
        {detailsPayment ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-900 dark:text-white">العميل</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {customerById.get(detailsPayment.customerId)?.name ?? '—'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-900 dark:text-white">المبلغ</div>
              <div className="mt-1 text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(detailsPayment.amount, { locale: 'ar-SA' })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-900 dark:text-white">طريقة الدفع</div>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${METHOD_META[detailsPayment.method].className}`}
                  >
                    {METHOD_META[detailsPayment.method].label}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-900 dark:text-white">التاريخ</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {new Date(detailsPayment.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-900 dark:text-white">الفاتورة المرتبطة</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {detailsPayment.invoiceId
                  ? invoiceById.get(detailsPayment.invoiceId)?.invoiceNumber ?? '—'
                  : '—'}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-900 dark:text-white">ملاحظات</div>
              <div className="mt-1 text-sm text-slate-900 dark:text-white">
                {detailsPayment.notes ?? '—'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-900 dark:text-white">لا توجد بيانات.</div>
        )}
      </FinModal>
    </div>
  );
}

