import React, { useMemo } from 'react';

import { useTransactions } from '../context/TransactionContext';

import Hero from '../components/Hero';
import EmptyChartState from '../components/charts/EmptyChartState';
import FinEmptyState from '../components/ui/FinEmptyState';

import { Card } from '../components/ui';

type DashboardTotals = {
  income: number;
  expenses: number;
  balance: number;
  categoryTotals: Array<{ name: string; value: number }>;
};

const Dashboard: React.FC = () => {
  const { transactions, loading } = useTransactions();

  const totals: DashboardTotals = useMemo(() => {
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

  return (
    <div dir="rtl" className="max-w-7xl mx-auto py-8">
      <Hero />

      {/* Executive Financial State Surface + Revenue Intelligence + Alerts */}
      <div className="max-w-6xl mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 1) Executive Financial State Surface (dominant liquidity zone) */}
          <section className="lg:col-span-7">
            <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                    Executive Financial State
                  </div>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#F8FAFC]">
                    Liquidity & Operational Health
                  </h2>
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[rgba(255,255,255,0.08)] bg-[#121A24] text-[#B08968]"
                  aria-hidden
                >
                  ⟡
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                  <div className="text-xs text-[#94A3B8]">Cashflow In (Σ Income)</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#F8FAFC]">
                    {totals.income.toLocaleString('ar-SA')}
                  </div>
                  <div className="mt-1 text-xs text-[#7F8A98]">ر.س</div>
                </div>

                <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                  <div className="text-xs text-[#94A3B8]">Cashflow Out (Σ Expense)</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[#F8FAFC]">
                    {totals.expenses.toLocaleString('ar-SA')}
                  </div>
                  <div className="mt-1 text-xs text-[#7F8A98]">ر.س</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs text-[#94A3B8]">Operational Balance</div>
                    <div
                      className={`mt-1 text-3xl font-semibold tabular-nums tracking-tight ${
                        totals.balance >= 0 ? 'text-[#10B981]' : 'text-rose-400'
                      }`}
                    >
                      {totals.balance.toLocaleString('ar-SA')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-[#7F8A98]">Continuity Signal</div>
                    <div className="mt-1 text-[12px] font-semibold text-[#F8FAFC]">
                      {totals.balance >= 0 ? 'Stable Surplus' : 'Caution'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* 2) Revenue Intelligence Surface */}
          <section className="lg:col-span-5 space-y-6">
            <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                    Revenue Intelligence
                  </div>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#F8FAFC]">
                    Continuity & Movement Rhythm
                  </h3>
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[rgba(255,255,255,0.08)] bg-[#121A24] text-[#B08968]"
                  aria-hidden
                >
                  ⌁
                </div>
              </div>

              {!hasData && !loading ? (
                <div className="mt-4">
                  <FinEmptyState
                    title="لا توجد بيانات بعد"
                    subtitle="أضف أول عملية في المعاملات ليبدأ عرض التحليلات بشكل متزن ومؤسسي."
                    actionLabel="ابدأ الآن"
                    onAction={() => {
                      window.location.href = '/transactions';
                    }}
                  />
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs text-[#94A3B8]">Income vs Expense</div>
                        <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">
                          Continuity Layer: Ready
                        </div>
                      </div>
                      <div className="text-xs text-[#7F8A98]">30 days</div>
                    </div>
                  </div>

                  <EmptyChartState
                    title="Revenue Movement"
                    subtitle="تشغيل تحليل الحركة قريباً — بدون ضوضاء."
                  />
                </div>
              )}
            </Card>

            {/* 3) Operational Alerts Rail */}
            <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
              <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                Operational Alerts
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#F8FAFC]">
                Anomalies & Pending Continuity
              </h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                  <div>
                    <div className="text-sm font-semibold text-[#F8FAFC]">Liquidity Monitoring</div>
                    <div className="mt-1 text-xs text-[#7F8A98]">
                      {totals.balance >= 0 ? 'No anomaly detected' : 'Action recommended'}
                    </div>
                  </div>
                  <div className="text-[#7F8A98]" aria-hidden>
                    •
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                  <div>
                    <div className="text-sm font-semibold text-[#F8FAFC]">Category Continuity</div>
                    <div className="mt-1 text-xs text-[#7F8A98]">
                      {totals.categoryTotals.length
                        ? `Top: ${totals.categoryTotals[0].name}`
                        : 'Awaiting classification'}
                    </div>
                  </div>
                  <div className="text-[#7F8A98]" aria-hidden>
                    •
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* 4) Smart Transaction Workspace + 5) Executive Timeline Layer */}
      <div className="max-w-6xl mx-auto mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-7">
            <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
              <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                Smart Transaction Workspace
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#F8FAFC]">
                Operational Activity (Contextual)
              </h3>

              <div className="mt-4">
                {!hasData && !loading ? (
                  <div className="min-h-[220px]">
                    <FinEmptyState
                      title="لا توجد بيانات بعد"
                      subtitle="ابدأ بإضافة معاملات — سيظهر سياق العمل فور توفر العمليات."
                      actionLabel="إضافة عملية"
                      onAction={() => {
                        window.location.href = '/transactions';
                      }}
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
                    <div className="text-xs text-[#94A3B8]">Continuity Queue</div>
                    <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">
                      Operational timeline is ready
                    </div>
                    <div className="mt-2 text-xs text-[#7F8A98]">
                      {transactions.length} operations recorded
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </section>

          <section className="lg:col-span-5">
            <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
              <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                Executive Timeline Layer
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#F8FAFC]">
                Continuity Evolution
              </h3>

              <div className="mt-4 space-y-3">
                {hasData ? (
                  totals.categoryTotals.slice(0, 3).map((c) => (
                    <div
                      key={c.name}
                      className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4"
                    >
                      <div className="text-xs text-[#94A3B8]">Category</div>
                      <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">{c.name}</div>
                      <div className="mt-1 text-xs text-[#7F8A98] tabular-nums">
                        Σ {c.value.toLocaleString('ar-SA')}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyChartState
                    title="Operational Timeline"
                    subtitle="جارٍ تجهيز سياق العمل — بدون ضوضاء."
                  />
                )}
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* 6) Financial Health Environment */}
      <div className="max-w-6xl mx-auto mt-6">
        <Card className="p-6 bg-[#0B1018]/40 border border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                Financial Health Environment
              </div>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-[#F8FAFC]">
                Institutional Metrics & Supporting Operational Indicators
              </h3>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-[#7F8A98]">Operational Surface</div>
              <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">Active Continuity</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
              <div className="text-xs text-[#94A3B8]">Liquidity</div>
              <div className="mt-1 text-sm font-semibold text-[#F8FAFC] tabular-nums">
                {totals.balance >= 0 ? 'Positive' : 'Needs review'}
              </div>
            </div>
            <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
              <div className="text-xs text-[#94A3B8]">Revenue Continuity</div>
              <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">Stable Layer</div>
            </div>
            <div className="rounded-2xl bg-[#121A24]/60 ring-1 ring-white/8 p-4">
              <div className="text-xs text-[#94A3B8]">Operational Alerts</div>
              <div className="mt-1 text-sm font-semibold text-[#F8FAFC]">Quiet / Monitored</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

