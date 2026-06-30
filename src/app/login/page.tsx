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

  function handleGoogleLogin() {
    window.location.href = `${API_BASE}/api/google/connect?platform=web_app`;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-surface)]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--color-pirai-500)] mb-4">
            <img src={`${API_BASE}/icon-192x192.png`} alt="Piraí" className="w-10 h-10 rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-brand-dark)]">Piraí</h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">Tu copiloto de carrera</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-brand-border)] p-8">
          <h2 className="text-lg font-semibold text-[var(--color-brand-dark)] mb-1 text-center">Bienvenido/a</h2>
          <p className="text-sm text-[var(--color-brand-muted)] text-center mb-6">
            Ingresá con tu cuenta de Google para continuar
          </p>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-brand-dark)] hover:border-[var(--color-pirai-500)] hover:text-[var(--color-pirai-600)] transition-all"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <p className="text-xs text-[var(--color-brand-muted)] text-center mt-6 leading-relaxed">
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
