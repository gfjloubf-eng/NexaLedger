 import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

import { Button, Input } from '../components/ui';
import { AnimatePresence, motion } from 'framer-motion';

function GoogleGlyph() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c1.9 0 3.7.66 5.1 1.78l3.7-3.7C30.8 5.42 27.6 4.2 24 4.2 16.2 4.2 9.7 8.7 6.4 15.2l4.6 3.6C12.5 13.7 17.8 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.6 24.5c0-1.6-.16-3.1-.45-4.5H24v9.1h12.6c-.54 2.9-2.2 5.4-4.65 7l4.5 3.5c2.8-2.6 4.15-6.5 4.15-15.1z"
      />
      <path
        fill="#FBBC05"
        d="M11 27.8c-.42-1.3-.66-2.7-.66-4.3 0-1.6.24-3 0.66-4.3l-4.6-3.6C4 17.4 3.2 20.5 3.2 23.5c0 3 .8 6.1 3.2 8.4l4.6-3.6z"
      />
      <path
        fill="#34A853"
        d="M24 44.8c6.1 0 11.2-2 15.1-5.4l-4.5-3.5c-2.1 1.4-4.85 2.3-10.6 2.3-6.2 0-11.5-4.2-13.4-9.3l-4.6 3.6C9.7 39.2 16.2 44.8 24 44.8z"
      />
    </svg>
  );
}

export default function Login() {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const canSubmit = useMemo(
    () => email.trim().length > 3 && password.length >= 6,
    [email, password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      // keep existing auth behavior (no redesign of routing/auth logic)
      await signInWithPassword(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="مرحبًا بك في NexaLedger"
      subtitle="مساحتك المالية لإدارة أعمالك بثقة ووضوح"
      rightPanelTitle="الاستقرار التشغيلي"
      rightPanelSubtitle="مصمم ليبقى ثابتًا حتى عند اضطراب الشبكة."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AnimatePresence initial={false}>
          {error ? (
            <motion.div
              key="login-error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              role="alert"
              aria-live="polite"
              className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200"
            >
              {error}
            </motion.div>
          ) : (
            <div className="h-10" aria-hidden="true" />
          )}
        </AnimatePresence>

        {/* Premium provider surface (visual only; no auth logic changes) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {}}
            className="group w-full rounded-xl border border-white/6 bg-[#18222F] px-4 py-3 text-sm font-semibold text-[#F4F7FA] shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-[1px] hover:border-[#7CFFB2]/30"
            aria-label="Continue with Google"
          >
            <div className="flex items-center justify-center gap-3">
              <span className="flex items-center justify-center rounded-lg bg-[#10171F] border border-white/6 p-2 transition group-hover:border-[#7CFFB2]/25">
                <GoogleGlyph />
              </span>
              <span className="tracking-[0.01em]">تسجيل الدخول باستخدام Google</span>
            </div>
            <div className="mt-2 h-px w-full bg-white/5" aria-hidden="true" />
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7F8A98]">
              بطاقة موفّر الهوية
            </div>
          </button>
        </div>

        <div className="space-y-4">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-white/6 bg-[#18222F] px-4 py-3 text-[15px] text-[#F4F7FA] placeholder:text-[#7F8A98] outline-none focus:border-[#7CFFB2]/60 focus:ring-0"
          />

          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-white/6 bg-[#18222F] px-4 py-3 text-[15px] text-[#F4F7FA] placeholder:text-[#7F8A98] outline-none focus:border-[#7CFFB2]/60 focus:ring-0"
          />
        </div>

        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-[#B7C2CF] select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 accent-[#7CFFB2]"
            />
            تذكّر الجهاز
          </label>

          <Link
            className="text-sm font-semibold text-[#B7C2CF] transition hover:text-[#F4F7FA]"
            to="#"
            onClick={(e) => e.preventDefault()}
          >
هل نسيت كلمة المرور؟
          </Link>
        </div>

        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>Secure cloud connection</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>Local-first continuity</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>Sync protection enabled</span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl px-4 py-3"
        >
          {submitting ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[#7F8A98]">لا تملك حسابًا بعد؟</div>
          <Link
            className="text-sm font-semibold text-[#7CFFB2] transition hover:text-[#9BFFD0]"
            to="/register"
          >
إنشاء حساب
          </Link>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="w-9 h-9 rounded-2xl bg-[#121A24] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#B08968]"
            >
              ⟡
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-[#7F8A98]">
الاستقرار التشغيلي
              </div>
              <div className="mt-1 text-sm font-semibold text-[#F4F7FA]">
مصمم ليبقى ثابتًا حتى أثناء اضطراب الاتصال بالشبكة.
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-xs uppercase tracking-[0.12em] text-[#7F8A98]">
خيارات هادئة
            </div>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {["البصمة الحيوية", "البصمة", "مفتاح الأمان", "جهاز موثوق"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {}}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#B7C2CF] transition hover:border-[#7CFFB2]/30"
                >
                  {label}
                </button>
              )
            )}
          </div>
 <div className="mt-3 text-xs text-[#7F8A98] leading-relaxed">
  {rememberDevice
    ? 'تم تفعيل الثقة بالجهاز — استمرار آمن.'
    : 'العمل محليًا — تُستأنف المزامنة تلقائيًا.'}
</div>
        </div>
      </form>
    </AuthShell>
  );
}


