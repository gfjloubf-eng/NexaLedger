import React, { useMemo, useState } from 'react';

import { useTransactions } from '../context/TransactionContext';
import { formatCurrency } from '../utils/formatCurrency';

import './reportsPrint.css';


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

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function fmtDateISO(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

const Reports: React.FC = () => {
  const { transactions, loading } = useTransactions();

  const [scope, setScope] = useState<'this_month' | 'this_year'>('this_month');

  const now = useMemo(() => new Date(), []);

  const period = useMemo(() => {
    if (scope === 'this_year') {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return {
        label: `السنة ${now.getFullYear()}`,
        start,
        end,
        range: `${fmtDateISO(start)} — ${fmtDateISO(end)}`,
      };
    }

    const start = startOfMonth(now);
    const end = endOfMonth(now);
    return {
      label: `${MONTHS_AR[now.getMonth()]} ${now.getFullYear()}`,
      start,
      end,
      range: `${fmtDateISO(start)} — ${fmtDateISO(end)}`,
    };
  }, [now, scope]);

  const filtered = useMemo(() => {
    // Loaded transactions in this UI are already the selected base dataset.
    // Keeping this stable avoids print empty-state flicker.
    return transactions;
  }, [transactions]);

  const totals = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);

    const expenses = filtered
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);

    const balance = income - expenses;

    const categoryTotals = new Map<string, number>();
    for (const tx of filtered) {
      if (tx.type !== 'expense') continue;
      const cat = tx.category ?? 'عام';
      categoryTotals.set(cat, (categoryTotals.get(cat) ?? 0) + tx.amount);
    }

    const categories = Array.from(categoryTotals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { income, expenses, balance, categories };
  }, [filtered]);

  const txRows = useMemo(() => {
    return [...filtered];
  }, [filtered]);

  return (
    <div className="max-w-4xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between gap-3 no-print">
        <h1 className="text-xl md:text-2xl font-semibold">الملخص المالي</h1>


        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`px-3 py-2 rounded-xl border text-sm ${
              scope === 'this_month'
                ? 'bg-white/10 border-white/10'
                : 'bg-transparent border-white/10'
            }`}
            onClick={() => setScope('this_month')}
          >
            هذا الشهر
          </button>
          <button
            type="button"
            className={`px-3 py-2 rounded-xl border text-sm ${
              scope === 'this_year'
                ? 'bg-white/10 border-white/10'
                : 'bg-transparent border-white/10'
            }`}
            onClick={() => setScope('this_year')}
          >
            هذا العام
          </button>
          <button
            type="button"
            className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.02] text-sm"
            onClick={() => window.print()}
          >
            طباعة
          </button>
        </div>
      </div>

      <section className="nexaledger-print-surface">
        <header className="print-header">

          <div className="print-title">NexaLedger</div>
          <div className="print-period">{period.label}</div>
          <div className="print-range">{period.range}</div>
        </header>


        <div className="print-grid">
          <div className="print-kv">
            <div className="print-k">إجمالي الدخل</div>
            <div className="print-v">{formatCurrency(totals.income)}</div>
          </div>
          <div className="print-kv">
            <div className="print-k">إجمالي النفقات</div>
            <div className="print-v">{formatCurrency(totals.expenses)}</div>
          </div>
          <div className="print-kv">
            <div className="print-k">صافي الربح</div>
            <div className="print-v">{formatCurrency(totals.balance)}</div>
          </div>
          <div className="print-kv">
            <div className="print-k">عدد العمليات</div>
            <div className="print-v">{txRows.length}</div>
          </div>
        </div>


        <div className="print-section">
          <div className="print-section-title">ملخص الفئات (نفقات)</div>

          {totals.categories.length === 0 ? (
            <div className="print-empty">لا توجد نفقات لعرضها.</div>
          ) : (
            <div className="print-cat-list">
              {totals.categories.slice(0, 10).map((c) => (
                <div className="print-cat-row" key={c.name}>
                  <div className="print-cat-name">{c.name}</div>
                  <div className="print-cat-amt">{formatCurrency(c.value)}</div>
                </div>
              ))}
            </div>
          )}

          <div className="print-footnote">يتم عرض حتى 10 فئات للحفاظ على وضوح الطباعة.</div>
        </div>


        <div className="print-section">
          <div className="print-section-title">بيان العمليات</div>

          <div className="print-table-wrap">
            <table className="print-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الفئة</th>
                  <th>النوع</th>
                  <th>المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="print-loading">
                      جارٍ التحميل…
                    </td>
                  </tr>
                ) : txRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="print-empty">
                      لا توجد عمليات بعد.
                    </td>
                  </tr>
                ) : (
                  txRows.map((tx) => (
                    <tr key={tx.id}>
                      <td className="print-cell">{tx.title}</td>
                      <td className="print-cell">{tx.category ?? 'عام'}</td>
                      <td className="print-cell">{tx.type === 'income' ? 'دخل' : 'مصروف'}</td>
                      <td className="print-cell print-amt">
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatCurrency(Math.abs(tx.amount), { showSymbol: true })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="text-sm text-zinc-500 no-print">
        للنتائج الأكثر ثباتاً في PDF، استخدم خيار الطباعة من المتصفح.
      </div>
    </div>
  );
};

export default Reports;

