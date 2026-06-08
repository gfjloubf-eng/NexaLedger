import { useEffect, useMemo, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';


import { buildCashFlowForecast, buildFinancialNotifications } from '../systems/cash-flow-forecast';

import FinCard from '../components/ui/FinCard';
import FinLoadingCard from '../components/ui/FinLoadingCard';

import { useAuth } from '../context/AuthProvider';

import type { Customer } from '../types/customer';
import type { Invoice } from '../types/invoice';
import type { Payment } from '../types/payment';

import { loadCustomers } from '../lib/customerPersistence';
import { loadInvoices } from '../lib/invoicePersistence';
import { loadPayments } from '../lib/paymentPersistence';

import type { CashFlowForecastInput, CashFlowInvoice } from '../systems/cash-flow-forecast/types';
import type { CollectionConfidence } from '../systems/cash-flow-forecast/forecastTypes';
import type { NotificationSeverity } from '../systems/cash-flow-forecast/notificationTypes';

const cashHealthLabelAr: Record<'healthy' | 'warning' | 'critical', string> = {
  healthy: 'صحة التدفق النقدي: جيدة',
  warning: 'صحة التدفق النقدي: تنبيه',
  critical: 'صحة التدفق النقدي: حرجة',
};



const confidenceLabelAr: Record<CollectionConfidence, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'مرتفعة',
};

const severityLabelAr: Record<NotificationSeverity, string> = {
  info: 'معلومة',
  warning: 'تحذير',
  critical: 'حرج',
};

const toCashFlowInvoice = (inv: Invoice, nowMs: number): CashFlowInvoice => {
  const dueAtMs = typeof inv.dueDate === 'number' ? inv.dueDate : nowMs;
  const daysPastDue = (nowMs - dueAtMs) / (1000 * 60 * 60 * 24);
  // daysPastDueFactor in [0..1], lower for more overdue.
  // overdue <=0 => factor 1
  // overdue 0..60 days => factor drops to ~0.25
  const factor = daysPastDue <= 0 ? 1 : Math.max(0.1, Math.min(1, 1 - daysPastDue / 60));

  return {
    id: inv.id,
    amountDue: Number.isFinite(inv.amount) ? inv.amount : 0,
    dueAtMs,
    isPaid: inv.status === 'paid' || inv.status === 'unpaid' ? inv.status === 'paid' : false,
    daysPastDueFactor: factor,
  };
};

