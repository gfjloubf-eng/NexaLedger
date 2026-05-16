 import React, { useMemo, useState } from 'react';

import { useTransactions } from '../context/TransactionContext';

import AIInsightCard from '../components/ui/AIInsightCard';
import FinancialHealthCard from '../components/ui/FinancialHealthCard';
import SpendingTrendCard from '../components/ui/SpendingTrendCard';
import SavingsPredictionCard from '../components/ui/SavingsPredictionCard';

const Orb: React.FC = () => {
  return (
    <div className="relative h-44 w-44 mx-auto">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/25 to-emerald-400/20 ring-1 ring-white/10 blur-[1px]" />
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-blue-500/15 to-emerald-400/10 ring-1 ring-white/10" />

      <div className="absolute inset-0 flex items-center justify-center rounded-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-2xl backdrop-blur ring-1 ring-white/10">
          ✦
        </div>
      </div>
    </div>
  );
};

const ChatBubble: React.FC<{
  role: 'user' | 'ai';
  text: string;
}> = ({ role, text }) => {
  const isUser = role === 'user';

  return (
    <div
      className={`max-w-[85%] rounded-3xl border border-white/10 px-4 py-3 ${
        isUser
          ? 'ml-auto bg-white/10'
          : 'mr-auto bg-white/5'
      }`}
    >
      <div
        className={`mb-1 text-xs ${
          isUser
            ? 'text-slate-300'
            : 'text-slate-400'
        }`}
      >
        {isUser ? 'أنت' : 'AI'}
      </div>

      <div className="text-sm leading-relaxed text-slate-100">
        {text}
      </div>
    </div>
  );
};

