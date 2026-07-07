'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Sidebar from './Sidebar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasAuthParams = new URLSearchParams(window.location.search).has('pirai_user_id');

    if (hasAuthParams) {
      // AuthHandler is processing the params — wait for it to set localStorage then re-check
      const timer = setTimeout(() => {
        if (isAuthenticated()) setReady(true);
        else router.replace('/login');
      }, 400);
      return () => clearTimeout(timer);
    }

    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-brand-surface)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
