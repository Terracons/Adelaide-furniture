import './globals.css';
import Providers from '@/context/Providers';
import SiteChrome from '@/components/layout/SiteChrome';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://adelaidefurniture.com.au';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Adelaide Furniture | Handcrafted timber furniture, made to keep',
    template: '%s | Adelaide Furniture'
  },
  description:
    'Handcrafted furniture from our Adelaide workshop. Solid timber frames, natural fabrics, two-person delivery Australia-wide and a ten-year warranty on every joint.',
  keywords: ['furniture', 'Adelaide', 'sofa', 'dining table', 'handmade furniture', 'Australian made'],
  openGraph: {
    type: 'website',
    siteName: 'Adelaide Furniture',
    title: 'Adelaide Furniture | Handcrafted timber furniture',
    description: 'Solid timber frames, natural fabrics, ten-year warranty. Made in Adelaide.',
    images: ['/images/hero/living.svg']
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.svg' }
};

export const viewport = {
  themeColor: '#16130f',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-AU">
      <body>
        <Providers>
          <SiteChrome>{children}</SiteChrome>
        </Providers>
      </body>
    </html>
  );
}
