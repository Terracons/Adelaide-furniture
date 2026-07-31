'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Check, ChevronLeft, CreditCard, Landmark, Lock, ShieldCheck, ShoppingBag, Wallet } from 'lucide-react';
import Img from '@/components/ui/Img';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyState from '@/components/ui/EmptyState';
import { money } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { createOrder } from '@/lib/data';

const STEPS = ['Contact', 'Delivery', 'Payment'];

const PAYMENTS = [
  { id: 'Card', label: 'Credit / debit card', icon: CreditCard, hint: 'Visa, Mastercard, Amex' },
  { id: 'Bank transfer', label: 'Bank transfer', icon: Landmark, hint: 'We email you the details' },
  { id: 'PayPal', label: 'PayPal', icon: Wallet, hint: 'Redirects to PayPal' },
  { id: 'Afterpay', label: 'Afterpay', icon: Wallet, hint: '4 payments, interest free' }
];

const AU_STATES = ['SA', 'VIC', 'NSW', 'QLD', 'WA', 'TAS', 'NT', 'ACT'];

export default function CheckoutClient() {
  const router = useRouter();
  const { items, ready, subtotal, discount, shipping, total, coupon, clear } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    customerName: '', customerEmail: '', customerPhone: '',
    address: '', city: '', state: 'SA', postcode: '', country: 'Australia',
    notes: '', paymentMethod: 'Card',
    cardName: '', cardNumber: '', cardExpiry: '', cardCvc: ''
  });

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        customerName: f.customerName || user.name || '',
        customerEmail: f.customerEmail || user.email || '',
        customerPhone: f.customerPhone || user.phone || '',
        address: f.address || user.address || '',
        city: f.city || user.city || '',
        state: user.state || f.state,
        postcode: f.postcode || user.postcode || ''
      }));
    }
  }, [user]);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  function validate(target = step) {
    const e = {};
    if (target >= 0) {
      if (!form.customerName.trim()) e.customerName = 'Please enter your name';
      if (!/^\S+@\S+\.\S+$/.test(form.customerEmail)) e.customerEmail = 'Please enter a valid email';
      if (!form.customerPhone.trim()) e.customerPhone = 'We need a number for the delivery team';
    }
    if (target >= 1) {
      if (!form.address.trim()) e.address = 'Street address is required';
      if (!form.city.trim()) e.city = 'Suburb is required';
      if (!/^\d{4}$/.test(form.postcode)) e.postcode = 'Enter a 4-digit postcode';
    }
    if (target >= 2 && form.paymentMethod === 'Card') {
      if (form.cardNumber.replace(/\s/g, '').length < 15) e.cardNumber = 'Enter a valid card number';
      if (!/^\d{2}\/\d{2}$/.test(form.cardExpiry)) e.cardExpiry = 'Use MM/YY';
      if (form.cardCvc.length < 3) e.cardCvc = 'Enter the CVC';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(s + 1, 2));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function placeOrder(e) {
    e.preventDefault();
    if (!validate(2)) return;
    setBusy(true);

    const order = await createOrder({
      userId: user?.id || null,
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      address: form.address, city: form.city, state: form.state,
      postcode: form.postcode, country: form.country, notes: form.notes,
      items: items.map((i) => ({
        productId: i.productId, slug: i.slug, name: i.name, image: i.image,
        price: i.price, quantity: i.quantity, variant: i.variant
      })),
      subtotal, discount, shipping, tax: Math.round((total / 11) * 100) / 100, total,
      couponCode: coupon?.code || null,
      paymentMethod: form.paymentMethod
    });

    clear();
    toast('Order placed - check your email for confirmation');
    router.push(`/order-confirmation/?order=${order.orderNumber}`);
  }

  if (!ready) return <div className="container py-24 text-center text-sm text-ink-400">Loading checkout...</div>;

  if (items.length === 0) {
    return (
      <div className="container py-12">
        <EmptyState icon={ShoppingBag} title="There is nothing to check out"
          description="Add a piece or two to your cart and come back."
          actionLabel="Browse the shop" actionHref="/shop/" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: 'Cart', href: '/cart/' }, { label: 'Checkout' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[38px]">Checkout</h1>

      {/* steps */}
      <ol className="mt-7 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center gap-2">
            <button onClick={() => i < step && setStep(i)} className="flex items-center gap-2 text-left">
              <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition ${
                i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-gold-500 text-white' : 'bg-ink-100 text-ink-400'
              }`}>
                {i < step ? <Check size={14} strokeWidth={3} /> : i + 1}
              </span>
              <span className={`hidden text-xs font-semibold sm:block ${i <= step ? 'text-ink' : 'text-ink-300'}`}>{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className={`h-px flex-1 ${i < step ? 'bg-emerald-400' : 'bg-ink-100'}`} />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={placeOrder} className="space-y-5">
          {step === 0 && (
            <Card title="Contact details" subtitle="So we can confirm your order and delivery slot">
              <Field label="Full name" error={errors.customerName}>
                <input className="field" value={form.customerName} onChange={(e) => set({ customerName: e.target.value })} autoComplete="name" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.customerEmail}>
                  <input type="email" className="field" value={form.customerEmail} onChange={(e) => set({ customerEmail: e.target.value })} autoComplete="email" />
                </Field>
                <Field label="Phone" error={errors.customerPhone}>
                  <input className="field" value={form.customerPhone} onChange={(e) => set({ customerPhone: e.target.value })} autoComplete="tel" placeholder="04xx xxx xxx" />
                </Field>
              </div>
              {!user && (
                <p className="text-xs text-ink-400">
                  Have an account? <Link href="/account/login/" className="font-semibold text-gold-600 hover:underline">Sign in</Link> to prefill this.
                </p>
              )}
            </Card>
          )}

          {step === 1 && (
            <Card title="Delivery address" subtitle="Two-person delivery, into the room of your choice">
              <Field label="Street address" error={errors.address}>
                <input className="field" value={form.address} onChange={(e) => set({ address: e.target.value })} autoComplete="street-address" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Suburb" error={errors.city}>
                  <input className="field" value={form.city} onChange={(e) => set({ city: e.target.value })} />
                </Field>
                <Field label="State">
                  <select className="field" value={form.state} onChange={(e) => set({ state: e.target.value })}>
                    {AU_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Postcode" error={errors.postcode}>
                  <input className="field" value={form.postcode} onChange={(e) => set({ postcode: e.target.value })} inputMode="numeric" maxLength={4} />
                </Field>
              </div>
              <Field label="Delivery notes (optional)">
                <textarea rows={3} className="field resize-none" value={form.notes} onChange={(e) => set({ notes: e.target.value })}
                  placeholder="Stairs, lift access, parking, best time to call..." />
              </Field>
            </Card>
          )}

          {step === 2 && (
            <>
              <Card title="Payment" subtitle="This is a demo store - no real payment is taken">
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PAYMENTS.map((p) => (
                    <button key={p.id} type="button" onClick={() => set({ paymentMethod: p.id })}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition ${
                        form.paymentMethod === p.id ? 'border-gold-500 bg-gold-50' : 'border-ink-200 hover:border-gold-300'
                      }`}>
                      <p.icon size={19} className={form.paymentMethod === p.id ? 'text-gold-600' : 'text-ink-400'} />
                      <span>
                        <span className="block text-sm font-semibold">{p.label}</span>
                        <span className="block text-[11px] text-ink-400">{p.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>

                {form.paymentMethod === 'Card' && (
                  <div className="mt-4 space-y-4 rounded-xl bg-cream p-4">
                    <Field label="Name on card">
                      <input className="field" value={form.cardName} onChange={(e) => set({ cardName: e.target.value })} autoComplete="cc-name" />
                    </Field>
                    <Field label="Card number" error={errors.cardNumber}>
                      <input className="field font-mono" value={form.cardNumber} inputMode="numeric" placeholder="4242 4242 4242 4242"
                        onChange={(e) => set({ cardNumber: e.target.value.replace(/[^\d]/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19) })} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Expiry" error={errors.cardExpiry}>
                        <input className="field font-mono" placeholder="MM/YY" value={form.cardExpiry} maxLength={5}
                          onChange={(e) => {
                            let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                            if (v.length > 2) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                            set({ cardExpiry: v });
                          }} />
                      </Field>
                      <Field label="CVC" error={errors.cardCvc}>
                        <input className="field font-mono" placeholder="123" maxLength={4} value={form.cardCvc}
                          onChange={(e) => set({ cardCvc: e.target.value.replace(/[^\d]/g, '') })} />
                      </Field>
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-ink-400">
                      <Lock size={12} /> Demo only - card details are never sent anywhere.
                    </p>
                  </div>
                )}
              </Card>

              <Card title="Review your order">
                <ul className="divide-y divide-ink-100">
                  {items.map((i) => (
                    <li key={i.key} className="flex items-center gap-3 py-3">
                      <Img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg bg-cream-dark object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{i.name}</p>
                        <p className="text-xs text-ink-400">{i.variant} &middot; Qty {i.quantity}</p>
                      </div>
                      <span className="text-sm font-bold">{money(i.price * i.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl bg-cream p-3.5 text-xs leading-relaxed text-ink-500">
                  <strong className="text-ink">Delivering to:</strong> {form.customerName}, {form.address}, {form.city} {form.state} {form.postcode}
                </div>
              </Card>
            </>
          )}

          <div className="flex items-center justify-between gap-3">
            {step > 0 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-ghost btn-sm">
                <ChevronLeft size={15} /> Back
              </button>
            ) : (
              <Link href="/cart/" className="btn-ghost btn-sm"><ChevronLeft size={15} /> Back to cart</Link>
            )}

            {step < 2 ? (
              <button type="button" onClick={next} className="btn-primary">Continue</button>
            ) : (
              <button type="submit" disabled={busy} className="btn-primary">
                <Lock size={15} /> {busy ? 'Placing order...' : `Place order - ${money(total)}`}
              </button>
            )}
          </div>
        </form>

        <aside className="lg:sticky lg:top-28 lg:h-fit">
          <div className="space-y-4 rounded-2xl bg-white p-5 shadow-soft">
            <h2 className="text-lg font-semibold">Summary</h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3">
                  <div className="relative shrink-0">
                    <Img src={i.image} alt={i.name} className="h-14 w-14 rounded-lg bg-cream-dark object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-[10px] font-bold text-cream">{i.quantity}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold">{i.name}</p>
                    <p className="text-[11px] text-ink-400">{i.variant}</p>
                  </div>
                  <span className="text-xs font-bold">{money(i.price * i.quantity)}</span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 border-t border-ink-100 pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-500">Subtotal</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
              {discount > 0 && <div className="flex justify-between"><dt className="text-ink-500">Discount ({coupon?.code})</dt><dd className="font-semibold text-emerald-600">- {money(discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-ink-500">Delivery</dt><dd className="font-semibold">{shipping === 0 ? 'Free' : money(shipping)}</dd></div>
              <div className="flex items-baseline justify-between border-t border-ink-100 pt-3">
                <dt className="font-semibold">Total</dt><dd className="text-2xl font-bold">{money(total)}</dd>
              </div>
              <p className="text-[11px] text-ink-400">Includes GST of {money(total / 11)}</p>
            </dl>

            <p className="flex items-start gap-2 rounded-xl bg-cream p-3 text-[11px] leading-relaxed text-ink-500">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-gold-500" />
              30-day at-home trial and a 10-year frame warranty on every piece.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <section className="space-y-4 rounded-2xl bg-white p-5 shadow-soft sm:p-6">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}