export default function CashFlowForecastPage() {
  const { user } = useAuth();




  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const [c, i, p] = await Promise.all([
          loadCustomers(user.id),
          loadInvoices(user.id),
          loadPayments(user.id),
        ]);

        if (cancelled) return;
        setCustomers(c);
        setInvoices(i);
        setPayments(p);
      } catch (e) {
        console.error('[CashFlowForecast] failed to load data', e);
        if (!cancelled) {
          setCustomers([]);
          setInvoices([]);
          setPayments([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Use a fixed snapshot time to keep the component render-pure.
  // (Real due dates are driven by invoice.dueDate when available.)
  const nowMs = 0;









  const input: CashFlowForecastInput = useMemo(() => {
    const cashFlowInvoices = invoices.map((inv) => toCashFlowInvoice(inv, nowMs));

    const outstandingNow = cashFlowInvoices.reduce((sum, inv) => {
      if (inv.isPaid) return sum;
      return sum + Math.max(0, inv.amountDue);
    }, 0);

    // Customers / payments / statements are supported by the forecast input type,
    // but the current forecastEngine primarily relies on invoices + outstandingNow.
    const cashFlowCustomers = customers.map((c) => ({
      id: c.id,
      riskScore: 0.5,
    }));

    return {
      nowMs,
      customers: cashFlowCustomers,
      invoices: cashFlowInvoices,
      payments: payments.map((p) => ({
        id: p.id,
        amount: p.amount,
        paidAtMs: p.createdAt,
      })),
      statements: [],
      outstandingNow,
    };
  }, [customers, invoices, payments, nowMs]);

  const forecast = useMemo(() => buildCashFlowForecast(input), [input]);

  // Minimal real counts: compute overdue + large outstanding opportunities from invoices.
  const notifications = useMemo(() => {
    const overdueCount = invoices.filter((inv) => inv.status !== 'paid' && typeof inv.dueDate === 'number' && inv.dueDate < nowMs).length;
    const collectibleInvoicesCount = input.invoices.filter((inv) => !inv.isPaid && inv.dueAtMs - nowMs <= 90 * 24 * 60 * 60 * 1000).length;

    return buildFinancialNotifications({
      forecast,
      cashHealth: forecast.cashHealth,
      invoiceDueOverdueCount: overdueCount,
      highRiskCustomerCount: 0,
      largeOutstandingBalanceCount: input.outstandingNow > 0 ? 1 : 0,
      collectionOpportunityCount: collectibleInvoicesCount,
      cashFlowWarningsCount: overdueCount,
      rawInput: input,
    });
  }, [forecast, invoices, input, nowMs]);

  const healthColor = forecast.cashHealth;
  const healthRing =
    healthColor === 'healthy'
      ? 'ring-emerald-400/25'
      : healthColor === 'warning'
      ? 'ring-amber-400/30'
      : 'ring-rose-400/30';
  const healthAccent =
    healthColor === 'healthy'
      ? 'from-emerald-500/40 via-emerald-500/10 to-transparent'
      : healthColor === 'warning'
      ? 'from-amber-500/40 via-amber-500/10 to-transparent'
      : 'from-rose-500/40 via-rose-500/10 to-transparent';
  const healthGlow =
    healthColor === 'healthy'
      ? 'shadow-[0_0_0_1px_rgba(52,211,153,0.25),0_18px_60px_rgba(16,185,129,0.18)]'
      : healthColor === 'warning'
      ? 'shadow-[0_0_0_1px_rgba(251,191,36,0.25),0_18px_60px_rgba(245,158,11,0.18)]'
      : 'shadow-[0_0_0_1px_rgba(248,113,113,0.25),0_18px_60px_rgba(239,68,68,0.20)]';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight">التوقعات المالية</h2>
        <p className="text-slate-200 font-medium mt-1">
          توقعات التحصيل والسيولة بناءً على بياناتك الحالية
        </p>
      </div>


      <FinCard>
        <div
          className={`relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.65)] ${healthGlow} ${healthRing}`}
        >
          {/* premium state gradient */}
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-r ${healthAccent}`} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14),transparent_60%)]" />

          {/* 6px executive accent strip */}
          <div
            className={
              'absolute left-0 top-0 bottom-0 w-[6px] ' +
              (forecast.cashHealth === 'healthy'
                ? 'bg-emerald-400/70 shadow-[0_0_28px_rgba(16,185,129,0.35)]'
                : forecast.cashHealth === 'warning'
                ? 'bg-amber-400/80 shadow-[0_0_28px_rgba(245,158,11,0.35)]'
                : 'bg-rose-400/80 shadow-[0_0_28px_rgba(244,63,94,0.35)]')
            }
          />

          {/* content */}
          <div className="relative p-6">
        <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-white font-bold text-sm">حالة التدفق النقدي</div>
                <div className="mt-2 text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-none">
                  {cashHealthLabelAr[forecast.cashHealth].replace('صحة التدفق النقدي: ', '')}
                </div>
              <div className="mt-2 text-slate-200 font-medium">
                  مؤشرات التوقع والتحصيل بناءً على بياناتك الحالية.
                </div>
              </div>

              {/* risk badge */}
              <div className="flex items-center gap-2">
                {(() => {
                  const ratio = forecast.outstandingProjected / Math.max(1, forecast.outstandingNow);
                  const sev: 'info' | 'warning' | 'critical' =
                    ratio >= 1.15 ? 'info' : ratio >= 0.9 ? 'warning' : 'critical';

                  const badge =
                    sev === 'info'
                      ? {
                          label: severityLabelAr[sev],
                          bg: 'bg-emerald-500/15',
                          ring: 'ring-emerald-400/30',
                          text: 'text-emerald-200',
                        }
                      : sev === 'warning'
                      ? {
                          label: severityLabelAr[sev],
                          bg: 'bg-amber-500/15',
                          ring: 'ring-amber-400/30',
                          text: 'text-amber-200',
                        }
                      : {
                          label: severityLabelAr[sev],
                          bg: 'bg-rose-500/15',
                          ring: 'ring-rose-400/30',
                          text: 'text-rose-200',
                        };

                  return (
                    <span
                      className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-bold ring-1 ${badge.bg} ${badge.ring} ${badge.text}`}
                    >
                      {badge.label}
                    </span>
                  );
                })()}
              </div>
            </div>

              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/15 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.55)] p-4">
                <div className="text-slate-200 font-medium">مستحق الآن</div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-white">
                  {Math.round(forecast.outstandingNow).toLocaleString()} د.إ
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 shadow-[0_18px_60px_rgba(2,6,23,0.55)] p-4">
                <div className="text-xs text-slate-300 font-semibold">مستحق متوقع</div>
                <div className="mt-2 text-4xl font-extrabold tracking-tight text-white">
                  {Math.round(forecast.outstandingProjected).toLocaleString()} د.إ
                </div>
              </div>
            </div>
          </div>
        </div>
      </FinCard>


      <FinCard>
        <div className="flex items-center justify-between gap-4">
          <div>
              <div className="text-sm font-semibold text-slate-50">التدفق النقدي المتوقع</div>
              <div className="mt-1 text-slate-200 font-medium">أفق زمني مرئي بدقة لخطّين رئيسيين</div>
          </div>

          {/* Arabic legend above chart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-3.5 w-3.5 rounded-full bg-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.55)] ring-1 ring-emerald-300/30"
                aria-hidden
              />
              <span className="text-sm font-semibold text-slate-50 tracking-tight">التحصيل المتوقع</span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="inline-flex h-3.5 w-3.5 rounded-full bg-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.55)] ring-1 ring-blue-300/30"
                aria-hidden
              />
              <span className="text-sm font-semibold text-slate-50 tracking-tight">الرصيد المتوقع</span>
            </div>
          </div>
        </div>

        <div className="mt-3" style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <LineChart
              data={forecast.horizons.map((h) => ({
                days: h.horizonDays,
                expectedCollections: h.expectedCollections,
                expectedOutstandingBalance: h.expectedOutstandingBalance,
              }))}
              margin={{ top: 10, right: 16, left: 0, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(148,163,184,0.22)" />
              <XAxis
                dataKey="days"
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v)}`}
              />
              <YAxis
                tick={{ fill: '#94A3B8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => Math.round(v).toString()}
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(2,6,23,0.92)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: 18,
                  boxShadow: '0 24px 70px rgba(0,0,0,0.45), 0 0 0 1px rgba(56,189,248,0.06)',
                  backdropFilter: 'blur(12px)',
                  padding: '12px 14px',
                }}
                labelStyle={{
                  color: '#F8FAFC',
                  fontWeight: 800,
                  fontSize: 13,
                  marginBottom: 6,
                }}
                itemStyle={{
                  color: '#E2E8F0',
                  fontWeight: 700,
                  fontSize: 13,
                }}
                formatter={(value: unknown) => {
                  const n = typeof value === 'number' ? value : Number(value);
                  return `${Math.round(n).toLocaleString()} د.إ`;
                }}
              />
              <Line
                type="monotone"
                dataKey="expectedCollections"
                name="التحصيل المتوقع"
                stroke="#22C55E"
                strokeWidth={4}
                dot={{ r: 5.2, stroke: 'rgba(15,23,42,0.95)', strokeWidth: 2, fill: '#22C55E' }}
                activeDot={{ r: 7.2, stroke: 'rgba(15,23,42,0.95)', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="expectedOutstandingBalance"
                name="الرصيد المتوقع"
                stroke="#3B82F6"
                strokeWidth={4}
                dot={{ r: 5.2, stroke: 'rgba(15,23,42,0.95)', strokeWidth: 2, fill: '#3B82F6' }}
                activeDot={{ r: 7.2, stroke: 'rgba(15,23,42,0.95)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </FinCard>


      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <FinCard>
          <div className="flex items-start justify-between gap-4 p-1">
            <div>
              <div className="text-xs text-slate-300 font-semibold">أفضل فترة تحصيل</div>
              <div className="mt-2 text-xs text-slate-300 font-semibold">{forecast.insights.bestCollectionPeriodDays} يوم</div>
              <div className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50">
                {forecast.horizons.find((h) => h.horizonDays === forecast.insights.bestCollectionPeriodDays)
                  ? confidenceLabelAr[
                      forecast.horizons.find((h) => h.horizonDays === forecast.insights.bestCollectionPeriodDays)!
                        .collectionConfidence
                    ]
                  : '—'}
              </div>
            </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-white/20 shadow-[0_0_0_1px_rgba(16,185,129,0.30),0_18px_60px_rgba(16,185,129,0.18)]">
                <div className="h-4 w-4 rounded-full bg-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.85)]" />
              </div>
          </div>
        </FinCard>


        <FinCard>
              <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-300 font-semibold">أعلى فترة مخاطر</div>
              <div className="mt-2 text-xs text-slate-300 font-semibold">{forecast.insights.highestRiskPeriodDays} يوم</div>
              <div className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50">
                {(() => {
                  const h = forecast.horizons.find((x) => x.horizonDays === forecast.insights.highestRiskPeriodDays);
                  if (!h) return '—';
                  const ratio = h.expectedOutstandingBalance / Math.max(1, forecast.outstandingNow);
                  if (ratio >= 0.6) return severityLabelAr['critical'];
                  if (ratio >= 0.3) return severityLabelAr['warning'];
                  return severityLabelAr['info'];
                })()}
              </div>
            </div>
            <div className="text-[#F97316]">⚠</div>
          </div>
        </FinCard>

        <FinCard>
              <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs text-slate-300 font-semibold">التدفق النقدي المتوقع</div>
              <div className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-50">
                {Math.round(forecast.insights.expectedCashInflow).toLocaleString()} د.إ
              </div>
            </div>
            <div className="text-[#3B82F6]">↗</div>
          </div>
        </FinCard>

        <FinCard>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm text-[#94A3B8]">احتمال نقص السيولة</div>
              <div className="mt-3 text-2xl font-semibold text-[#F8FAFC]">
                {Math.round(forecast.insights.potentialCashShortage * 100)}%
              </div>
            </div>
            <div className="text-[#EF4444]">!</div>
          </div>
        </FinCard>
      </div>

      <FinCard>
        <div className="text-sm text-[#94A3B8]">محرك التنبيهات</div>
        <div className="mt-2 space-y-3">
          {notifications.notifications.map((n, idx) => (
            <div
              key={`${n.titleAr}-${idx}`}
              className={`p-3 rounded-2xl ring-1 ${
                n.severity === 'critical'
                  ? 'bg-rose-500/10 ring-rose-500/20'
                  : n.severity === 'warning'
                  ? 'bg-amber-500/10 ring-amber-500/20'
                  : 'bg-blue-500/10 ring-blue-500/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-[#F8FAFC]">{n.titleAr}</div>
                  <div className="text-sm text-[#94A3B8] mt-1">{n.messageAr}</div>
                </div>
                <div className="text-xs text-[#94A3B8]">{severityLabelAr[n.severity]}</div>
              </div>
            </div>
          ))}
        </div>
      </FinCard>

      {loading ? (
        <div className="hidden">
          <FinLoadingCard />
        </div>
      ) : null}

    </div>
  );
}

