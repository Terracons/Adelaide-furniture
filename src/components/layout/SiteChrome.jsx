'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';

/** The admin panel gets its own shell, so hide the storefront chrome there. */
export default function SiteChrome({ children }) {
  const pathname = usePathname() || '/';
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <ScrollToTop />
    </>
  );
}
