'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { read, write } from '@/lib/store';
import { useToast } from './ToastContext';

const CartContext = createContext(null);
const KEY = 'cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    setItems(read(KEY, []));
    setCoupon(read('coupon', null));
    setReady(true);
  }, []);

  const save = useCallback((next) => {
    setItems(next);
    write(KEY, next);
  }, []);

  const add = useCallback(
    (product, quantity = 1, variant = null) => {
      const key = `${product.id}::${variant || ''}`;
      const current = read(KEY, []);
      const existing = current.find((i) => i.key === key);
      let next;
      if (existing) {
        next = current.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, 99) } : i
        );
      } else {
        next = [
          ...current,
          {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            price: product.price,
            comparePrice: product.comparePrice || null,
            stock: product.stock,
            variant: variant || (product.colors && product.colors[0]) || null,
            quantity: Math.min(quantity, 99)
          }
        ];
      }
      save(next);
      toast(`${product.name} added to your cart`);
      setDrawerOpen(true);
    },
    [save, toast]
  );

  const updateQuantity = useCallback(
    (key, quantity) => {
      const q = Math.max(1, Math.min(Number(quantity) || 1, 99));
      save(read(KEY, []).map((i) => (i.key === key ? { ...i, quantity: q } : i)));
    },
    [save]
  );

  const removeItem = useCallback(
    (key) => {
      save(read(KEY, []).filter((i) => i.key !== key));
      toast('Removed from cart', 'info');
    },
    [save, toast]
  );

  const clear = useCallback(() => {
    save([]);
    setCoupon(null);
    write('coupon', null);
  }, [save]);

  const applyCoupon = useCallback((result) => {
    const value = result?.valid ? { code: result.coupon.code, discount: result.discount, type: result.coupon.type, value: result.coupon.value } : null;
    setCoupon(value);
    write('coupon', value);
  }, []);

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const discount = coupon
    ? coupon.type === 'percent'
      ? Math.round(subtotal * (coupon.value / 100) * 100) / 100
      : Math.min(coupon.value, subtotal)
    : 0;
  const shipping = items.length === 0 ? 0 : subtotal - discount >= 2000 ? 0 : 149;
  const total = Math.max(0, subtotal - discount + shipping);

  const value = useMemo(
    () => ({
      items, ready, count, subtotal, discount, shipping, total,
      coupon, applyCoupon,
      add, updateQuantity, removeItem, clear,
      drawerOpen, setDrawerOpen
    }),
    [items, ready, count, subtotal, discount, shipping, total, coupon, applyCoupon, add, updateQuantity, removeItem, clear, drawerOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
