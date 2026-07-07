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
  title: 'Piraí — Tu copiloto de carrera',
  description: 'Gestioná tu búsqueda de trabajo, CRM y marca personal desde un solo lugar.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-brand-surface)]">
        <AuthHandler />
        {children}
      </body>
    </html>
  );
}
