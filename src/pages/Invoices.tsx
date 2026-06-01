import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '../components/ui';
import FinCard from '../components/ui/FinCard';
import FinModal from '../components/ui/FinModal';


import { useAuth } from '../context/AuthProvider';
import type { Customer } from '../types/customer';
import type { Invoice, InvoiceStatus } from '../types/invoice';
import { formatCurrency } from '../utils/formatCurrency';

import {
  deleteInvoice,
  loadInvoices,
  saveInvoice,
  updateInvoice,
} from '../lib/invoicePersistence';
import { loadCustomers } from '../lib/customerPersistence';

type InvoiceFormState = {
  customerId: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string; // YYYY-MM-DD
  notes: string;
  status: InvoiceStatus;
};

const STATUS_META: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: {
    label: 'مسودة',
    className:
      'bg-slate-500/10 border border-slate-500/20 text-slate-200 dark:text-slate-200',
  },
  unpaid: {
    label: 'غير مدفوعة',
    className:
      'bg-amber-500/10 border border-amber-500/20 text-amber-100 dark:text-amber-100',
  },
  paid: {
    label: 'مدفوعة',
    className:
      'bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 dark:text-emerald-100',
  },
};

const EMPTY = {
  title: 'لا توجد فواتير بعد',
  description: 'ابدأ بإنشاء أول فاتورة لتنظيم عملياتك المالية.',
  actionLabel: 'إنشاء فاتورة جديدة',
} as const;

function toDueDateMs(input: string): number | undefined {
  const v = input.trim();
  if (!v) return undefined;
  const ms = new Date(v + 'T00:00:00').getTime();
  return Number.isFinite(ms) ? ms : undefined;
}

function safeAmount(input: string): number {
  const n = Number(String(input).replace(/,/g, '').trim());
  return Number.isFinite(n) ? n : 0;
}

