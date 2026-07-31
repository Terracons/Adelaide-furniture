'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function RegisterClient() {
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) return setError('Please use at least 8 characters for your password.');
    if (form.password !== form.confirm) return setError('Those passwords do not match.');

    setBusy(true);
    const res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
    setBusy(false);
    if (!res.ok) return setError(res.message);
    toast('Account created - welcome to Adelaide Furniture');
    router.push('/account/');
  }

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-soft">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold-50 text-gold-600"><UserPlus size={22} /></span>
          <h1 className="mt-4 text-2xl font-semibold">Create your account</h1>
          <p className="mt-1 text-sm text-ink-400">Faster checkout, order tracking, and your wishlist saved.</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="r-name">Full name</label>
            <input id="r-name" required className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
          </div>
          <div>
            <label className="label" htmlFor="r-email">Email</label>
            <input id="r-email" type="email" required className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="r-phone">Phone (optional)</label>
            <input id="r-phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="r-pass">Password</label>
              <input id="r-pass" type="password" required className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="r-conf">Confirm</label>
              <input id="r-conf" type="password" required className="field" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} autoComplete="new-password" />
            </div>
          </div>

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full">{busy ? 'Creating...' : 'Create account'}</button>
          <p className="text-center text-[11px] leading-relaxed text-ink-400">
            This is a demo store. Accounts are stored in your browser only - never enter a real password you use elsewhere.
          </p>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account? <Link href="/account/login/" className="font-semibold text-gold-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
