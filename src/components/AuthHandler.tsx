'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAuth, isAuthenticated } from '@/lib/auth';
import { Suspense } from 'react';

function AuthHandlerInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const userId = params.get('pirai_user_id');
    const email = params.get('pirai_email') ?? '';
    const name = params.get('pirai_name') ?? '';

    if (userId) {
      setAuth(userId, email, name);
      // Clean URL and redirect
      router.replace('/dashboard');
    }
  }, [params, router]);

  return null;
}

export default function AuthHandler() {
  return (
    <Suspense fallback={null}>
      <AuthHandlerInner />
    </Suspense>
  );
}