function statusBadge(status: InvoiceStatus) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${STATUS_META[status].className}`}
    >
      {STATUS_META[status].label}
    </span>
  );
}

export default function Invoices() {
  const { user } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  const [query, setQuery] = useState('');

  // Add/Edit
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [form, setForm] = useState<InvoiceFormState>({
    customerId: '',
    invoiceNumber: '',
    amount: '',
    dueDate: '',
    notes: '',
    status: 'unpaid',
  });

  // Delete
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Details
  const [detailsTargetId, setDetailsTargetId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const customerById = useMemo(() => {
    const m = new Map<string, Customer>();
    for (const c of customers) m.set(c.id, c);
    return m;
  }, [customers]);

  const activeDetailsInvoice = useMemo(() => {
    if (!detailsTargetId) return null;
    return invoices.find((i) => i.id === detailsTargetId) ?? null;
  }, [invoices, detailsTargetId]);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [rowsCustomers, rowsInvoices] = await Promise.all([
        loadCustomers(user.id),
        loadInvoices(user.id),
      ]);
      setCustomers(rowsCustomers);
      setInvoices(rowsInvoices);
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

  const filteredInvoices = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return invoices;

    return invoices.filter((inv) => {
      const customer = customerById.get(inv.customerId);
      const customerName = customer?.name ?? '';
      const hay = `${inv.invoiceNumber} ${customerName}`.toLowerCase();
      return hay.includes(q);
    });
  }, [invoices, query, customerById]);

  const openAdd = () => {
    setIsEditMode(false);
    setEditInvoiceId(null);
    setForm({
      customerId: customers[0]?.id ?? '',
      invoiceNumber: '',
      amount: '',
      dueDate: '',
      notes: '',
      status: 'unpaid',
    });
    setIsInvoiceModalOpen(true);
  };

  const openEdit = (inv: Invoice) => {
    const dueDate = inv.dueDate
      ? new Date(inv.dueDate).toISOString().slice(0, 10)
      : '';

    setIsEditMode(true);
    setEditInvoiceId(inv.id);
    setForm({
      customerId: inv.customerId,
      invoiceNumber: inv.invoiceNumber,
      amount: String(inv.amount),
      dueDate,
      notes: inv.notes ?? '',
      status: inv.status,
    });
    setIsInvoiceModalOpen(true);
  };

  const submit = async () => {
    if (!user?.id) return;

    const customerId = form.customerId;
    const invoiceNumber = form.invoiceNumber.trim();
    const amount = safeAmount(form.amount);

    if (!customerId || !invoiceNumber) return;

    setLoading(true);
    try {
      const dueDateMs = toDueDateMs(form.dueDate);

      if (!isEditMode || !editInvoiceId) {
        await saveInvoice(user.id, {
          customerId,
          invoiceNumber,
          amount,
          status: form.status,
          dueDate: dueDateMs,
          notes: form.notes.trim() || undefined,
        });
      } else {
        await updateInvoice(user.id, editInvoiceId, {
          customerId,
          invoiceNumber,
          amount,
          status: form.status,
          dueDate: dueDateMs,
          notes: form.notes.trim() || undefined,
        });
      }

      await refresh();
      setIsInvoiceModalOpen(false);
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
      await deleteInvoice(user.id, deleteTargetId);
      await refresh();
      setIsDeleteModalOpen(false);
      setDeleteTargetId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div dir="rtl" className="max-w-7xl mx-auto px-2 sm:px-0 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-xs text-emerald-200 dark:text-emerald-200/90"
                aria-hidden="true"
              >
                أنا داخل قسم الفواتير
              </span>
            </div>

            <h1
              className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight"
            >
              إدارة الفواتير
            </h1>

            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/80 leading-relaxed">
              إدارة فواتير العملاء ومتابعة المستحقات
            </p>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <FinCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              بحث عن فاتورة أو عميل
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="رقم الفاتورة، أو اسم العميل…"
              dir="rtl"
            />
          </div>

          <div>
            <Button
              type="button"
              className="w-full md:w-auto px-6 py-3"
              onClick={openAdd}
            >
              إضافة فاتورة
            </Button>
          </div>
        </div>
      </FinCard>

      {/* Empty */}
      {filteredInvoices.length === 0 && !loading ? (
        <FinCard className="p-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <span className="text-3xl" aria-hidden>
                🧾
              </span>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {EMPTY.title}
              </h2>
              <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300/85 leading-relaxed">
                {EMPTY.description}
              </p>
            </div>

            <Button
              type="button"
              className="px-7 py-3 rounded-2xl"
              onClick={openAdd}
            >
              {EMPTY.actionLabel}
            </Button>
          </div>
        </FinCard>
      ) : null}

      {/* List */}
      {filteredInvoices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredInvoices.map((inv) => {
            const customer = customerById.get(inv.customerId);
            const dueLabel = inv.dueDate
              ? new Date(inv.dueDate).toLocaleDateString('ar-SA')
              : '—';

            return (
              <FinCard key={inv.id} className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="text-sm text-slate-500 dark:text-slate-300/70">
                      رقم الفاتورة
                    </div>
                    <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber}
                    </div>

                    <div className="text-sm text-slate-600 dark:text-slate-300/90">
                      {customer?.name ?? '—'}
                    </div>

                    <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-200 tabular-nums">
                      {formatCurrency(inv.amount, { locale: 'ar-SA' })}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {statusBadge(inv.status)}

                    <div className="text-xs text-slate-500 dark:text-slate-300/70">
                      تاريخ الاستحقاق: {dueLabel}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-4 py-2 rounded-xl"
                        onClick={() => openEdit(inv)}
                      >
                        تعديل
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 hover:bg-rose-500/15"
                        onClick={() => openDelete(inv.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    className="px-4 py-2 rounded-xl"
                    onClick={() => {
                      setDetailsTargetId(inv.id);
                      setIsDetailsModalOpen(true);
                    }}
                  >
                    تفاصيل
                  </Button>

                  <div className="text-xs text-slate-500 dark:text-slate-300/70">
                    تاريخ الإنشاء: {new Date(inv.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              </FinCard>
            );
          })}
        </div>
      ) : null}

      {/* Add/Edit Modal */}
      <FinModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setIsEditMode(false);
          setEditInvoiceId(null);
        }}
        title={isEditMode ? 'تعديل الفاتورة' : 'إضافة فاتورة'}
        description="أدخل بيانات الفاتورة بدقة — يمكن تعديلها لاحقًا."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              العميل *
            </label>
            <select
              className="w-full input mt-2"
              value={form.customerId}
              onChange={(e) => setForm((s) => ({ ...s, customerId: e.target.value }))}
              aria-label="customer"
              dir="rtl"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              مبلغ *
            </label>
            <Input
              value={form.amount}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, amount: e.target.value }))}
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              تاريخ الاستحقاق
            </label>
            <Input
              value={form.dueDate}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, dueDate: e.target.value }))}
              type="date"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              ملاحظات
            </label>
            <Input
              value={form.notes}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
              placeholder="اختياري"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              رقم الفاتورة *
            </label>
            <Input
              value={form.invoiceNumber}
              dir="rtl"
              onChange={(e) => setForm((s) => ({ ...s, invoiceNumber: e.target.value }))}
              placeholder="مثال: INV-2026-001"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              الحالة
            </label>
            <select
              className="w-full input mt-2"
              value={form.status}
              onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as InvoiceStatus }))}
              aria-label="status"
              dir="rtl"
            >
              <option value="draft">مسودة</option>
              <option value="unpaid">غير مدفوعة</option>
              <option value="paid">مدفوعة</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsInvoiceModalOpen(false);
                setIsEditMode(false);
                setEditInvoiceId(null);
              }}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              onClick={() => void submit()}
              disabled={loading}
              aria-busy={loading}
            >
              {isEditMode ? 'حفظ التعديل' : 'إضافة'}
            </Button>
          </div>
        </div>
      </FinModal>

      {/* Delete Modal */}
      <FinModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteTargetId(null);
        }}
        title="تأكيد الإزالة"
        description="سيتم حذف الفاتورة من السجل."
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

      {/* Details Modal */}
      <FinModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setDetailsTargetId(null);
        }}
        title="تفاصيل الفاتورة"
        description="عرض معلومات الفاتورة بالكامل."
      >
        {activeDetailsInvoice ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">رقم الفاتورة</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                {activeDetailsInvoice.invoiceNumber}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">العميل</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                {customerById.get(activeDetailsInvoice.customerId)?.name ?? '—'}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">المبلغ</div>
                <div className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-200 tabular-nums">
                  {formatCurrency(activeDetailsInvoice.amount, { locale: 'ar-SA' })}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">الحالة</div>
                <div className="mt-1">{statusBadge(activeDetailsInvoice.status)}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">تاريخ الإنشاء</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {new Date(activeDetailsInvoice.createdAt).toLocaleDateString('ar-SA')}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">تاريخ الاستحقاق</div>
                <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {activeDetailsInvoice.dueDate
                    ? new Date(activeDetailsInvoice.dueDate).toLocaleDateString('ar-SA')
                    : '—'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">ملاحظات</div>
              <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {activeDetailsInvoice.notes ?? '—'}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300/90">لا توجد بيانات.</div>
        )}
      </FinModal>
    </div>
  );
}

