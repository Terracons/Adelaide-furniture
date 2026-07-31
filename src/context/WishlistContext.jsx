'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { read, write } from '@/lib/store';
import { useToast } from './ToastContext';

const WishlistContext = createContext(null);
const KEY = 'wishlist';

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState([]);
  const [ready, setReady] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIds(read(KEY, []));
    setReady(true);
  }, []);

  const toggle = useCallback(
    (product) => {
      const current = read(KEY, []);
      const exists = current.includes(product.id);
      const next = exists ? current.filter((i) => i !== product.id) : [...current, product.id];
      setIds(next);
      write(KEY, next);
      toast(exists ? `${product.name} removed from wishlist` : `${product.name} saved to wishlist`, exists ? 'info' : 'success');
    },
    [toast]
  );

  const has = useCallback((id) => ids.includes(id), [ids]);

  const clear = useCallback(() => {
    setIds([]);
    write(KEY, []);
  }, []);

  const value = useMemo(() => ({ ids, ready, toggle, has, clear, count: ids.length }), [ids, ready, toggle, has, clear]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
