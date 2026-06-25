'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { Suspense } from 'react';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle OAuth callback with userId/email/name params
    const userId = params.get('userId');
    const email = params.get('email');
    const name = params.get('name');

    if (userId) {
      localStorage.setItem('pirai_user_id', userId);
      if (email) localStorage.setItem('pirai_email', email);
      if (name) localStorage.setItem('pirai_name', name);
      router.replace('/dashboard');
      return;
    }

    if (isAuthenticated()) {
      router.replace('/dashboard');
    }
  }, [params, router]);

  function handleGoogleLogin() {
    setLoading(true);
    window.location.href = 'https://piraiapp.com/api/google/connect?platform=web';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-brand-surface)]">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[var(--color-brand-border)] p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[var(--color-pirai-100)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🦜</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-pirai-600)]">Piraí</h1>
          <p className="text-sm text-[var(--color-brand-muted)] mt-1">Tu copiloto de carrera</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-[var(--color-brand-border)] text-[var(--color-brand-dark)] py-3 px-4 rounded-xl text-sm font-semibold hover:bg-[var(--color-brand-surface)] hover:border-[var(--color-pirai-300)] transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="animate-spin text-lg">⏳</span>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading ? 'Redirigiendo...' : 'Continuar con Google'}
        </button>

        <p className="text-center text-xs text-[var(--color-brand-muted)] mt-6">
          Al ingresar aceptás los términos de uso de Piraí
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <LoginInner />
    </Suspense>
  );
}
