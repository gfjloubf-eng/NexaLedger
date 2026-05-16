import React, { useMemo, useRef, useState } from 'react';

import { useTransactions } from '../context/TransactionContext';
import { parseQuickAdd } from '../utils/transactionParser';
import { TRANSACTION_CATEGORIES } from '../config/transactionCategories';
import type { TransactionCategory, TransactionType } from '../types/transaction';
import { formatCurrency } from '../utils/formatCurrency';
import { Button, Input, Card } from '../components/ui';

type CategoryFilterValue = 'all' | TransactionCategory;

type ToastKind = 'success' | 'error';

type ToastState = { kind: ToastKind; message: string } | null;

const CATEGORY_OPTIONS: Array<{ value: CategoryFilterValue; label: string }> = [
  { value: 'all', label: 'الكل' },
  { value: 'راتب', label: 'راتب' },
  { value: 'طعام', label: 'طعام' },
  { value: 'مواصلات', label: 'مواصلات' },
  { value: 'تسوق', label: 'تسوق' },
  { value: 'فواتير', label: 'فواتير' },
  { value: 'عام', label: 'عام' },
];

const isCategory = (c: string): c is TransactionCategory => {
  return (TRANSACTION_CATEGORIES as readonly string[]).includes(c);
};

const categoryIcon = (category: string) => {
  switch (category) {
    case 'راتب':
      return '💼';
    case 'طعام':
      return '🍽️';
    case 'مواصلات':
      return '🚌';
    case 'تسوق':
      return '🛍️';
    case 'فواتير':
      return '🧾';
    case 'عام':
      return '✨';
    default:
      return '🏷️';
  }
};

const formatAmount = (amount: number) => {
  // Centralized currency formatting util — keeps formatting consistent and localizable.
  return formatCurrency(amount, { locale: 'ar-SA', currency: 'SAR' });
};

const typeBadge = (type: TransactionType) => {
  if (type === 'income') {
    return {
      label: 'دخل',
      className:
        'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/20',
    };
  }

  return {
    label: 'مصروف',
    className:
      'bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/20',
  };
};

const SkeletonRow = () => {
  return (
    <div
      className="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between"
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-3.5 w-36 rounded bg-white/10" />
          <div className="h-3 w-24 rounded bg-white/10" />
        </div>
      </div>
      <div className="h-3.5 w-28 rounded bg-white/10" />
    </div>
  );
};

