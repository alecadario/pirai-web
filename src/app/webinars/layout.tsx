import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Webinars gratuitos de búsqueda de empleo y LinkedIn',
  description: 'Eventos online gratuitos sobre búsqueda laboral, LinkedIn, entrevistas y negociación. En vivo, con preguntas reales y sin filtros.',
  alternates: { canonical: 'https://pirai.es/webinars' },
  openGraph: {
    type: 'website',
    url: 'https://pirai.es/webinars',
    title: 'Webinars gratuitos de búsqueda de empleo | Piraí',
    description: 'Eventos online gratuitos sobre búsqueda laboral, LinkedIn, entrevistas y negociación. En vivo, con preguntas reales y sin filtros.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Webinars de búsqueda de empleo — Piraí' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Webinars gratuitos de búsqueda de empleo | Piraí',
    description: 'Eventos online gratuitos sobre búsqueda laboral, LinkedIn, entrevistas y negociación.',
    images: ['/og-image.png'],
  },
};

export default function WebinarsLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Piraí',
    url: 'https://pirai.es',
    logo: 'https://pirai.es/pirai-icon.png',
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      {children}
    </>
  );
}
