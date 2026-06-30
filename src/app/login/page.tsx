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
    <div style={{ minHeight: '100vh', display: 'flex', background: '#0F1923' }}>
      {/* Left panel — branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px',
        background: 'linear-gradient(135deg, #0F1923 0%, #1a2d1f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(0,168,107,0.08)' }} />
        <div style={{ position: 'absolute', bottom: '60px', right: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(27,205,209,0.07)' }} />
        <div style={{ position: 'absolute', top: '40%', left: '60%', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(0,168,107,0.05)' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px' }}>
          <img
            src={`${API_BASE}/icon-192x192.png`}
            alt="Piraí"
            style={{ width: '40px', height: '40px', borderRadius: '10px' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.5px' }}>Piraí</span>
        </div>

        {/* Headline */}
        <div style={{ maxWidth: '420px' }}>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#fff', lineHeight: '1.15', margin: '0 0 20px', letterSpacing: '-1px' }}>
            Tu copiloto de{' '}
            <span style={{ color: '#00A86B' }}>carrera profesional</span>
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.55)', lineHeight: '1.7', margin: '0 0 48px' }}>
            Gestioná tu búsqueda de trabajo, construí tu red de contactos y hacé crecer tu marca personal — todo desde un solo lugar.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🎯', label: 'CRM para tu búsqueda laboral' },
              { icon: '✨', label: 'CV y cartas generadas con IA' },
              { icon: '🔍', label: 'Empleos remotos en tiempo real' },
            ].map(({ icon, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,168,107,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
                  {icon}
                </div>
                <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontWeight: '500' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — login */}
      <div style={{
        width: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F8FA',
        padding: '48px',
      }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#1A202C', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Iniciar sesión
          </h2>
          <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 36px' }}>
            Usá tu cuenta de Google para entrar
          </p>

          <a
            href={`${API_BASE}/api/google/connect?platform=web_app`}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              width: '100%', padding: '14px 20px', borderRadius: '14px',
              border: '1.5px solid #E2E8F0', background: '#fff',
              fontSize: '15px', fontWeight: '600', color: '#1A202C',
              cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#00A86B';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,168,107,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
            }}
          >
            <GoogleIcon />
            Continuar con Google
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#A0AEC0' }}>acceso seguro</span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          <p style={{ fontSize: '12px', color: '#A0AEC0', textAlign: 'center', lineHeight: '1.6', margin: 0 }}>
            Al ingresar aceptás nuestros términos y política de privacidad.
            Tu información está segura y nunca la compartimos con terceros.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
