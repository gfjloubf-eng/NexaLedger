import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthProvider';
import AuthShell from './AuthShell';
import { Button, Input } from '../components/ui';

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');

  const [error, setError] = useState<
    string | null
  >(null);
  const [info, setInfo] = useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const canSubmit = useMemo(() => {
    return (
      email.trim().length > 3 &&
      password.length >= 6
    );
  }, [email, password]);

  const onSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      setError(null);
      setInfo(null);

      const result = await signUp(
        email.trim(),
        password
      );

      if (result.session) {
        navigate('/login', {
          replace: true,
        });
      } else {
        setInfo(
          'تم إنشاء الحساب بنجاح. تحقق من بريدك الإلكتروني لإكمال التفعيل ثم سجل الدخول.'
        );
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'فشل إنشاء الحساب';

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="مرحبًا بك في NexaLedger"
      subtitle="تجربة مالية عربية حديثة مصممة للوضوح والتركيز."
      rightPanelTitle="NexaLedger"
      rightPanelSubtitle=""
    >
      <div dir="rtl" className="w-full">
        <form onSubmit={onSubmit} className="space-y-5">
          {error ? (
            <div
              className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}
          {info ? (
            <div
              className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100"
              role="status"
              aria-live="polite"
            >
              {info}
            </div>
          ) : null}

          <Input
            label="البريد الإلكتروني"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="كلمة المرور"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full py-4"
          >
            {submitting ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </Button>

          <div className="text-center text-sm text-slate-400">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-semibold text-[#10B981] transition">
              تسجيل الدخول
            </Link>
          </div>

          <div className="pt-4 text-center text-[11px] text-slate-500">
            NexaLedger v1.0 • Crafted by Ammar 
          </div>
        </form>
      </div>
    </AuthShell>
  );
}