import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import AuthHandler from '@/components/AuthHandler';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: {
    default: 'Piraí | Organizá tu búsqueda de empleo y conseguí trabajo',
    template: '%s | Piraí',
  },
  description: 'Piraí es tu copiloto para conseguir trabajo. CRM laboral, acciones diarias con IA, preparación de entrevistas y marca personal — todo en un solo lugar.',
  metadataBase: new URL('https://pirai.es'),
  alternates: { canonical: 'https://pirai.es' },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://pirai.es',
    siteName: 'Piraí',
    title: 'Piraí | Organizá tu búsqueda de empleo y conseguí trabajo',
    description: 'Piraí es tu copiloto para conseguir trabajo. CRM laboral, acciones diarias con IA, preparación de entrevistas y marca personal — todo en un solo lugar.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Piraí — Tu copiloto para conseguir trabajo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Piraí | Organizá tu búsqueda de empleo y conseguí trabajo',
    description: 'Piraí es tu copiloto para conseguir trabajo. CRM laboral, acciones diarias con IA y marca personal.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png' }],
    apple: '/pirai-icon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://pirai.es/#organization',
      name: 'Piraí',
      url: 'https://pirai.es',
      logo: 'https://pirai.es/pirai-icon.png',
      contactPoint: { '@type': 'ContactPoint', email: 'pirai@alecadario.com', contactType: 'customer support' },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://pirai.es/#website',
      url: 'https://pirai.es',
      name: 'Piraí',
      publisher: { '@id': 'https://pirai.es/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Piraí',
      operatingSystem: 'iOS, Web',
      applicationCategory: 'BusinessApplication',
      offers: [
        { '@type': 'Offer', name: 'Gratis', price: '0', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Pro', price: '3.99', priceCurrency: 'USD' },
        { '@type': 'Offer', name: 'Acelerado', price: '9.99', priceCurrency: 'USD' },
      ],
      url: 'https://pirai.es',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-brand-surface)]">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <AuthHandler />
        {children}
      </body>
    </html>
  );
}
