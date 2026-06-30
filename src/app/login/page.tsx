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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif !important; }
        .login-root { font-family: 'Plus Jakarta Sans', sans-serif; }
        .google-btn:hover { background: #009660 !important; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,168,107,0.35) !important; }
        .google-btn { transition: all 0.2s ease; }
        .feature-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #F2F4F7; }
        .feature-item:last-child { border-bottom: none; }
      `}</style>
      <div className="login-root" style={{ minHeight: '100vh', display: 'flex', background: '#F2F4F7', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

        {/* Left — branding */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 72px', background: '#fff', borderRight: '1px solid #E2E8F0' }}>
          <div style={{ maxWidth: '480px' }}>
            {/* Logo + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '64px' }}>
              <img
                src={`${API_BASE}/icon-192x192.png`}
                alt="Piraí"
                style={{ width: '48px', height: '48px', borderRadius: '14px' }}
                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#2D3748', letterSpacing: '-0.5px' }}>Piraí</span>
            </div>

            {/* Headline */}
            <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#2D3748', lineHeight: '1.15', letterSpacing: '-1px', marginBottom: '20px' }}>
              Tu sistema para{' '}
              <span style={{ color: '#00A86B' }}>generar oportunidades</span>{' '}
              profesionales.
            </h1>
            <p style={{ fontSize: '16px', color: '#718096', lineHeight: '1.75', marginBottom: '48px' }}>
              Organizá tu búsqueda laboral, gestioná contactos clave y hacé seguimiento de cada oportunidad — todo desde un solo lugar.
            </p>

            {/* Features */}
            <div>
              {[
                { icon: '🎯', title: 'CRM laboral', desc: 'Seguí cada empresa y contacto' },
                { icon: '✨', title: 'IA integrada', desc: 'CV y cartas generadas al instante' },
                { icon: '🔍', title: 'Empleos remotos', desc: 'Búsqueda en tiempo real' },
              ].map(f => (
                <div key={f.title} className="feature-item">
                  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E6F7F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#2D3748' }}>{f.title}</div>
                    <div style={{ fontSize: '13px', color: '#A0AEC0' }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — login */}
        <div style={{ width: '460px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 56px', background: '#F2F4F7' }}>
          <div style={{ width: '100%' }}>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#2D3748', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Iniciar sesión
            </h2>
            <p style={{ fontSize: '14px', color: '#2D3748', marginBottom: '36px' }}>
              Usá tu cuenta de Google para entrar
            </p>

            <a
              href={`${API_BASE}/api/google/connect?platform=web_app`}
              className="google-btn"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                width: '100%', padding: '16px 24px', borderRadius: '14px',
                background: '#00A86B', color: '#fff',
                fontSize: '15px', fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(0,168,107,0.25)',
              }}
            >
              <GoogleIconWhite />
              Continuar con Google
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '28px 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
              <span style={{ fontSize: '12px', color: '#718096', fontWeight: '500' }}>acceso seguro con OAuth</span>
              <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            </div>

            <p style={{ fontSize: '12px', color: '#718096', textAlign: 'center', lineHeight: '1.7' }}>
              Al ingresar aceptás nuestros términos y política de privacidad.{' '}
              Tu información está segura y nunca la compartimos con terceros.
            </p>

            <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '13px', color: '#718096' }}>
              ¿Necesitás ayuda?{' '}
              <a href="mailto:pirai@alecadario.com" style={{ color: '#00A86B', textDecoration: 'none', fontWeight: '600' }}>
                pirai@alecadario.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
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
