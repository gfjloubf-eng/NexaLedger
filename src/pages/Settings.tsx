import React, { useState } from 'react';
import { useSettings } from '../context/useSettings';
import type { Locale, Currency } from '../context/settingsConstants';

const SectionCard: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/95 shadow-sm backdrop-blur p-6 dark:border-white/10 dark:bg-white/5 dark:shadow-none">
      <div className="flex items-start justify-between gap-4">

        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
          {subtitle ? (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</div>
          ) : null}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
};

const Settings: React.FC = () => {
  const { locale, setLocale, currency, setCurrency } = useSettings();
  const [updateMsg, setUpdateMsg] = useState<string>('');

  const checkUpdates = () => {
    // UI-only: show calm professional message
    setUpdateMsg('أنت تستخدم أحدث إصدار من NexaLedger');
    window.setTimeout(() => setUpdateMsg(''), 4200);
  };

  return (
    <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="space-y-6 py-6">
      <div>
        <h1 className="text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
          الإعدادات
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm max-w-2xl">
          واجهة إعداداتٍ هادئة ومهنية لإدارة تفضيلات النظام والدعم.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <SectionCard
            title="الملف الشخصي"
            subtitle="بيانات محلية جاهزة للربط لاحقًا"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-3xl bg-slate-100/80 text-slate-900 ring-1 ring-slate-200 flex items-center justify-center text-2xl dark:bg-gradient-to-br dark:from-blue-500/20 dark:to-emerald-400/15 dark:ring-white/10 dark:text-white">
                  👤
                </div>
                <div>
                  <div className="text-slate-900 font-semibold dark:text-slate-100">المستخدم</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">email@domain.com</div>
                </div>
              </div>
              <button
                type="button"
                className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
              >
                تعديل
              </button>
            </div>
          </SectionCard>

          <SectionCard
            title="المظهر"
            subtitle="خيارات عرض هادئة" 
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { k: 'الوضع الداكن', v: 'مفعّل' },
                { k: 'حواف ناعمة', v: 'مفعّل' },
                { k: 'خفوت Glass', v: 'متحكم' },
                { k: 'حركة سلسة', v: 'مفعّل' },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between dark:border-white/10 dark:bg-white/5"
                >
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{x.k}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{x.v}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="اللغة والعملة" subtitle="تفضيلات العرض والتمثيل النقدي">
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">اللغة</label>
                  <select
                    value={locale}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLocale(e.target.value as Locale)}
                    className="input"
                    aria-label="Select language"
                  >
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-2">العملة</label>
                  <select
                    value={currency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value as Currency)}
                    className="input"
                    aria-label="Select currency"
                  >
                    <option value="SAR">SAR — ريال سعودي</option>
                    <option value="YER">YER — ريال يمني</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="AED">AED — درهم إماراتي</option>
                    <option value="EUR">EUR — Euro</option>
                  </select>
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">التفضيلات تحفظ محليًا ويمكن ربطها لاحقًا بالحساب.</div>
            </div>
          </SectionCard>

          <SectionCard title="التنبيهات" subtitle="إعدادات إشعارات هادئة">
            <div className="space-y-3">
              {[
                { k: 'تنبيهات الميزانية', v: 'مفعّل' },
                { k: 'تنبيه أهداف الادخار', v: 'مفعّل' },
                { k: 'ملخص أسبوعي', v: 'غير مفعّل' },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between dark:border-white/10 dark:bg-white/5"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{x.k}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{x.v}</div>
                  </div>
                  <div className="h-9 w-16 rounded-2xl border border-slate-200 bg-slate-100 flex items-center px-1 dark:border-white/10 dark:bg-white/10">
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-400" />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-4">
          <SectionCard title="الدعم" subtitle="طرق تواصل احترافية">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-white/10 dark:bg-gradient-to-br dark:from-blue-500/10 dark:to-emerald-400/10">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Support Lead</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">المهندس عمار المصوعي</div>

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Product</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">NexaLedger</div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Version</div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">v0.0.0</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    الحالة التشغيلية: متّاحة ومستقرة
                  </div>

                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    WhatsApp Business: +967712275038
                  </div>
                </div>

                <div className="flex flex-col items-stretch gap-3 sm:items-end">
                  <a
                    href="https://wa.me/967712275038"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 px-5 py-3 font-semibold text-slate-950 shadow-sm ring-1 ring-white/10 transition hover:brightness-110"
                    aria-label="WhatsApp business support"
                  >
                    <span aria-hidden="true">💬</span>
                    تواصل عبر WhatsApp
                  </a>
                  <div className="text-[11px] text-slate-500/80">
                    للدعم والمساعدة التشغيلية يمكن التواصل مباشرة مع فريق NexaLedger عبر WhatsApp Business.
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  k: 'مركز المساعدة',
                  v: 'مقالات وإرشادات تشغيلية',
                  icon: '🛟',
                },
                {
                  k: 'التواصل (WhatsApp)',
                  v: '+967712275038',
                  icon: '💬',
                },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center dark:bg-white/10 dark:ring-white/10">
                      {x.icon}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{x.k}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{x.v}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                    onClick={() => {
                      // UI-only: no external calls
                    }}
                  >
                    فتح
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full px-4 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-emerald-400 text-slate-950 font-semibold hover:brightness-110 transition shadow"
                  onClick={() => {
                    // WhatsApp handled by anchor above; this is a safe UI affordance
                    window.open('https://wa.me/967712275038', '_blank');
                  }}
                >
                  تواصل الآن
                </button>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                ملاحظة: الارتباطات تفتح تطبيق WhatsApp أو المتصفح. هذه واجهة عرض آمنة.
              </div>
            </div>
          </SectionCard>

          <SectionCard title="حول النظام" subtitle="هوية المنصة والتحقق من التحديثات">
            <div className="space-y-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">NexaLedger</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">منصة مالية عربية حديثة مصممة للوضوح والاستقرار التشغيلي.</div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 font-semibold transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10"
                  onClick={checkUpdates}
                >
                  التحقق من التحديثات
                </button>
                <div className="flex-1 text-sm text-slate-600 dark:text-slate-300 flex items-center">
                  {updateMsg ? <span className="text-emerald-500 font-semibold">{updateMsg}</span> : <span>أنت تستخدم أحدث إصدار من NexaLedger</span>}
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Settings;

