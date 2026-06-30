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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F2F4F7' }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 16px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', background: '#00A86B', marginBottom: '16px' }}>
            <img
              src={`${API_BASE}/icon-192x192.png`}
              alt="Piraí"
              style={{ width: '44px', height: '44px', borderRadius: '10px' }}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#2D3748', margin: '0 0 4px' }}>Piraí</h1>
          <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>Tu copiloto de carrera</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', boxShadow: '0 1px 8px rgba(45,55,72,0.08)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#2D3748', textAlign: 'center', margin: '0 0 6px' }}>Bienvenido/a</h2>
          <p style={{ fontSize: '14px', color: '#718096', textAlign: 'center', margin: '0 0 24px' }}>
            Ingresá con tu cuenta de Google para continuar
          </p>

          <a
            href={`${API_BASE}/api/google/connect?platform=web_app`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              width: '100%', padding: '12px 16px', borderRadius: '12px',
              border: '2px solid #E2E8F0', background: '#fff',
              fontSize: '14px', fontWeight: '600', color: '#2D3748',
              cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#00A86B')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#E2E8F0')}
          >
            <GoogleIcon />
            Continuar con Google
          </a>

          <p style={{ fontSize: '12px', color: '#A0AEC0', textAlign: 'center', marginTop: '20px', lineHeight: '1.5' }}>
            Al ingresar aceptás nuestros términos y política de privacidad.
            Tu información está segura y nunca la compartimos.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
