import React from 'react';
import { motion } from 'framer-motion';
import BrandSignature from '../components/ui/BrandSignature';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  rightPanelTitle: string;
  rightPanelSubtitle: string;
};

const graphite = {
  a: '#050816',
  b: '#0B1018',
  c: '#121A24',
  d: '#18222F',
} as const;

const AuthShell: React.FC<AuthShellProps> = ({
  children,
  rightPanelTitle,
  rightPanelSubtitle,
}) => {
  return (
    <div dir="rtl" className="min-h-screen relative overflow-hidden bg-[#050816]">
      {/* Operational atmosphere depth ladder (base void -> layer -> card) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#050816]" />
        <div className="absolute inset-0 bg-[#0B1018]" />

        {/* Breathing atmosphere fields (no “one giant dark block”) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(1100px 520px at 12% 12%, ${graphite.c}66 0%, transparent 58%),` +
              `radial-gradient(950px 480px at 82% 30%, ${graphite.d}55 0%, transparent 60%),` +
              `radial-gradient(720px 390px at 55% 88%, ${graphite.b}45 0%, transparent 62%)`,
          }}
        />

        {/* restrained green diffusion (tasteful tint, not neon) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              `radial-gradient(720px 420px at 18% 22%, rgba(124,255,178,0.10) 0%, transparent 60%),` +
              `radial-gradient(620px 380px at 78% 45%, rgba(124,255,178,0.07) 0%, transparent 62%)`,
          }}
        />

        {/* Blur diffusion fields */}
        <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-[#18222F]/70 blur-3xl" />
        <div className="absolute top-[18%] right-[-12%] h-80 w-80 rounded-full bg-[#121A24]/60 blur-3xl" />
        <div className="absolute bottom-[-18%] left-[8%] h-96 w-96 rounded-full bg-[#0B1018]/60 blur-3xl" />

        {/* Ultra-soft grain/noise feel */}
        <div
          className="absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage:
              `repeating-linear-gradient(0deg, rgba(255,255,255,0.16), rgba(255,255,255,0.16) 1px, transparent 1px, transparent 3px),` +
              `repeating-linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.10) 1px, transparent 1px, transparent 4px)`,
            backgroundSize: '10px 10px, 16px 16px',
            opacity: 0.06,
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      </div>

      <div className="relative z-[1] w-full px-4 pt-[max(24px,env(safe-area-inset-top))] pb-8">
        {/* MOBILE only */}
        <div className="flex flex-col gap-6 max-w-3xl mx-auto lg:hidden">
          <motion.section
            className="rounded-3xl border border-white/8 bg-[#0B1018]/40 backdrop-blur-sm p-5 sm:p-7 shadow-[0_18px_70px_rgba(0,0,0,0.35)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div
                    className="h-9 w-9 rounded-2xl ring-1 ring-white/10 bg-[#121A24] flex items-center justify-center"
                    aria-hidden="true"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2.8L21 8.3V15.7L12 21.2L3 15.7V8.3L12 2.8Z"
                        stroke="rgba(255,255,255,0.08)"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M8.6 12H15.4"
                        stroke="#7CFFB2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M12 9.1V14.9"
                        stroke="#7CFFB2"
                        strokeWidth="1.1"
                        strokeLinecap="round"
                        opacity="0.65"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-[0.12em] text-[#B7C2CF]">
                      NEXALEDGER
                    </div>
                    <div className="mt-1 text-sm text-[#7F8A98]">Operational Finance</div>
                  </div>
                </div>

                <h2 className="mt-4 text-[22px] sm:text-3xl leading-tight font-semibold tracking-tight text-[#F4F7FA]">
                  Operational Finance. Built for continuity.
                </h2>
                <p className="mt-2 text-sm sm:text-base text-[#B7C2CF] leading-relaxed">
                  Offline-first financial infrastructure.
                </p>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                    >
                      ✓
                    </span>
                    <span>Secure cloud connection active</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                    >
                      ✓
                    </span>
                    <span>Local-first continuity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                    <span
                      aria-hidden="true"
                      className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                    >
                      ✓
                    </span>
                    <span>Sync protection enabled</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/8 bg-[#121A24] p-4">
                  <div className="text-xs font-semibold tracking-[0.10em] text-[#7F8A98] uppercase">
                    Continuity
                  </div>
                  <div className="mt-2 text-sm text-[#B7C2CF] leading-relaxed">
                    Operating locally first—your workspace stays usable even when networks are unstable.
                  </div>
                </div>
              </div>

              <div
                className="hidden sm:flex h-12 w-12 rounded-2xl bg-[#121A24] ring-1 ring-white/10 items-center justify-center text-xl"
                aria-hidden="true"
              >
                ⌁
              </div>
            </div>

            <div className="mt-5">
              <BrandSignature className="opacity-100" />
            </div>
          </motion.section>

          <motion.aside
            className="rounded-3xl border border-white/10 bg-[#121A24]/50 backdrop-blur-md p-5 sm:p-7 shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.22, delay: 0.02, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-[0.12em] text-[#B7C2CF]">Secure access</div>
                <div className="mt-2 text-2xl font-semibold text-[#F4F7FA]">{rightPanelTitle}</div>
                {rightPanelSubtitle ? (
                  <div className="mt-3 text-sm text-[#B7C2CF] leading-relaxed">{rightPanelSubtitle}</div>
                ) : null}
              </div>
              <div
                className="h-11 w-11 rounded-2xl bg-[#121A24] ring-1 ring-white/10 flex items-center justify-center text-lg"
                aria-hidden="true"
              >
                ⛨
              </div>
            </div>

            <div className="mt-6 relative">
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 rounded-3xl bg-gradient-to-r from-white/5 via-transparent to-white/5 blur-2xl opacity-60"
                initial={{ opacity: 0.25 }}
                animate={{ opacity: 0.33 }}
                transition={{ duration: 7.5, ease: 'easeInOut' }}
              />
              <div className="relative">{children}</div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-[#0B1018]/25 p-3">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full bg-[#7CFFB2] shadow-[0_0_0_4px_rgba(124,255,178,0.08)]"
                />
                <div className="text-[11px] font-semibold tracking-[0.12em] text-[#7F8A98] uppercase">
                  ONLINE
                </div>
              </div>
              <div className="mt-1 text-sm text-[#B7C2CF]">Secure cloud connection active</div>
            </div>
          </motion.aside>
        </div>

        {/* DESKTOP only */}
        <div className="hidden lg:block max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-[420px,1fr] gap-10 items-start py-10">
            <motion.section
              className="rounded-3xl border border-white/8 bg-[#0B1018]/40 backdrop-blur-sm p-8 shadow-[0_24px_90px_rgba(0,0,0,0.40)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-10 w-10 rounded-2xl ring-1 ring-white/10 bg-[#121A24] flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-[18px] text-[#F4F7FA]">⬢</span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold tracking-[0.12em] text-[#B7C2CF]">NEXALEDGER</div>
                      <div className="text-sm text-[#7F8A98] mt-1">Operational Finance</div>
                    </div>
                  </div>

                  <h2 className="mt-5 text-[26px] leading-tight font-semibold tracking-tight text-[#F4F7FA]">
                    Operational Finance. Built for continuity.
                  </h2>
                  <p className="mt-2 text-sm text-[#B7C2CF] leading-relaxed">
                    Offline-first financial infrastructure.
                  </p>

                  <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                      >
                        ✓
                      </span>
                      <span>Secure cloud connection active</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                      >
                        ✓
                      </span>
                      <span>Local-first continuity</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#B7C2CF]">
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 rounded-xl bg-[#0B1018] ring-1 ring-emerald-400/20 flex items-center justify-center text-[#7CFFB2]"
                      >
                        ✓
                      </span>
                      <span>Sync protection enabled</span>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/8 bg-[#121A24] p-5">
                    <div className="text-xs font-semibold tracking-[0.10em] text-[#7F8A98] uppercase">Continuity</div>
                    <div className="mt-2 text-sm text-[#B7C2CF] leading-relaxed">
                      Operating locally first—your workspace stays usable even when networks are unstable.
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <BrandSignature className="opacity-100" />
              </div>
            </motion.section>

            <motion.aside
              className="rounded-3xl border border-white/10 bg-[#121A24]/50 backdrop-blur-md p-8 shadow-[0_24px_90px_rgba(0,0,0,0.45)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.22, delay: 0.02, ease: 'easeOut' }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-semibold tracking-[0.12em] text-[#B7C2CF]">Secure access</div>
                  <div className="mt-2 text-2xl font-semibold text-[#F4F7FA]">{rightPanelTitle}</div>
                  {rightPanelSubtitle ? (
                    <div className="mt-3 text-sm text-[#B7C2CF] leading-relaxed">{rightPanelSubtitle}</div>
                  ) : null}
                </div>
                <div
                  className="h-11 w-11 rounded-2xl bg-[#121A24] ring-1 ring-white/10 flex items-center justify-center text-lg"
                  aria-hidden="true"
                >
                  ⛨
                </div>
              </div>

              <div className="mt-6">{children}</div>
            </motion.aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;



