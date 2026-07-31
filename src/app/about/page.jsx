import Link from 'next/link';
import { ArrowRight, Hammer, Leaf, MapPin, Users } from 'lucide-react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import SectionHeading from '@/components/ui/SectionHeading';
import Img from '@/components/ui/Img';
import { getTestimonials } from '@/lib/data';
import Testimonials from '@/components/home/Testimonials';

export const metadata = {
  title: 'Our story',
  description: 'Adelaide Furniture has been making solid timber furniture on Rundle Street since 2011. Here is how, and why.'
};

const TIMELINE = [
  { year: '2011', title: 'A shed on Rundle Street', copy: 'Two people, one bandsaw, and a restaurant that could not find chairs it liked. We made them forty.' },
  { year: '2015', title: 'The first showroom', copy: 'We took the lease next door and put the workshop behind glass so customers could watch the work happen.' },
  { year: '2019', title: 'Upholstery in-house', copy: 'Frames were ours but the covering was not. We hired three upholsterers and stopped outsourcing.' },
  { year: '2022', title: 'FSC-certified supply', copy: 'Every board now traces back to a mill we have visited, with replanting we can verify.' },
  { year: '2026', title: 'Twenty-four people', copy: 'Same bench, same standard, considerably more sawdust. Around 12,000 pieces delivered so far.' }
];

const VALUES = [
  { icon: Hammer, title: 'Built once, properly', copy: 'Mortise-and-tenon joinery, kiln-dried hardwood, and a ten-year warranty we expect never to use.' },
  { icon: Leaf, title: 'Timber we can trace', copy: 'FSC-certified boards from mills we have walked through, finished with low-VOC hardwax oils.' },
  { icon: Users, title: 'Paid, trained, kept', copy: 'Twenty-four people on award-plus wages. Four apprentices in the workshop at any time.' },
  { icon: MapPin, title: 'Made here', copy: 'Everything is cut, assembled and finished in Adelaide. Nothing is drop-shipped.' }
];

export default async function AboutPage() {
  const testimonials = await getTestimonials();

  return (
    <>
      <section className="border-b border-ink-100 bg-white">
        <div className="container grid items-center gap-10 py-10 md:grid-cols-2 md:py-16">
          <div>
            <Breadcrumbs items={[{ label: 'About' }]} />
            <span className="eyebrow mt-4"><span className="h-px w-6 bg-gold-500" /> Since 2011</span>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-[52px]">
              We make furniture the slow way, on purpose
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-500">
              Adelaide Furniture started because a restaurant on Rundle Street could not find dining
              chairs that survived a year of service. We made them forty. Fifteen years later the
              first set is still in use, and the standard has not moved.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop/" className="btn-primary">See the collection <ArrowRight size={15} /></Link>
              <Link href="/contact/" className="btn-outline">Visit the showroom</Link>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-cream-dark shadow-lift">
            <Img src="/images/hero/living.svg" alt="The Adelaide Furniture workshop" loading="eager" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl bg-white p-6 shadow-soft">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-50 text-gold-600"><v.icon size={20} /></span>
              <h3 className="mt-4 text-base font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{v.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <SectionHeading align="left" eyebrow="How we got here" title="Fifteen years, one bench at a time" />
          <ol className="mt-10 space-y-0">
            {TIMELINE.map((t, i) => (
              <li key={t.year} className="grid gap-4 border-l-2 border-gold-200 pb-8 pl-6 last:pb-0 sm:grid-cols-[100px_1fr] sm:gap-8">
                <span className="relative font-display text-2xl font-semibold text-gold-600">
                  <span className="absolute -left-[31px] top-2 h-3 w-3 rounded-full border-2 border-gold-500 bg-cream" />
                  {t.year}
                </span>
                <div>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-ink-500">{t.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 rounded-3xl bg-ink p-8 text-cream sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
          {[['15', 'Years making furniture'], ['24', 'People on the team'], ['12k', 'Pieces delivered'], ['4.8', 'Average review score']].map(([n, l]) => (
            <div key={l}>
              <p className="font-display text-4xl font-semibold text-gold-400 lg:text-5xl">{n}</p>
              <p className="mt-1.5 text-xs uppercase tracking-wider text-cream/50">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials testimonials={testimonials} />
    </>
  );
}