const AI: React.FC = () => {
  const { transactions } = useTransactions();

  const computedInsights = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    type Tx = {
      type?: 'income' | 'expense' | string;
      amount?: number | string | null;
      category?: string | null;
      date?: string | Date | null;
      created_at?: string | Date | null;
    };

    const txs = (transactions ?? []) as Tx[];

    const inThisMonth = txs.filter((t) => {
      const rawDate =
        t.date ?? t.created_at ?? now;

      const d = new Date(
        rawDate as string | number | Date
      );

      if (Number.isNaN(d.getTime())) {
        return false;
      }

      return (
        d.getFullYear() === year &&
        d.getMonth() === month
      );
    });

    const sumExpenses = inThisMonth
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) =>
          acc + (Number(t.amount) || 0),
        0
      );

    const sumIncome = inThisMonth
      .filter((t) => t.type === 'income')
      .reduce(
        (acc, t) =>
          acc + (Number(t.amount) || 0),
        0
      );

    const balance =
      sumIncome - sumExpenses;

    const half = Math.max(
      1,
      Math.floor(inThisMonth.length / 2)
    );

    const first =
      inThisMonth.slice(0, half);

    const second =
      inThisMonth.slice(half);

    const expFirst = first
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) =>
          acc + (Number(t.amount) || 0),
        0
      );

    const expSecond = second
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, t) =>
          acc + (Number(t.amount) || 0),
        0
      );

    const changePct =
      expFirst === 0
        ? 0
        : ((expSecond - expFirst) /
            expFirst) *
          100;

    const scoreBase = 65;

    const score = Math.max(
      35,
      Math.min(
        98,
        scoreBase +
          (balance > 0 ? 12 : -10) -
          Math.abs(changePct) * 0.15
      )
    );

    const spent = Math.max(
      0,
      sumExpenses
    );

    const projected =
      spent === 0
        ? '—'
        : `~${Math.max(
            0,
            Math.round(
              (sumIncome -
                sumExpenses) *
                1.3
            )
          )} ر.س`;

    const confidence =
      spent === 0
        ? 'Low'
        : 'Medium';

    const recurringLike =
      txs
        .filter(
          (t) => t.type === 'expense'
        )
        .slice(0, 12)
        .filter(
          (t) =>
            (t.category ?? '')
              .toString()
              .trim() !== ''
        ).length >= 6;

    return {
      sumIncome,
      sumExpenses,
      balance,
      changePct,
      score,
      projected,
      confidence,
      recurringLike,
    };
  }, [transactions]);

  const [prompt, setPrompt] =
    useState('');

  const [messages, setMessages] =
    useState<
      Array<{
        role: 'user' | 'ai';
        text: string;
      }>
    >([
      {
        role: 'ai',
        text: 'مرحبًا! أنا مساعدك المالي الذكي.',
      },
    ]);

  const [loading, setLoading] =
    useState(false);

  const onSend = async () => {
    const q = prompt.trim();

    if (!q) return;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: q,
      },
    ]);

    setPrompt('');
    setLoading(true);

    await new Promise((r) =>
      setTimeout(r, 650)
    );

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text: 'تم استلام سؤالك — هذه واجهة AI تجريبية قابلة للتطوير لاحقًا.',
      },
    ]);

    setLoading(false);
  };

  const empty =
    transactions.length === 0;

  const spentChangeSummary =
    empty
      ? 'عندما تتوفر معاملاتك، سنحسب اتجاه الإنفاق.'
      : computedInsights.changePct <= 0
      ? `أنت تقلل الإنفاق حاليًا بنسبة ${Math.abs(
          Math.round(
            computedInsights.changePct
          )
        )}%`
      : `الإنفاق يرتفع بنسبة ${Math.abs(
          Math.round(
            computedInsights.changePct
          )
        )}%`;

  const financeSummary = empty
    ? 'سيظهر تقييم الصحة المالية هنا.'
    : `وضعك المالي الحالي ${
        computedInsights.balance >= 0
          ? 'مستقر'
          : 'بحاجة لتحسين'
      }`;

  const savingsSummary = empty
    ? 'توقعات الادخار تحتاج بيانات.'
    : 'تقدير ذكي للادخار المستقبلي بناءً على النمط الحالي.';

  return (
    <div
      dir="rtl"
      className="space-y-8 py-6"
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent">
            مساعد AI
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            تجربة مالية ذكية بتصميم مستقبلي هادئ.
          </p>
        </div>

        <div className="lg:hidden">
          <Orb />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-300">
                AI Studio
              </div>

              <div className="mt-1 text-lg font-semibold text-slate-100">
                محادثة
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
              Smart Insights
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              'كيف أزيد الادخار؟',
              'اقتراح ميزانية',
              'أعلى فئة إنفاق',
            ].map((x) => (
              <button
                key={x}
                type="button"
                onClick={() =>
                  setPrompt(x)
                }
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200 transition hover:bg-white/10"
              >
                {x}
              </button>
            ))}
          </div>

          <div className="mt-5 max-h-[420px] space-y-4 overflow-auto pr-2">
            {messages.map((m, idx) => (
              <ChatBubble
                key={idx}
                role={m.role}
                text={m.text}
              />
            ))}

            {loading && (
              <div className="mr-auto max-w-[75%] animate-pulse rounded-3xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="h-3 w-28 rounded bg-white/10" />
              </div>
            )}
          </div>

          <div className="mt-5 flex gap-3">
            <input
              value={prompt}
              onChange={(e) =>
                setPrompt(
                  e.target.value
                )
              }
              placeholder="اسأل AI…"
              dir="rtl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  void onSend();
                }
              }}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-100 placeholder:text-slate-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />

            <button
              type="button"
              onClick={() =>
                void onSend()
              }
              disabled={
                loading ||
                !prompt.trim()
              }
              className="rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              إرسال
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="hidden rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur lg:block">
            <Orb />
          </div>

          <FinancialHealthCard
            score={computedInsights.score}
            summary={financeSummary}
          />

          <SpendingTrendCard
            changePct={
              computedInsights.changePct
            }
            summary={
              spentChangeSummary
            }
          />

          <SavingsPredictionCard
            projected={
              computedInsights.projected
            }
            confidence={
              computedInsights.confidence
            }
            summary={savingsSummary}
          />

          <AIInsightCard
            title={
              computedInsights.recurringLike
                ? 'قد يوجد اشتراك متكرر'
                : 'لا يوجد نمط واضح'
            }
            subtitle="Subscriptions"
            tone={
              computedInsights.recurringLike
                ? 'purple'
                : 'blue'
            }
            icon={
              computedInsights.recurringLike
                ? '⏳'
                : '🔍'
            }
          >
            <div className="text-sm leading-relaxed text-slate-200">
              {empty
                ? 'ستظهر التحليلات عند توفر معاملات.'
                : computedInsights.recurringLike
                ? 'تم اكتشاف نمط قد يشير إلى اشتراك شهري.'
                : 'لا توجد أنماط اشتراك واضحة حاليًا.'}
            </div>
          </AIInsightCard>
        </div>
      </div>
    </div>
  );
};

export default AI;