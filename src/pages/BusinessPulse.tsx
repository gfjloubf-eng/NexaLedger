import { useMemo } from 'react';

import { useTransactions } from '../context/TransactionContext';

import FinCard from '../components/ui/FinCard';
import FinEmptyState from '../components/ui/FinEmptyState';
import { formatCurrency } from '../utils/formatCurrency';

type StatusKey = 'excellent' | 'good' | 'needs_attention' | 'warning';

type Observation = {
  tone: StatusKey;
  text: string;
};

const STATUS_META: Record<StatusKey, { label: string; text: string; bg: string; border: string }> = {
  excellent: {
    label: 'ممتاز',
    text: '#7CFFB2',
    bg: 'rgba(124,255,178,0.08)',
    border: 'rgba(124,255,178,0.18)',
  },
  good: {
    label: 'جيد',
    text: '#9CCBFF',
    bg: 'transparent',
    border: 'transparent',
  },
  needs_attention: {
    label: 'يحتاج انتباه',
    text: '#F6C56F',
    bg: 'transparent',
    border: 'transparent',
  },
  warning: {
    label: 'تحذير',
    text: '#E58A8A',
    bg: 'transparent',
    border: 'transparent',
  },
};

type TxLike = {
  type?: 'income' | 'expense' | string;
  amount?: unknown;
  createdAtMs?: unknown;
};

function safeNumber(n: unknown) {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}

function sumByType(txs: TxLike[], type: 'income' | 'expense') {
  let sum = 0;
  for (const t of txs) {
    if (t?.type !== type) continue;
    sum += safeNumber(t?.amount);
  }
  return sum;
}

