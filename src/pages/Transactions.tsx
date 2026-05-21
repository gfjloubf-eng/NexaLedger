import React, { useMemo, useRef, useState } from 'react';

import { useTransactions } from '../context/TransactionContext';

import { parseQuickAdd } from '../utils/transactionParser';
import { TRANSACTION_CATEGORIES } from '../config/transactionCategories';
import type { TransactionCategory, TransactionType } from '../types/transaction';
import { formatCurrency } from '../utils/formatCurrency';

import { Button, Input, Card } from '../components/ui';

import { financialInsightEngine } from '../systems/financial-insights/insightEngine';
import type { Transaction as InsightTransaction } from '../systems/financial-insights/transactionCompat';
import { financialInsightToWhispers } from '../utils/financialInsightToWhispers';
import InsightWhisperCard from '../components/ui/InsightWhisperCard';

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
      className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.02] dark:bg-zinc-950/60 p-4 flex items-center justify-between backdrop-blur-xl"
      aria-hidden
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10" />
        <div className="space-y-2">
          <div className="h-3.5 w-36 rounded bg-white/[0.05]" />
          <div className="h-3 w-24 rounded bg-white/[0.05]" />
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
  const quickInputRef = useRef<HTMLInputElement | null>(null);


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
          <p className="mt-2 text-zinc-600/90 dark:text-zinc-200/90 text-sm">
            بحث سريع، فلترة ذكية، وإضافات فورية — بأسلوب احترافي.
          </p>

        </div>

        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] dark:bg-zinc-950/60 px-4 py-2 backdrop-blur-xl">
            <span className="text-zinc-700 text-sm dark:text-zinc-200/90">عدد المعاملات</span>
            <span className="text-zinc-200 font-semibold">
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
              <div className="text-sm text-zinc-800 dark:text-zinc-100">تحليلات ذكية</div>
              <div className="text-lg font-semibold mt-1 text-zinc-900 dark:text-stone-200">تصفية ذكية لتشغيل التدفقات</div>
              <div className="text-sm text-zinc-800 dark:text-zinc-200/90 mt-2">تصنيفات وتحليلات خفيفة لتبدأ بها — بدون تعقيد.</div>
            </div>
            <div className="rounded-2xl bg-white/[0.92] border border-zinc-300/60 shadow-[0_1px_2px_rgba(0,0,0,0.04)] px-4 py-3">
              <div className="text-xs text-zinc-800 dark:text-zinc-200/90">Analytics</div>
              <div className="text-sm font-semibold text-[#F8FAFC] mt-1">قيد التحضير…</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'تصفية مصروفات الطعام' },
              { label: 'اكتشاف ارتفاع الإنفاق' },
              { label: 'تنبيه ميزانية' },
            ].map((x) => (
              <span key={x.label} className="px-3 py-1 rounded-full text-xs bg-zinc-100/80 border border-zinc-200/60 text-zinc-800 dark:text-[#F8FAFC]">{x.label}</span>
            ))}
          </div>
        </Card>

        <Card className="p-5">
            <div className="text-sm text-zinc-900 dark:text-zinc-100">الحالة المالية</div>
              <div className="text-3xl font-semibold mt-2 text-zinc-800 dark:text-zinc-100">92</div>
              <div className="text-xs text-neutral-800 dark:text-neutral-800">مؤشر مبسط — بناءً على النشاط الحديث.</div>
          <div className="mt-4">
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-[92%] bg-[#2563EB]" />
            </div>
          </div>
          <div className="mt-4 text-xs text-zinc-700 dark:text-zinc-200/90">* مؤقت — سيربط لاحقًا بالتحليلات.</div>
        </Card>
      </div>

      {/* Filters + Search */}
      <Card className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">بحث بالاسم/الفئة</label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالمعنى…"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">النوع</label>
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
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">الفئة</label>
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
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">إجراء</label>
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
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">تصدير</label>
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
            <div className="text-sm text-zinc-700 dark:text-zinc-200/90">إضافة سريعة</div>
            <div className="text-lg font-semibold text-zinc-900 dark:text-[#F8FAFC] mt-1">اكتب مثلاً: 250 طعام أو coffee 25</div>
            <div className="mt-3">
              <Input
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="مثال: 250 طعام أو coffee 25"
                dir="rtl"
                className="bg-white/[0.92] border border-zinc-300/70 text-zinc-900 placeholder:text-zinc-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') void handleQuickAdd();
                }}
              />


            </div>
          </div>

          <div className="lg:w-56">
            <label className="block text-xs text-zinc-600 dark:text-zinc-200/90 mb-2">&nbsp;</label>
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
          <div className="text-xs text-zinc-700 dark:text-zinc-200/90">دعم إضافة سريعة بدون تعقيد.</div>
          {toast ? (
            <div className={`text-sm font-semibold ${toast.kind === 'success' ? 'text-emerald-200' : 'text-rose-200'}`}>{toast.message}</div>
          ) : (
            <div className="text-xs text-zinc-600/90">&nbsp;</div>


          )}
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="p-5 dark:bg-zinc-950/60 border border-white/5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">

          <div>
            <div className="text-sm text-zinc-400 dark:text-zinc-200/90">قائمة المعاملات</div>
            <div className="text-lg font-semibold text-zinc-100 mt-1 tracking-tight">{hasAnyTx ? 'عرض سريع ومُرتّب' : 'ابدأ بإضافة معاملات'}</div>
          </div>
          <div className="text-xs text-zinc-300 dark:text-zinc-200/90 tabular-nums">{filteredTransactions.length} نتيجة</div>
        </div>




        {!hasData ? (
          <div className="py-10">
            <div className="mx-auto max-w-md text-center">
              <div className="w-14 h-14 rounded-2xl mx-auto bg-white/[0.02] border border-white/5 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <circle cx="32" cy="32" r="16" stroke="#F8FAFC" strokeOpacity="0.9" strokeWidth="2" />
                  <path d="M 20 32 A 12 12 0 0 1 44 32" stroke="#F8FAFC" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="44" cy="32" r="3.1" fill="#F8FAFC" fillOpacity="0.95" />
                </svg>
              </div>

              <div className="mt-4 text-lg font-semibold text-zinc-100 tracking-tight">
                {hasAnyTx ? 'لم يتم العثور على نتائج مطابقة' : 'لا توجد معاملات بعد'}
              </div>

              <div className="mt-2 text-sm text-zinc-400 leading-relaxed">
                {hasAnyTx
                  ? 'جرّب تعديل كلمات البحث أو الفلاتر'
                  : 'ابدأ أول سجل مالي بهدوء وتنظيم'}
              </div>

              {hasAnyTx ? (
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCategoryFilter('all');
                      setTypeFilter('all');
                    }}
                    className="px-5 py-3 rounded-xl border border-white/5 bg-white/[0.02] text-zinc-100 hover:border-white/10 hover:bg-white/[0.04] transition hover:-translate-y-[1px] transition-all duration-300 ease-out"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                  <button
                    onClick={() => {
                      setQuickInput('250 طعام');
                      showToast({ kind: 'success', message: 'تم اقتراح صيغة' });
                    }}
                    className="px-5 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-zinc-100 font-semibold hover:bg-white/[0.06] transition"
                  >
                    إضافة مثال
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const badge = typeBadge(tx.type);
              return (
                <div
                  key={tx.id}
                  className="group relative rounded-2xl border border-white/5 bg-white/[0.02] dark:bg-zinc-950/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:border-white/10 hover:bg-white/[0.04] hover:-translate-y-[1px] transition-all duration-300 ease-out backdrop-blur-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl ring-1 ring-white/10 bg-gradient-to-br from-blue-500/15 to-emerald-400/15 flex items-center justify-center text-lg">
                      {categoryIcon(tx.category ?? 'عام')}
                    </div>
                    <div>
                      <div className="text-zinc-100 font-semibold tracking-tight">
                        {tx.title}
                      </div>
                      <div className="text-xs text-zinc-400 mt-1">
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
                        className={`font-semibold tracking-tight leading-none whitespace-nowrap tabular-nums ${
                          tx.type === 'income' ? 'text-emerald-200' : 'text-rose-200'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatAmount(Math.abs(tx.amount))}
                      </div>
                      <div className="text-xs text-zinc-700 dark:text-zinc-200/90 mt-0.5">
                        معاملة
                      </div>
                    </div>

                    <button
                      onClick={() => void handleDelete(tx.id)}
                      className="opacity-0 group-hover:opacity-100 transition px-3 py-2 rounded-xl border border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04] text-rose-400 hover:text-rose-300"
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

        {/* Controlled Insight Surface(s) — calm, compact, lightweight */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-1">
            <Card className="p-4 border border-white/5 bg-white/[0.02] dark:bg-zinc-950/60 backdrop-blur-xl rounded-3xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.10),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.10),transparent_55%)] opacity-60 pointer-events-none" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-900 dark:text-zinc-200/80">وعي مالي هادئ</div>
                  <div className="mt-1 text-sm font-semibold text-zinc-100 tracking-tight">ملحوظة سريعة</div>
                </div>
                <div className="text-xs text-emerald-200/80">✦</div>
              </div>

              <div className="relative mt-3">
                {(() => {
                  const insightTx = transactions.map((tx) => ({
                    id: tx.id,
                    title: tx.title,
                    amount: tx.amount,
                    type: tx.type,
                    category: tx.category,
                    created_at: (tx as InsightTransaction).created_at,
                  }));

                  const now = new Date();
                  const insights = financialInsightEngine.generate({
                    transactions: insightTx as unknown as InsightTransaction[],
                    now,
                  });

                  const whispers = financialInsightToWhispers(insights);

                  return (
                    <div className="space-y-2">
                      {whispers.length === 0 ? (
                        <div className="text-sm leading-relaxed text-zinc-400">لم يتم تسجيل إشارات كافية بعد.</div>
                      ) : (
                        whispers.slice(0, 1).map((w) => (
                          <div key={w.id} className="text-sm leading-relaxed text-zinc-200/90">
                            {w.message}
                          </div>
                        ))
                      )}
                    </div>
                  );
                })()}
              </div>
            </Card>
          </div>

          <div className="md:col-span-1">
            <InsightWhisperCard
              title="مؤشرات مالية هادئة"
              insights={(() => {
                const insightTx = transactions.map((tx) => ({
                  id: tx.id,
                  title: tx.title,
                  amount: tx.amount,
                  type: tx.type,
                  category: tx.category,
                  created_at: (tx as InsightTransaction).created_at,
                }));

                const now = new Date();
                const insights = financialInsightEngine.generate({
                  transactions: insightTx as unknown as InsightTransaction[],
                  now,
                });

                return financialInsightToWhispers(insights);
              })()}
            />
          </div>
        </div>

      </Card>

      {/* Floating Quick Add Button */}
      <Button
        type="button"
        onClick={() => {
          quickInputRef.current?.focus();
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

