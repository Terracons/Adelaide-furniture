import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import FaqAccordion from './FaqAccordion';
import { getFaqs } from '@/lib/data';

export const metadata = {
  title: 'FAQs',
  description: 'Delivery timeframes, returns, warranty and care - the questions we get asked most.'
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a }
    }))
  };

  return (
    <div className="container max-w-3xl py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[{ label: 'FAQs' }]} />
      <h1 className="mt-3 text-3xl font-semibold md:text-[42px]">Frequently asked</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
        If your question is not here, the team answers the phone between 9 and 6.
      </p>

      <div className="mt-8">
        <FaqAccordion faqs={faqs} />
      </div>

      <div className="mt-10 rounded-2xl bg-ink p-7 text-center text-cream">
        <h2 className="text-xl font-semibold">Still need a hand?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-cream/60">
          Call the showroom, send a message, or come in and sit on the thing you are thinking about.
        </p>
        <Link href="/contact/" className="btn-primary mt-5">Contact us</Link>
      </div>
    </div>
  );
}
