import React, { useMemo, useState } from 'react';

const PremiumHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-2xl">{subtitle}</p>
    </div>
  );
};

const EmptyState: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => {
  return (
      <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="text-4xl leading-none">💳</div>
      <div className="mt-4 text-lg font-semibold text-slate-100 tracking-tight leading-relaxed">{title}</div>
      <div className="mt-2 text-sm text-slate-400 leading-relaxed">{subtitle}</div>
      <div className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300">
        <span aria-hidden="true">•</span>
        لا توجد بيانات لعرضها
      </div>
    </div>


  );
};

const WalletCard: React.FC<{ name: string; currency: string; balance: string }> = ({
  name,
  currency,
  balance,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-5 transition hover:bg-white/10">
      <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-400/10 blur-2xl opacity-0 group-hover:opacity-100 transition" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-slate-300 text-sm">محفظة</div>
            <div className="text-lg font-semibold text-slate-100 mt-1">{name}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            {currency}
          </div>
        </div>
        <div className="mt-4 text-3xl font-semibold text-slate-50">{balance}</div>
        <div className="mt-5 flex gap-3 flex-col sm:flex-row">
          <button
            type="button"
            className="flex-1 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-100 font-semibold"
          >
            تحويل
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition shadow-sm"
          >
            تفاصيل
          </button>
        </div>
      </div>
    </div>
  );
};

const ProgressBar: React.FC<{ value: number }> = ({ value }) => {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const SavingsOverviewCard: React.FC = () => {
  const [pct, setPct] = useState(64);
  const progress = useMemo(() => pct, [pct]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">نظرة على الادخار</div>
          <div className="text-lg font-semibold text-slate-100 mt-1">سير التوفير</div>
        </div>
        <div className="text-xs px-3 py-2 rounded-2xl border border-white/10 bg-white/5 text-slate-300">
          AI • Placeholder
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">الهدف</div>
          <div className="text-sm font-semibold text-slate-100">1,200 ر.س</div>
        </div>
        <div className="mt-2">
          <ProgressBar value={progress} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm text-slate-400">المُنجز</div>
          <div className="text-sm font-semibold text-slate-100">{progress}%</div>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          type="button"
          onClick={() => setPct((x) => Math.min(100, x + 4))}
          className="flex-1 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-100 font-semibold"
        >
          تحسين سريع
        </button>
        <button
          type="button"
          onClick={() => setPct((x) => Math.max(0, x - 4))}
          className="flex-1 px-4 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-100 font-semibold"
        >
          تعديل
        </button>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        واجهة عرض — لا يوجد ربط بيانات حقيقي حتى الآن.
      </div>
    </div>
  );
};

const TransactionsPreviewCard: React.FC = () => {
  const rows = [
    { title: 'coffee', amount: '-25.00', cat: 'عام' },
    { title: 'راتب', amount: '+2,000.00', cat: 'راتب' },
    { title: 'فواتير', amount: '-120.00', cat: 'فواتير' },
  ];

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-slate-300 text-sm">آخر العمليات</div>
          <div className="text-lg font-semibold text-slate-100 mt-1">قائمة مختصرة</div>
        </div>
        <div className="text-xs text-slate-500">Placeholder</div>
      </div>

      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div
            key={r.title}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10 transition"
          >
            <div>
              <div className="text-slate-100 font-semibold">{r.title}</div>
              <div className="text-xs text-slate-500">{r.cat}</div>
            </div>
            <div
              className={`font-semibold ${
                r.amount.startsWith('+') ? 'text-emerald-200' : 'text-rose-200'
              }`}
            >
              {r.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Wallets: React.FC = () => {
  // UI-only placeholders; keep state minimal.
  const hasWallets = false;

  return (
    <div dir="rtl" className="space-y-8 py-6">
      <PremiumHeader
        title="المحافظ"
        subtitle="نظرة premium على رصيدك ومحفزات الادخار — واجهة جاهزة للربط لاحقًا."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {hasWallets ? (
            <div className="space-y-4">
              <WalletCard name="Cash" currency="USD" balance="$ 3,420" />
              <WalletCard name="Bank" currency="USD" balance="$ 12,870" />
            </div>
          ) : (
            <EmptyState
              title="لا توجد محافظ بعد"
              subtitle="ابدأ بإضافة محفظة جديدة لتظهر البطاقات هنا."
            />
          )}
        </div>

        <div className="space-y-4">
          <SavingsOverviewCard />
          <TransactionsPreviewCard />
        </div>
      </div>

      {/* Bottom actions placeholders */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          className="flex-1 px-5 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-slate-100 font-semibold shadow-sm"
        >
          إنشاء محفظة
        </button>
        <button
          type="button"
          className="flex-1 px-5 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition shadow"
        >
          عرض ملخص مالي
        </button>
      </div>
    </div>
  );
};

export default Wallets;

