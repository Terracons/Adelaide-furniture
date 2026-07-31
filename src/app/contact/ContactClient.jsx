'use client';

import { useState } from 'react';
import { Clock, Mail, MapPin, Phone, Send, MessageSquare, Truck, Palette } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { sendMessage, getSettings } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

const TOPICS = [
  { id: 'general', label: 'General enquiry', icon: MessageSquare },
  { id: 'order', label: 'About an order', icon: Truck },
  { id: 'design', label: 'Design consultation', icon: Palette }
];

export default function ContactClient() {
  const { data: settings } = useData(() => getSettings(), [], null);
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'general', body: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.body.trim()) {
      return toast('Please fill in your name, a valid email and a message', 'error');
    }
    setBusy(true);
    await sendMessage(form);
    setBusy(false);
    setSent(true);
    setForm({ name: '', email: '', phone: '', subject: 'general', body: '' });
    toast('Message sent - we usually reply within one business day');
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Contact' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">Come and sit on it</h1>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-500">
        Most of the catalogue is on the showroom floor, and we can bring out timber and fabric
        samples for anything that is not. No appointment needed.
      </p>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="space-y-5 rounded-2xl bg-white p-6 shadow-soft">
          <div>
            <h2 className="text-xl font-semibold">Send us a message</h2>
            <p className="mt-0.5 text-xs text-ink-400">We reply within one business day.</p>
          </div>

          <div>
            <span className="label">What is it about?</span>
            <div className="grid gap-2 sm:grid-cols-3">
              {TOPICS.map((t) => (
                <button key={t.id} type="button" onClick={() => setForm({ ...form, subject: t.id })}
                  className={`flex items-center gap-2 rounded-xl border p-3 text-left text-xs font-medium transition ${
                    form.subject === t.id ? 'border-gold-500 bg-gold-50 text-gold-700' : 'border-ink-200 text-ink-500 hover:border-gold-300'
                  }`}>
                  <t.icon size={15} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-name">Your name</label>
              <input id="c-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="c-email">Email</label>
              <input id="c-email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
            </div>
          </div>

          <div>
            <label className="label" htmlFor="c-phone">Phone (optional)</label>
            <input id="c-phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
          </div>

          <div>
            <label className="label" htmlFor="c-body">Message</label>
            <textarea id="c-body" rows={6} className="field resize-none" value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Tell us what you're after, the room it's going in, and any timings." />
          </div>

          <button type="submit" disabled={busy} className="btn-primary">
            <Send size={15} /> {busy ? 'Sending...' : 'Send message'}
          </button>

          {sent && (
            <p className="rounded-xl bg-emerald-50 p-3.5 text-sm text-emerald-800">
              Thanks - your message is with the team. You will hear back within one business day.
            </p>
          )}
        </form>

        <aside className="space-y-4">
          <div className="space-y-4 rounded-2xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-semibold">Showroom</h2>
            {[
              [MapPin, 'Address', settings?.address],
              [Phone, 'Phone', settings?.phone],
              [Mail, 'Email', settings?.email],
              [Clock, 'Opening hours', settings?.hours]
            ].map(([Icon, label, value]) => (
              <div key={label} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-50 text-gold-600"><Icon size={16} /></span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</p>
                  <p className="text-sm text-ink-700">{value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl shadow-soft">
            <iframe
              title="Showroom location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=138.596%2C-34.930%2C138.615%2C-34.918&layer=mapnik"
              className="h-64 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="rounded-2xl bg-ink p-6 text-cream">
            <h3 className="text-base font-semibold">Trade & design</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-cream/60">
              Architects, stylists and hospitality operators get trade pricing, sample boxes and
              a dedicated contact. Mention it in your message and we will set you up.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
