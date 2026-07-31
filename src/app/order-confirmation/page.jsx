import { Suspense } from 'react';
import ConfirmationClient from './ConfirmationClient';

export const metadata = { title: 'Order confirmed' };

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="container py-24 text-center text-sm text-ink-400">Loading your order...</div>}>
      <ConfirmationClient />
    </Suspense>
  );
}
