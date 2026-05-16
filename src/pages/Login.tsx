import React, { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import { Button, Input } from '../components/ui';

export default function Login() {
  const { signInWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 3 && password.length >= 6, [email, password]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
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
      subtitle="تجربة مالية عربية حديثة مصممة للوضوح والتركيز."
      rightPanelTitle="NexaLedger"
      rightPanelSubtitle=""
    >
      <form onSubmit={onSubmit} className="space-y-5">
        {error ? (
          <div
            className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200"
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        ) : (
          <div className="h-10" aria-hidden="true" />
        )}

        <Input
          label="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
          required
        />

        <Input
          label="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          required
        />

        <Button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full"
        >
          {submitting ? 'جارٍ الدخول...' : 'دخول'}
        </Button>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-slate-400">
            ليس لديك حساب؟
          </div>
          <Link
            className="text-sm font-semibold text-[#10B981] transition"
            to="/register"
          >
            إنشاء حساب
          </Link>
        </div>

        <div className="h-4" aria-hidden="true" />
      </form>
    </AuthShell>
  );
}

