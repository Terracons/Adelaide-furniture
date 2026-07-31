'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AdminLoginClient() {
  const { signInAdmin, admin, ready } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (ready && admin) router.replace('/admin/'); }, [ready, admin, router]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    const res = await signInAdmin(form.email, form.password);
    setBusy(false);
    if (!res.ok) return setError(res.message);
    router.push('/admin/');
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-7 shadow-lift">
          <div className="text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-gold-500 text-ink"><ShieldCheck size={22} /></span>
            <h1 className="mt-4 text-2xl font-semibold">Admin panel</h1>
            <p className="mt-1 text-sm text-ink-400">Adelaide Furniture store management</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="a-email">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input id="a-email" type="email" required className="field pl-10" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="username" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="a-pass">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
                <input id="a-pass" type="password" required className="field pl-10" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
              </div>
            </div>

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

            <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>

          <div className="mt-5 rounded-xl border border-dashed border-gold-300 bg-gold-50/70 p-3.5 text-xs leading-relaxed text-gold-900">
            <strong>Demo credentials</strong><br />
            admin@adelaidefurniture.com.au<br />
            adelaide2026
            <p className="mt-2 text-gold-800">Change these in Admin &rarr; Settings, or in <code>src/data/settings.json</code>.</p>
          </div>
        </div>

        <Link href="/" className="mt-5 block text-center text-xs text-cream/50 hover:text-gold-400">&larr; Back to the storefront</Link>
      </div>
    </div>
  );
}
