import AdminGuard from '@/components/admin/AdminGuard';

export const metadata = {
  title: 'Admin panel',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
