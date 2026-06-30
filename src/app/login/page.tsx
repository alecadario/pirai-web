'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        {/* Logo */}
        <img
          src={`${API_BASE}/icon-192x192.png`}
          alt="Piraí"
          style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 20px', display: 'block' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />

        {/* Wordmark */}
        <p style={{ fontSize: '28px', fontWeight: '800', color: '#2D3748', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
          Piraí
        </p>

        {/* Tagline */}
        <p style={{ fontSize: '17px', fontWeight: '600', color: '#2D3748', margin: '0 0 12px', lineHeight: '1.4' }}>
          Tu sistema para generar oportunidades profesionales.
        </p>
        <p style={{ fontSize: '14px', color: '#A0AEC0', margin: '0 0 40px', lineHeight: '1.7' }}>
          Organizá tu búsqueda laboral, gestioná contactos clave y hacé seguimiento de cada oportunidad — todo desde un solo lugar.
        </p>

        {/* Google button */}
        <a
          href={`${API_BASE}/api/google/connect?platform=web_app`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            width: '100%', padding: '16px 20px', borderRadius: '16px',
            background: '#00A86B', color: '#fff',
            fontSize: '16px', fontWeight: '700',
            textDecoration: 'none', boxSizing: 'border-box',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#009660'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#00A86B'; }}
        >
          <GoogleIconWhite />
          Iniciar sesión con Google
        </a>

        {/* Footer */}
        <div style={{ marginTop: '40px', color: '#CBD5E0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ margin: 0 }}>
            ¿Necesitás ayuda? Escribinos a{' '}
            <a href="mailto:pirai@alecadario.com" style={{ color: '#00A86B', textDecoration: 'underline' }}>
              pirai@alecadario.com
            </a>
          </p>
          <a href="/privacy" style={{ color: '#CBD5E0', textDecoration: 'underline' }}>Política de privacidad</a>
        </div>
      </div>
    </div>
  );
}

function GoogleIconWhite() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
