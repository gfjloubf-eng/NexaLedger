import React, { useMemo } from 'react';
import { useTransactions } from '../context/TransactionContext';
import Hero from '../components/Hero';
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart';
import ExpenseDistributionChart from '../components/charts/ExpenseDistributionChart';
import EmptyChartState from '../components/charts/EmptyChartState';
import FinEmptyState from '../components/ui/FinEmptyState';
import { Card } from '../components/ui';



const Dashboard: React.FC = () => {
  const { transactions } = useTransactions();

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expenses;

    const categoryTotalsMap = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type !== 'expense') continue;
      const cat = tx.category || 'عام';
      categoryTotalsMap.set(cat, (categoryTotalsMap.get(cat) ?? 0) + tx.amount);
    }

    const categoryTotals = Array.from(categoryTotalsMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { income, expenses, balance, categoryTotals };
  }, [transactions]);

  const hasData = transactions.length > 0;

  const incomeExpenseChartData = useMemo(() => {
    return [
      {
        label: 'الآن',
        income: Number.isFinite(totals.income) ? totals.income : 0,
        expense: Number.isFinite(totals.expenses) ? totals.expenses : 0,
      },
    ];
  }, [totals.income, totals.expenses]);

  const expenseDistributionData = useMemo(() => {
    return (totals.categoryTotals ?? []).map((c) => ({ name: c.name, value: c.value }));
  }, [totals.categoryTotals]);

  return (
    <div dir="rtl" className="max-w-7xl mx-auto space-y-12 py-8">
      <Hero />

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 text-[#10B981]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">الإيرادات</h3>
            </div>
          </div>
          <div className="text-2xl font-semibold mb-1 tabular-nums tracking-tight text-[#F8FAFC]">
            {totals.income.toLocaleString('ar-SA')}
          </div>
          <div className="text-sm text-[#94A3B8]">ر.س</div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-red-400">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5v1h5v-1H4zm9-1h-5v1h5v-1zM4 4a1 1 0 011-1h10a1 1 0 011 1v2H4V4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">المصروفات</h3>
            </div>
          </div>
          <div className="text-2xl font-semibold mb-1 tabular-nums tracking-tight text-[#F8FAFC]">
            {totals.expenses.toLocaleString('ar-SA')}
          </div>
          <div className="text-sm text-[#94A3B8]">ر.س</div>
        </Card>

        <Card className="p-6 md:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-[#10B981]">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#F8FAFC]">الرصيد المتاح</h3>
            </div>
          </div>
          <div className={`text-3xl font-black mb-1 tabular-nums tracking-tight ${
            totals.balance >= 0 ? 'text-[#10B981]' : 'text-red-400'
          }`}>
            {totals.balance.toLocaleString('ar-SA')}
          </div>
          <div className="text-sm text-[#94A3B8]">ر.س</div>
        </Card>
      </div>

      {/* Analytics section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-[#F8FAFC]">الدخل مقابل المصروف</h2>
            <div className="text-sm text-[#94A3B8]">آخر 30 يوم</div>
          </div>

          {!hasData ? (
            <div className="min-h-[260px]">
              <FinEmptyState
                title="لا توجد بيانات بعد"
                subtitle="أضف عملياتك في قسم المعاملات لبدء عرض التحليلات."
                icon="📊"
                actionLabel="ابدأ الآن"
                onAction={() => {
                  window.location.href = '/transactions';
                }}
              />
            </div>
          ) : (
            <IncomeExpenseChart data={incomeExpenseChartData} />
          )}

        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold leading-none tracking-tight text-[#F8FAFC]">توزيع المصروفات حسب الفئة</h2>
            <div className="text-sm text-[#94A3B8]">حسب الفئات</div>
          </div>

          {!hasData ? (
            <div className="min-h-[260px]">
              <EmptyChartState
                title="لا توجد مصروفات بعد"
                subtitle="ابدأ بإضافة معاملات لتظهر التوزيعات هنا"
              />
            </div>
          ) : (
            <ExpenseDistributionChart data={expenseDistributionData} />
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