const Transactions: React.FC = () => {
  const { transactions, addTransaction, deleteTransaction } =
    useTransactions();

  const [quickInput, setQuickInput] = useState('');
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] =
    useState<CategoryFilterValue>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  const showToast = (next: ToastState) => {
    setToast(next);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2600);
  };

  const handleQuickAdd = async () => {
    const parsed = parseQuickAdd(quickInput);
    if (!parsed) {
      showToast({
        kind: 'error',
        message: 'جرّب صيغة مثل: 250 طعام',
      });
      return;
    }

    if (!Number.isFinite(parsed.amount) || parsed.amount <= 0) {
      showToast({
        kind: 'error',
        message: 'المبلغ غير صالح',
      });
      return;
    }

    const category: TransactionCategory = isCategory(parsed.category)
      ? parsed.category
      : 'عام';

    const type: TransactionType = parsed.type;

    try {
      console.log('Transactions form submit: calling addTransaction with', {
        id: crypto.randomUUID(),
        title: parsed.title,
        amount: parsed.amount,
        type,
        category,
      });
      await addTransaction({
        id: crypto.randomUUID(),
        title: parsed.title,
        amount: parsed.amount,
        type,
        category,
      });

      setQuickInput('');
      showToast({ kind: 'success', message: 'تمت الإضافة' });
    } catch (error) {
      console.error('Transactions form submit caught error:', error);
      showToast({
        kind: 'error',
        message: 'تعذر حفظ العملية',
      });
    }
  };

  const filteredTransactions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return transactions.filter((tx) => {
      const matchesCategory =
        categoryFilter === 'all' ? true : tx.category === categoryFilter;
      if (!matchesCategory) return false;

      const matchesType = typeFilter === 'all' ? true : tx.type === typeFilter;
      if (!matchesType) return false;

      if (!q) return true;
      const haystack = `${tx.title ?? ''} ${tx.category ?? ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [transactions, searchQuery, categoryFilter, typeFilter]);

  const handleDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      showToast({ kind: 'success', message: 'تم الحذف' });
    } catch {
      showToast({ kind: 'error', message: 'تعذر حذف العملية' });
    }
  };

  const hasData = filteredTransactions.length > 0;
  const hasAnyTx = transactions.length > 0;

  return (
    <div dir="rtl" className="max-w-6xl mx-auto space-y-7 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 to-emerald-400 bg-clip-text text-transparent">
            المعاملات
          </h1>
          <p className="mt-2 text-slate-300 text-sm">
            بحث سريع، فلترة ذكية، وإضافات فورية — بأسلوب احترافي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2">
            <span className="text-slate-300 text-sm">عدد المعاملات</span>
            <span className="text-slate-100 font-semibold">
              {transactions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Premium AI + Smart Analytics (visual only) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-[#94A3B8]">تحليلات ذكية</div>
              <div className="text-lg font-semibold mt-1 text-[#F8FAFC]">توصية لتحسين التدفق النقدي</div>
              <div className="text-sm text-[#94A3B8] mt-2">تصنيفات وتحليلات خفيفة لتبدأ بها — بدون تعقيد.</div>
            </div>
            <div className="rounded-2xl bg-white/3 ring-1 ring-white/6 px-4 py-3">
              <div className="text-xs text-[#94A3B8]">Analytics</div>
              <div className="text-sm font-semibold text-[#F8FAFC] mt-1">قيد التحضير…</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'تصفية مصروفات الطعام' },
              { label: 'اكتشاف ارتفاع الإنفاق' },
              { label: 'تنبيه ميزانية' },
            ].map((x) => (
              <span key={x.label} className="px-3 py-1 rounded-full text-xs bg-white/3 text-[#F8FAFC]">{x.label}</span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-[#94A3B8]">الحالة المالية</div>
          <div className="text-3xl font-semibold mt-2 text-[#F8FAFC]">92</div>
          <div className="text-xs text-[#94A3B8] mt-1">مؤشر مبسط — بناءً على النشاط الحديث.</div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[92%] bg-[#2563EB]" />
            </div>
          </div>
          <div className="mt-4 text-xs text-[#94A3B8]">* مؤقت — سيربط لاحقًا بالتحليلات.</div>
        </Card>
      </div>

      {/* Filters + Search */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-[#94A3B8] mb-2">بحث بالاسم/الفئة</label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمعنى…"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs text-[#94A3B8] mb-2">النوع</label>
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as 'all' | 'income' | 'expense')
              }
              className="input"
              dir="rtl"
            >
              <option value="all">الكل</option>
              <option value="income">دخل</option>
              <option value="expense">مصروف</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs text-[#94A3B8] mb-2">الفئة</label>
            <select
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value as CategoryFilterValue)
              }
              className="input"
              dir="rtl"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:flex-0 md:w-auto">
            <label className="block text-xs text-[#94A3B8] mb-2">إجراء</label>
            <Button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('all');
                setTypeFilter('all');
                showToast({ kind: 'success', message: 'تمت إعادة الضبط' });
              }}
              className="w-full md:w-48 btn-ghost"
            >
              إعادة ضبط
            </Button>
          </div>

          <div className="md:flex-0 md:w-auto">
            <label className="block text-xs text-[#94A3B8] mb-2">تصدير</label>
            <Button
              type="button"
              onClick={() =>
                showToast({
                  kind: 'success',
                  message: 'زر التصدير — UI فقط',
                })
              }
              variant="secondary"
              className="w-full md:w-48"
            >
              تصدير
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Add */}
      <Card className="relative p-5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_0%,rgba(59,130,246,0.06),transparent_70%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.04),transparent_70%)] mix-blend-overlay pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <div className="text-sm text-[#94A3B8]">إضافة سريعة</div>
            <div className="text-lg font-semibold text-[#F8FAFC] mt-1">اكتب مثلاً: 250 طعام أو coffee 25</div>
            <div className="mt-3">
              <Input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="مثال: 250 طعام أو coffee 25"
                dir="rtl"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') void handleQuickAdd();
                }}
              />
            </div>
          </div>

          <div className="lg:w-56">
            <label className="block text-xs text-[#94A3B8] mb-2">&nbsp;</label>
            <Button
              onClick={() => void handleQuickAdd()}
              disabled={!quickInput.trim()}
              className="w-full py-4"
            >
              إضافة
            </Button>
          </div>
        </div>

        <div className="relative mt-3 flex items-center justify-between gap-3">
          <div className="text-xs text-[#94A3B8]">دعم إضافة سريعة بدون تعقيد.</div>
          {toast ? (
            <div className={`text-sm font-semibold ${toast.kind === 'success' ? 'text-emerald-200' : 'text-rose-200'}`}>{toast.message}</div>
          ) : (
            <div className="text-xs text-slate-500">&nbsp;</div>
          )}
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-[#94A3B8]">قائمة المعاملات</div>
            <div className="text-lg font-semibold text-[#F8FAFC] mt-1 tracking-tight">{hasAnyTx ? 'عرض سريع ومُرتّب' : 'ابدأ بإضافة معاملات'}</div>
          </div>
          <div className="text-xs text-[#94A3B8] tabular-nums">{filteredTransactions.length} نتيجة</div>
        </div>



        {!hasData ? (
          <div className="py-12">
            <div className="mx-auto max-w-md text-center">
              <div className="text-5xl leading-none">🔎</div>
              <div className="mt-4 text-lg font-semibold text-slate-100 tracking-tight">
                لا توجد نتائج
              </div>
              <div className="mt-2 text-sm text-slate-400 leading-relaxed">
                جرّب تغيير الفلاتر أو تعديل النص في مربع البحث.
              </div>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setTypeFilter('all');
                  }}
                  className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10 transition"
                >
                  إعادة ضبط الفلاتر
                </button>
                <button
                  onClick={() => {
                    setQuickInput('250 طعام');
                    showToast({ kind: 'success', message: 'تم اقتراح صيغة' });
                  }}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition"
                >
                  إضافة مثال
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const badge = typeBadge(tx.type);
              return (
                <div
                  key={tx.id}
                  className="group relative rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-white/10 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-blue-500/15 to-emerald-400/15 flex items-center justify-center text-lg">
                      {categoryIcon(tx.category ?? 'عام')}
                    </div>
                    <div>
                      <div className="text-slate-100 font-semibold">
                        {tx.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {tx.category ?? 'عام'} • {badge.label}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span
                      className={`text-xs px-3 py-1 rounded-full ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <div className="text-right">
                      <div
                        className={`font-semibold ${
                          tx.type === 'income' ? 'text-emerald-200' : 'text-rose-200'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatAmount(Math.abs(tx.amount))}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        معاملة
                      </div>
                    </div>

                    <button
                      onClick={() => void handleDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-rose-200 hover:text-rose-100"
                      aria-label="حذف"
                      type="button"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Loading skeletons (visual only; uses existing local state) */}
        {!hasAnyTx && (
          <div className="space-y-3 mt-4">
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )}

        {/* Insights card (visual only) */}
        <Card className="mt-6 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-[#94A3B8]">Transaction Insights</div>
              <div className="text-lg font-semibold text-[#F8FAFC] mt-1">ملخص ذكي حسب المعروض</div>
              <div className="text-sm text-[#94A3B8] mt-2">سيتم ربط هذه البطاقة بالتحليلات الحقيقية لاحقًا.</div>
            </div>
            <div className="rounded-2xl bg-white/3 ring-1 ring-white/6 px-4 py-3">
              <div className="text-xs text-[#94A3B8]">AI</div>
              <div className="text-sm font-semibold text-[#F8FAFC] mt-1">جاهز</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { k: 'الأكثر تكرارًا', v: '—' },
              { k: 'أفضل أسبوع', v: '—' },
              { k: 'تنبيه ميزانية', v: '—' },
            ].map((x) => (
              <Card key={x.k} className="p-4">
                <div className="text-xs text-[#94A3B8]">{x.k}</div>
                <div className="text-sm font-semibold text-[#F8FAFC] mt-1">{x.v}</div>
              </Card>
            ))}
          </div>
        </Card>
      </Card>

      {/* Floating Quick Add Button */}
      <Button
        type="button"
        onClick={() => {
          const el = document.querySelector<HTMLInputElement>('input[placeholder^="مثال"]');
          el?.focus();
          showToast({ kind: 'success', message: 'جاهز للإضافة السريعة' });
        }}
        className="fixed bottom-6 left-6 sm:left-10 z-50 py-4 px-5"
      >
        + إضافة
      </Button>
    </div>
  );
};

export default Transactions;

