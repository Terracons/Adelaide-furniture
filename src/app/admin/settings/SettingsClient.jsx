'use client';

import { useEffect, useState } from 'react';
import { Save, Store, Truck, Lock, Megaphone, Share2, AlertTriangle } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import { getSettings, saveSettings, resetDemoData } from '@/lib/data';
import { useToast } from '@/context/ToastContext';

export default function SettingsClient() {
  const { toast } = useToast();
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { getSettings().then(setForm); }, []);

  if (!form) return <AdminShell title="Settings"><div className="skeleton h-64 rounded-2xl" /></AdminShell>;

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    await saveSettings(form);
    setBusy(false);
    toast('Settings saved');
  }

  return (
    <AdminShell
      title="Settings"
      subtitle="Store details, delivery rules and admin access"
      actions={<button onClick={submit} disabled={busy} className="btn-primary btn-sm"><Save size={14} /> {busy ? 'Saving...' : 'Save'}</button>}
    >
      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-2">
        <Section icon={Store} title="Store details">
          <Field label="Store name"><input className="field" value={form.storeName} onChange={(e) => set({ storeName: e.target.value })} /></Field>
          <Field label="Tagline"><input className="field" value={form.tagline} onChange={(e) => set({ tagline: e.target.value })} /></Field>
          <Field label="Description"><textarea rows={3} className="field resize-none" value={form.description} onChange={(e) => set({ description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><input className="field" value={form.email} onChange={(e) => set({ email: e.target.value })} /></Field>
            <Field label="Phone"><input className="field" value={form.phone} onChange={(e) => set({ phone: e.target.value })} /></Field>
          </div>
          <Field label="Address"><input className="field" value={form.address} onChange={(e) => set({ address: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Opening hours"><input className="field" value={form.hours} onChange={(e) => set({ hours: e.target.value })} /></Field>
            <Field label="ABN"><input className="field" value={form.abn} onChange={(e) => set({ abn: e.target.value })} /></Field>
          </div>
        </Section>

        <div className="space-y-4">
          <Section icon={Truck} title="Delivery & tax">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Flat delivery fee (AUD)">
                <input type="number" className="field" value={form.flatShipping} onChange={(e) => set({ flatShipping: Number(e.target.value) })} />
              </Field>
              <Field label="Free delivery over">
                <input type="number" className="field" value={form.freeShippingThreshold} onChange={(e) => set({ freeShippingThreshold: Number(e.target.value) })} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Tax rate (0.1 = 10%)">
                <input type="number" step="0.01" className="field" value={form.taxRate} onChange={(e) => set({ taxRate: Number(e.target.value) })} />
              </Field>
              <Field label="Currency symbol">
                <input className="field" value={form.currencySymbol} onChange={(e) => set({ currencySymbol: e.target.value })} />
              </Field>
            </div>
            <p className="rounded-lg bg-amber-50 p-3 text-[11px] leading-relaxed text-amber-800">
              Delivery thresholds are also hard-coded in <code>CartContext.jsx</code> for the cart drawer.
              Update both if you change them.
            </p>
          </Section>

          <Section icon={Megaphone} title="Announcement bar">
            <Field label="Rotating messages (one per line)">
              <textarea rows={4} className="field resize-none text-sm"
                value={(form.announcements || []).join('\n')}
                onChange={(e) => set({ announcements: e.target.value.split('\n').filter(Boolean) })} />
            </Field>
          </Section>

          <Section icon={Share2} title="Social links">
            {['instagram', 'facebook', 'pinterest', 'youtube'].map((k) => (
              <Field key={k} label={k}>
                <input className="field" value={form.social?.[k] || ''}
                  onChange={(e) => set({ social: { ...form.social, [k]: e.target.value } })} />
              </Field>
            ))}
          </Section>
        </div>

        <Section icon={Lock} title="Admin access">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Admin name">
              <input className="field" value={form.admin?.name || ''} onChange={(e) => set({ admin: { ...form.admin, name: e.target.value } })} />
            </Field>
            <Field label="Admin email">
              <input className="field" value={form.admin?.email || ''} onChange={(e) => set({ admin: { ...form.admin, email: e.target.value } })} />
            </Field>
          </div>
          <Field label="Admin password">
            <input className="field font-mono" value={form.admin?.password || ''}
              onChange={(e) => set({ admin: { ...form.admin, password: e.target.value } })} />
          </Field>
          <p className="flex items-start gap-2 rounded-lg bg-rose-50 p-3 text-[11px] leading-relaxed text-rose-800">
            <AlertTriangle size={14} className="mt-0.5 shrink-0" />
            <span>
              <strong>This is not real security.</strong> On a static site the credentials live in the
              browser bundle, so anyone can read them. Fine for a demo or an internal tool behind a
              password-protected folder. See MIGRATE-TO-SERVER.md for proper server-side auth.
            </span>
          </p>
        </Section>

        <Section icon={AlertTriangle} title="Danger zone">
          <p className="text-sm leading-relaxed text-ink-500">
            Every change you make in the admin panel is stored in this browser. Resetting throws all of
            it away and restores the catalogue, orders and settings that shipped with the site.
          </p>
          <button type="button"
            onClick={async () => { await resetDemoData(); toast('Demo data restored'); setTimeout(() => window.location.reload(), 600); }}
            className="btn btn-sm border border-rose-300 text-rose-700 hover:bg-rose-50">
            Reset all data to defaults
          </button>
        </Section>
      </form>
    </AdminShell>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-soft lg:h-fit">
      <h2 className="flex items-center gap-2 font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-50 text-gold-600"><Icon size={16} /></span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return <div><span className="label">{label}</span>{children}</div>;
}
