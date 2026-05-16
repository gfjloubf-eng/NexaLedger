import React from 'react';
import BrandSignature from '../components/ui/BrandSignature';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  rightPanelTitle: string;
  rightPanelSubtitle: string;
};

const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  children,
  rightPanelTitle,
  rightPanelSubtitle,
}) => {
  return (
    <div dir="rtl" className="min-h-screen relative overflow-hidden">
      {/* Atmosphere: subtle dark overlay + gentle color wash */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.06),transparent_30%),radial-gradient(circle_at_80%_40%,rgba(37,99,235,0.04),transparent_40%)] mix-blend-overlay opacity-60" />
      </div>

      <div className="relative z-[1] max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Form */}
          <div className="flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
                  <span aria-hidden="true">✨</span>
                  <span>تجربة مالية عربية هادئة</span>
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-300 bg-clip-text text-transparent">
                  {title}
                </h1>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{subtitle}</p>

                <div className="mt-5">
                  <BrandSignature className="opacity-90" />
                </div>
              </div>

              {children}
            </div>
          </div>

          {/* Right: Premium intro - simplified and calm */}
          <div className="hidden lg:flex">
            <div className="w-full rounded-3xl border border-white/6 bg-[rgba(15,23,42,0.72)] backdrop-blur-md shadow-[0_8px_30px_rgba(2,6,23,0.6)] p-8 relative overflow-hidden">
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-[#94A3B8]">أهلاً بك في</div>
                    <div className="mt-2 text-2xl font-semibold text-[#F8FAFC]">{rightPanelTitle}</div>
                    {rightPanelSubtitle ? <div className="mt-3 text-sm text-[#94A3B8] leading-relaxed">{rightPanelSubtitle}</div> : null}
                  </div>

                  <div className="h-12 w-12 rounded-3xl bg-white/3 ring-1 ring-white/6 flex items-center justify-center text-2xl" aria-hidden="true">⚡</div>
                </div>

                <div className="mt-6">
                  <div className="text-xs text-[#94A3B8]">ثقة · وضوح · استقرار تشغيلي</div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="rounded-full bg-white/3 px-3 py-1 text-xs text-[#F8FAFC]">RTL أصلي</div>
                    <div className="rounded-full bg-white/3 px-3 py-1 text-xs text-[#F8FAFC]">تصميم هادئ</div>
                    <div className="rounded-full bg-white/3 px-3 py-1 text-xs text-[#F8FAFC]">لون مختار بعناية</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-6" aria-hidden="true" />
      </div>
    </div>
  );
};

export default AuthShell;

