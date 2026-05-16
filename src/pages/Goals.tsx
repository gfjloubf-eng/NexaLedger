import React from 'react';

const PremiumHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-2xl">
        {subtitle}
      </p>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="text-4xl leading-none">🏁</div>
      <div className="mt-4 text-lg font-semibold text-slate-100 tracking-tight leading-relaxed">{title}</div>
      <div className="mt-2 text-sm text-slate-400 leading-relaxed">{subtitle}</div>
      <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
        <span aria-hidden="true">•</span>
        لا توجد أهداف لعرضها
      </div>
    </div>

  );
};


const GoalCard: React.FC<{
  title: string;
  target: string;
  progressPct: number;
  tone: 'blue' | 'emerald' | 'purple' | 'rose';
}> = ({ title, target, progressPct, tone }) => {
  const pct = Math.max(0, Math.min(100, progressPct));

  const bar =
    tone === 'emerald'
      ? 'from-emerald-500 to-cyan-300'
      : tone === 'purple'
        ? 'from-purple-500 to-indigo-400'
        : tone === 'rose'
          ? 'from-rose-500 to-pink-300'
          : 'from-blue-500 to-emerald-400';

  const glow =
    tone === 'emerald'
      ? 'shadow-emerald-400/20'
      : tone === 'purple'
        ? 'shadow-purple-400/20'
        : tone === 'rose'
          ? 'shadow-rose-400/20'
          : 'shadow-blue-400/20';

  return (
    <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 ${glow} transition hover:bg-white/10`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">هدف ادخار</div>
          <div className="text-lg font-semibold text-slate-100 mt-1">{title}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
          {pct}%
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${bar} transition-all`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">المبلغ المستهدف</div>
        <div className="text-sm font-semibold text-slate-100">{target}</div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        واجهة جاهزة — سيتم ربطها بالبيانات لاحقًا.
      </div>
    </div>
  );
};

const AchievementCard: React.FC = () => {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 transition hover:bg-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">إنجازات</div>
          <div className="text-lg font-semibold text-slate-100 mt-1">
            لوحة الاستحقاق
          </div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-400/20 ring-1 ring-white/10 flex items-center justify-center">
          ✨
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {[
          { k: 'تقدم 25%', v: 'قيد الإكمال' },
          { k: 'تقدم 50%', v: 'جيد' },
          { k: 'تقدم 75%', v: 'قريب' },
        ].map((x) => (
          <div
            key={x.k}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <div className="text-sm font-semibold text-slate-100">{x.k}</div>
            <div className="text-xs text-slate-400">{x.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FinancialHealthVisual: React.FC = () => {
  // Visual only placeholder
  const score = 88;
  const label = score >= 80 ? 'ممتاز' : score >= 60 ? 'جيد' : 'بحاجة تحسين';

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">Financial Health</div>
          <div className="text-lg font-semibold text-slate-100 mt-1">{label}</div>
          <div className="text-xs text-slate-500 mt-1">Placeholder — سيتم ربطه لاحقًا.</div>
        </div>
        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-400/20 ring-1 ring-white/10 flex items-center justify-center">
          📈
        </div>
      </div>

      <div className="mt-5 flex items-center gap-6">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-white/5 ring-1 ring-white/10" />
          <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/15 to-emerald-400/10 ring-1 ring-white/10 flex items-center justify-center">
            <span className="text-lg font-semibold text-slate-100">{score}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="text-sm text-slate-400">ملخص سريع</div>
          <div className="mt-2 space-y-2">
            {[
              { k: 'توازن جيد', v: '↗' },
              { k: 'إنفاق منضبط', v: '✓' },
              { k: 'ادخار متزايد', v: '✓' },
            ].map((x) => (
              <div
                key={x.k}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div className="text-xs text-slate-400">{x.k}</div>
                <div className="text-sm font-semibold text-slate-100">{x.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Goals: React.FC = () => {
  const hasGoals = false;

  return (
    <div dir="rtl" className="space-y-8 py-6">
      <PremiumHeader
        title="الأهداف"
        subtitle="بطاقات أهداف ادخار جاهزة — تصميم احترافي مع مؤشرات مستقبلية قابلة للربط."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {hasGoals ? (
            <div className="space-y-4">
              <GoalCard
                title="صندوق الطوارئ"
                target="10,000 ر.س"
                progressPct={42}
                tone="emerald"
              />
              <GoalCard
                title="ادخار استثمار"
                target="6,000 ر.س"
                progressPct={28}
                tone="blue"
              />
            </div>
          ) : (
            <EmptyState
              title="لا توجد أهداف بعد"
              subtitle="ابدأ بإنشاء هدف ادخار لتظهر البطاقات والتقدم هنا."
            />
          )}
        </div>

        <div className="space-y-4">
          <FinancialHealthVisual />
          <AchievementCard />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="flex-1 px-5 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-100 font-semibold shadow-sm"
        >
          إنشاء هدف
        </button>
        <button
          type="button"
          className="flex-1 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition shadow"
        >
          اقتراح من AI
        </button>
      </div>
    </div>
  );
};

export default Goals;

