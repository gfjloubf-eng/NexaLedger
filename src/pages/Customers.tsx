import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '../components/ui';
import FinCard from '../components/ui/FinCard';
import FinModal from '../components/ui/FinModal';

import { useAuth } from '../context/AuthProvider';
import type { Customer } from '../types/customer';
import {
  deleteCustomer,
  loadCustomers,
  saveCustomer,
  updateCustomer,
} from '../lib/customerPersistence';

type CustomerFormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
};

const EMPTY = {
  title: 'لا يوجد عملاء بعد',
  description: 'ابدأ بإضافة أول عميل لبناء قاعدة علاقات أعمالك.',
  actionLabel: 'إضافة عميل جديد',
} as const;

const initialForm: CustomerFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
  notes: '',
};

export default function Customers() {
  const { user } = useAuth();

  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerFormState>(initialForm);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [detailsTargetId, setDetailsTargetId] = useState<string | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const refresh = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const rows = await loadCustomers(user.id);
      setCustomers(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await refresh();
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);


  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;

    return customers.filter((c) => {
      const hay = `${c.name ?? ''} ${c.phone ?? ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [customers, query]);

  const activeDetailsCustomer = useMemo(() => {
    if (!detailsTargetId) return null;
    return customers.find((c) => c.id === detailsTargetId) ?? null;
  }, [customers, detailsTargetId]);

  const openAdd = () => {
    setIsEditMode(false);
    setEditCustomerId(null);
    setForm(initialForm);
    setIsCustomerModalOpen(true);
  };

  const openEdit = (c: Customer) => {
    setIsEditMode(true);
    setEditCustomerId(c.id);
    setForm({
      name: c.name ?? '',
      phone: c.phone ?? '',
      email: c.email ?? '',
      address: c.address ?? '',
      notes: c.notes ?? '',
    });
    setIsCustomerModalOpen(true);
  };

  const submit = async () => {
    if (!user?.id) return;

    const name = form.name.trim();
    const phone = form.phone.trim();

    if (!name || !phone) return;

    setLoading(true);
    try {
      if (!isEditMode || !editCustomerId) {
        await saveCustomer(user.id, {
          name,
          phone,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      } else {
        await updateCustomer(user.id, editCustomerId, {
          name,
          phone,
          email: form.email.trim() || undefined,
          address: form.address.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      }

      await refresh();
      setIsCustomerModalOpen(false);
      setForm(initialForm);
      setEditCustomerId(null);
      setIsEditMode(false);
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
      await deleteCustomer(user.id, deleteTargetId);
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
                أنا داخل قسم العملاء
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight">
              إدارة العملاء
            </h1>

            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200/80 leading-relaxed">
              إدارة بيانات العملاء وعلاقات الأعمال
            </p>
          </div>
        </div>
      </div>

      {/* Search + Add */}
      <FinCard className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">
              بحث عن عميل
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="الاسم، أو رقم الهاتف…"
              dir="rtl"
            />
          </div>

          <div>
            <Button type="button" className="w-full md:w-auto px-6 py-3" onClick={openAdd}>
              إضافة عميل
            </Button>
          </div>
        </div>
      </FinCard>

      {/* Empty */}
      {filteredCustomers.length === 0 && !loading ? (
        <FinCard className="p-8">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
              <span className="text-3xl" aria-hidden>
                ✦
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

            <Button type="button" className="px-7 py-3 rounded-2xl" onClick={openAdd}>
              {EMPTY.actionLabel}
            </Button>
          </div>
        </FinCard>
      ) : null}

      {/* List (cards) */}
      {filteredCustomers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCustomers.map((c) => (
            <FinCard key={c.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                    {c.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300/90">
                    {c.phone}
                  </div>

                  {c.email ? (
                    <div className="text-xs text-slate-500 dark:text-slate-300/70">{c.email}</div>
                  ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Button type="button" className="px-4 py-2 rounded-xl" onClick={() => {
                    setDetailsTargetId(c.id);
                    setIsDetailsModalOpen(true);
                  }}>
                    تفاصيل
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button type="button" variant="secondary" className="px-4 py-2 rounded-xl" onClick={() => openEdit(c)}>
                      تعديل
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-200 hover:bg-rose-500/15"
                      onClick={() => openDelete(c.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-300/70">
                تاريخ الإنشاء: {new Date(c.createdAt).toLocaleDateString('ar-SA')}
              </div>
            </FinCard>
          ))}
        </div>
      ) : null}

      {/* Add/Edit Modal */}
      <FinModal
        isOpen={isCustomerModalOpen}
        onClose={() => {
          setIsCustomerModalOpen(false);
          setForm(initialForm);
          setEditCustomerId(null);
          setIsEditMode(false);
        }}
        title={isEditMode ? 'تعديل العميل' : 'إضافة عميل'}
        description="أدخل بيانات العميل بدقة — يمكن تعديلها لاحقًا."
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">الاسم *</label>
            <Input value={form.name} dir="rtl" onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">رقم الهاتف *</label>
            <Input value={form.phone} dir="rtl" onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">البريد الإلكتروني</label>
            <Input value={form.email} dir="rtl" onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">العنوان</label>
            <Input value={form.address} dir="rtl" onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))} />
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-300/90 mb-2">ملاحظات</label>
            <Input value={form.notes} dir="rtl" onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCustomerModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={loading} aria-busy={loading}>
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
        description="سيتم حذف العميل من السجل."
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
        title="تفاصيل العميل"
        description="عرض معلومات العميل بشكل واضح."
      >
        {activeDetailsCustomer ? (
          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">الاسم</div>
              <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">{activeDetailsCustomer.name}</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">الهاتف</div>
              <div className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{activeDetailsCustomer.phone}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">البريد</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {activeDetailsCustomer.email ?? '—'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-sm text-slate-600 dark:text-slate-300/90">العنوان</div>
                <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                  {activeDetailsCustomer.address ?? '—'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-slate-600 dark:text-slate-300/90">ملاحظات</div>
              <div className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                {activeDetailsCustomer.notes ?? '—'}
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-300/70 pt-1">
              تاريخ الإنشاء: {new Date(activeDetailsCustomer.createdAt).toLocaleDateString('ar-SA')}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-600 dark:text-slate-300/90">لا توجد بيانات.</div>
        )}
      </FinModal>
    </div>
  );
}