function getLocalDayKeyFromMs(ms: number) {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function computeTone(params: {
  txCount: number;
  incomeTotal: number;
  expenseTotal: number;
  recentTxCount: number;
  recentRatio: number;
}): StatusKey {
  const { txCount, incomeTotal, expenseTotal, recentTxCount, recentRatio } = params;

  if (txCount === 0) return 'warning';

  if (recentTxCount === 0) return 'warning';
  if (recentRatio < 0.25) return 'needs_attention';

  const net = incomeTotal - expenseTotal;
  if (net > 0) return 'excellent';
  if (net === 0) return 'good';
  return 'good';
}

export default function BusinessPulse() {
  const { transactions, loading } = useTransactions();

  const derived = useMemo(() => {
    const txs = (transactions ?? []) as TxLike[];
    const txCount = txs.length;

    // Deterministic “now” derived from visible transactions.
    // If no timestamps exist, we fall back to 0 (trend becomes all zeros).
    const derivedNowMs = txs.length
      ? Math.max(...txs.map((t) => safeNumber(t?.createdAtMs)))
      : 0;

    const incomeTotal = sumByType(txs, 'income');
    const expenseTotal = sumByType(txs, 'expense');
    const netTotal = incomeTotal - expenseTotal;

    // Activity trend: last 7 days, but computed using a single fixed nowMs
    // captured inside this memo to keep render pure/idempotent.
    const last7WindowStartMs = derivedNowMs - 7 * 24 * 60 * 60 * 1000;


    const keys7: string[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date(derivedNowMs);
      d.setDate(d.getDate() - i);
      keys7.push(getLocalDayKeyFromMs(d.getTime()));
    }


    const dayBuckets: Record<string, { count: number }> = {};
    for (const k of keys7) dayBuckets[k] = { count: 0 };

    let recentTxCount = 0;
    for (const t of txs) {
      const createdMs = safeNumber(t?.createdAtMs);
      if (!Number.isFinite(createdMs) || createdMs <= 0) continue;

      if (createdMs >= last7WindowStartMs) recentTxCount += 1;

      const key = getLocalDayKeyFromMs(createdMs);
      if (dayBuckets[key]) dayBuckets[key].count += 1;
    }

    const recentRatio = txCount > 0 ? recentTxCount / txCount : 0;

    const status = computeTone({
      txCount,
      incomeTotal,
      expenseTotal,
      recentTxCount,
      recentRatio,
    });

    const observations: Observation[] = [];

    if (txCount === 0) {
      observations.push({ tone: 'warning', text: 'لا توجد معاملات بعد' });
    } else {
      // Deterministic observation set
      if (recentTxCount === 0) {
        observations.push({ tone: 'warning', text: 'لا توجد معاملات حديثة' });
      } else if (recentRatio < 0.25) {
        observations.push({ tone: 'needs_attention', text: 'نشاط خفيف خلال آخر 7 أيام' });
      } else {
        observations.push({ tone: 'good', text: 'نشاط جيد هذا الأسبوع' });
      }

      if (incomeTotal > 0 && expenseTotal > 0) {
        if (netTotal > 0) observations.push({ tone: 'excellent', text: 'الإيرادات تتفوق على المصروفات' });
        else if (netTotal < 0) observations.push({ tone: 'needs_attention', text: 'المصروفات أعلى من الإيرادات' });
        else observations.push({ tone: 'good', text: 'توازن مقبول بين الإيرادات والمصروفات' });
      } else if (incomeTotal > 0 && expenseTotal === 0) {
        observations.push({ tone: 'excellent', text: 'الإيرادات تتفوق على المصروفات' });
      } else if (expenseTotal > 0 && incomeTotal === 0) {
        observations.push({ tone: 'needs_attention', text: 'توجد مصروفات دون إيرادات مسجلة' });
      }

      if (txCount < 3) observations.push({ tone: 'needs_attention', text: 'عدد المعاملات قليل—قد تحتاج لتحديث السجل' });
      else observations.push({ tone: 'good', text: 'البيانات كافية لاتخاذ قراءة أولية' });
    }

    const seen = new Set<string>();
    const finalObservations = observations.filter((o) => {
      if (seen.has(o.text)) return false;
      seen.add(o.text);
      return true;
    });

    const trend = keys7.map((k) => ({
      dayKey: k,
      count: dayBuckets[k]?.count ?? 0,
    }));

    return {
      txCount,
      incomeTotal,
      expenseTotal,
      netTotal,
      status,
      finalObservations: finalObservations.slice(0, 3),
      trend,
      loading,
      hasAny: txCount > 0,
    };
  }, [transactions, loading]);

  const emptyState = (transactions?.length ?? 0) === 0 && !loading;

  if (emptyState) {
    return (
      <div dir="rtl" className="max-w-7xl mx-auto py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="text-[#94A3B8]"
              >
                <path
                  d="M3 12h4l2-6 4 12 2-6h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1 className="text-3xl font-bold text-emerald-700 dark:text-emerald-400 tracking-tight">نبض الأعمال</h1>
            </div>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">كيف يسير عملي الآن؟</p>
          </div>
        </div>

        <FinEmptyState
          icon="activity"
          title="لا توجد بيانات بعد"
          subtitle="أضف أول عملية في المعاملات ليظهر سياق العمل بهدوء."
          actionLabel="اذهب للمعاملات"
          onAction={() => {
            window.location.href = '/transactions';
          }}
        />
      </div>
    );
  }

  const statusMeta = STATUS_META[derived.status];

  return (
    <div dir="rtl" className="max-w-7xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="text-[#94A3B8]"
            >
              <path
                d="M3 12h4l2-6 4 12 2-6h4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-100">نبض الأعمال</h1>
          </div>
          <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">كيف يسير عملي الآن؟</p>
        </div>
      </div>

      {/* Status Card */}
      <FinCard className="p-6" subtleGlow>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">الحالة</div>
            <h2 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-100">نبضك الحالي</h2>
          </div>
          <div
            className="px-4 py-3 rounded-2xl border"
            style={{
              background: statusMeta.bg,
              borderColor: statusMeta.border === 'transparent' ? 'rgba(255,255,255,0.10)' : statusMeta.border,
              color: statusMeta.text,
            }}
            aria-label={statusMeta.label}
          >
            <div className="text-xs tracking-wide font-semibold">الحالة</div>
            <div className="mt-1 text-2xl font-semibold">{statusMeta.label}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">عدد المعاملات</div>
            <div className="mt-1 text-lg font-semibold text-slate-100 tabular-nums">{derived.txCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">إجمالي الإيرادات</div>
            <div className="mt-1 text-lg font-semibold text-slate-100 tabular-nums">
              {formatCurrency(derived.incomeTotal, { locale: 'ar-SA' })}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">صافي الحركة</div>
            <div
              className={
                'mt-1 text-lg font-semibold tabular-nums ' +
                (derived.netTotal >= 0 ? 'text-[#10B981]' : 'text-rose-400')
              }
            >
              {formatCurrency(derived.netTotal, { locale: 'ar-SA' })}
            </div>
          </div>
        </div>
      </FinCard>

      {/* Summary Cards */}
      <FinCard className="p-6" subtleGlow>
        <div>
          <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">ملخص</div>
          <h2 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-100">مؤشرات تشغيل سريعة</h2>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">عدد المعاملات</div>
            <div className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">{derived.txCount}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">إجمالي الإيرادات</div>
            <div className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">
              {formatCurrency(derived.incomeTotal, { locale: 'ar-SA' })}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">إجمالي المصروفات</div>
            <div className="mt-1 text-xl font-semibold text-slate-100 tabular-nums">
              {formatCurrency(derived.expenseTotal, { locale: 'ar-SA' })}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-[#94A3B8]">صافي الحركة</div>
            <div
              className={
                'mt-1 text-xl font-semibold tabular-nums ' +
                (derived.netTotal >= 0 ? 'text-[#10B981]' : 'text-rose-400')
              }
            >
              {formatCurrency(derived.netTotal, { locale: 'ar-SA' })}
            </div>
          </div>
        </div>
      </FinCard>

      {/* Observations */}
      <FinCard className="p-6" subtleGlow>
        <div>
          <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">ملاحظات</div>
          <h2 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-100">قراءة عملية سريعة</h2>
        </div>

        <div className="mt-4 space-y-2">
          {derived.finalObservations.map((o, idx) => {
            const meta = STATUS_META[o.tone];
            const bg = o.tone === 'excellent' ? meta.bg : 'transparent';
            const borderColor = o.tone === 'excellent' ? meta.border : 'rgba(255,255,255,0.10)';
            return (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 rounded-2xl border bg-white/5 p-4"
                style={{ borderColor, background: bg, color: meta.text }}
              >
                <div className="text-sm font-medium" style={{ color: meta.text }}>
                  {o.text}
                </div>
                <div className="text-[#94A3B8]" aria-hidden>
                  •
                </div>
              </div>
            );
          })}
        </div>
      </FinCard>

      {/* Activity Trend */}
      <FinCard className="p-6" subtleGlow>
        <div>
          <div className="text-xs font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">اتجاه النشاط</div>
          <h2 className="mt-2 text-lg sm:text-xl font-semibold tracking-tight text-slate-100">آخر 7 أيام</h2>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-[#94A3B8]">نشاط المعاملات</div>
            <div className="text-xs text-[#7F8A98]">مختصر</div>
          </div>

          <div className="mt-4 space-y-2">
            {derived.trend.map((d) => {
              const tone: StatusKey = d.count === 0 ? 'warning' : d.count <= 1 ? 'needs_attention' : 'good';
              const meta = STATUS_META[tone];
              const maxCount = Math.max(1, ...derived.trend.map((x) => x.count));
              const widthPct = Math.round((d.count / maxCount) * 100);

              return (
                <div key={d.dayKey} className="flex items-center justify-between gap-4">
                  <div className="text-xs text-[#94A3B8]">{d.dayKey}</div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${widthPct}%`,
                          background:
                            tone === 'good'
                              ? 'rgba(156,203,255,0.55)'
                              : tone === 'needs_attention'
                                ? 'rgba(246,197,111,0.55)'
                                : 'rgba(229,138,138,0.55)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-14 text-right text-xs font-medium tabular-nums" style={{ color: meta.text }}>
                    {d.count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </FinCard>
    </div>
  );
}

