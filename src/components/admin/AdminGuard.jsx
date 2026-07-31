'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/** Redirects to the admin login when there is no admin session. */
export default function AdminGuard({ children }) {
  const { admin, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const isLoginPage = pathname.startsWith('/admin/login');

  useEffect(() => {
    if (ready && !admin && !isLoginPage) router.replace('/admin/login/');
  }, [ready, admin, isLoginPage, router]);

  if (isLoginPage) return children;

  if (!ready) {
    return <div className="grid min-h-screen place-items-center text-sm text-ink-400">Checking your session...</div>;
  }
  if (!admin) {
    return <div className="grid min-h-screen place-items-center text-sm text-ink-400">Redirecting to sign in...</div>;
  }

  return children;
}
