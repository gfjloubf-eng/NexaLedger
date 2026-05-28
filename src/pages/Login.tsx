import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';

import { Button, Input } from '../components/ui';
import { AnimatePresence, motion } from 'framer-motion';

export default function Login() {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);

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
      title="بيئة مالية تشغيلية متكاملة"
      subtitle="مصممة للعمل بثبات وهدوء داخل بيئة تشغيل موثوقة."
      rightPanelTitle="الاستقرار التشغيلي"
      rightPanelSubtitle="مصمم ليستمر بثبات حتى أثناء اضطرابات الشبكة أو انقطاع الاتصال."
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

        <div className="space-y-4">
          <Input
            label="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-white/6 bg-[#18222F] px-4 py-3 text-[15px] text-[#F4F7FA] placeholder:text-[#7F8A98] outline-none focus:border-[#7CFFB2]/60 focus:ring-0"
          />

          <Input
            label="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-xl border border-white/6 bg-[#18222F] px-4 py-3 text-[15px] text-[#F4F7FA] placeholder:text-[#7F8A98] outline-none focus:border-[#7CFFB2]/60 focus:ring-0"
          />
        </div>

        {/* Smart operational controls */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2 text-sm text-[#B7C2CF] select-none">
            <input
              type="checkbox"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="h-4 w-4 accent-[#7CFFB2]"
            />
            تذكر الجهاز
          </label>

          <Link
            className="text-sm font-semibold text-[#B7C2CF] transition hover:text-[#F4F7FA]"
            to="#"
            onClick={(e) => e.preventDefault()}
          >
            نسيت كلمة المرور؟
          </Link>
        </div>

        {/* Trust indicators (UI-only) */}
        <div className="pt-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>الاتصال السحابي مؤمّن</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>أولوية تشغيل محلية</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#F4F7FA]">
            <span className="text-[#7CFFB2]" aria-hidden>
              ✓
            </span>
            <span>حماية المزامنة مفعّلة</span>
          </div>
        </div>


        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl px-4 py-3"
        >
          {submitting ? 'جارٍ تسجيل الدخول...' : 'دخول'}
        </Button>

        {/* Premium quiet footer link */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-[#7F8A98]">ليس لديك حساب؟</div>
          <Link className="text-sm font-semibold text-[#7CFFB2] transition hover:text-[#9BFFD0]" to="/register">
            إنشاء حساب
          </Link>
        </div>

        {/* Continuity section (UI-only) */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="w-9 h-9 rounded-2xl bg-[#121A24] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[#B08968]"
            >
              ⟡
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.12em] text-[#7F8A98]">الاستقرار التشغيلي</div>
              <div className="mt-1 text-sm font-semibold text-[#F4F7FA]">
                مصمم ليستمر بثبات حتى أثناء اضطرابات الشبكة أو انقطاع الاتصال.
              </div>
            </div>
          </div>
        </div>


        {/* Future auth placeholders (no logic yet) */}
        <div className="pt-2">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <div className="text-xs uppercase tracking-[0.12em] text-[#7F8A98]">Soon</div>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              'Google Auth',
              'Microsoft Auth',
              'Biometrics',
              'Fingerprint'
            ].map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {}}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-[#B7C2CF] transition hover:border-[#7CFFB2]/30"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-3 text-xs text-[#7F8A98] leading-relaxed">
            {rememberDevice ? 'Device trust enabled — secure continuity active.' : 'Operating locally — sync resumes automatically.'}
          </div>
        </div>
      </form>
    </AuthShell>
  );
}

