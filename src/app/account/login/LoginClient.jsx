'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function LoginClient() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (ready && user) router.replace('/account/'); }, [ready, user, router]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await login(form.email, form.password);
    setBusy(false);
    if (!res.ok) { setError(res.message); return; }
    toast(`Welcome back, ${res.user.name.split(' ')[0]}`);
    router.push('/account/');
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-7 shadow-soft">
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold-50 text-gold-600"><LogIn size={22} /></span>
            <h1 className="mt-4 text-2xl font-semibold">Welcome back</h1>
            <p className="mt-1 text-sm text-ink-400">Sign in to track orders and save your details.</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input id="email" type="email" required className="field pl-10" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input id="password" type="password" required className="field pl-10" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
              </div>
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink-500">
            No account yet? <Link href="/account/register/" className="font-semibold text-gold-600 hover:underline">Create one</Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-dashed border-gold-300 bg-gold-50/60 p-4 text-xs leading-relaxed text-gold-900">
          <strong>Demo account:</strong> priya.nandan@example.com / demo1234
          <br />
          <strong>Admin panel:</strong> <Link href="/admin/login/" className="underline">/admin</Link> · admin@adelaidefurniture.com.au / adelaide2026
        </div>
      </div>
    </div>
  );
}
