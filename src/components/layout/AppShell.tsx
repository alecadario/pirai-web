'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId } from '@/lib/auth';
import Sidebar from './Sidebar';
import OnboardingFlow from '@/components/OnboardingFlow';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  useEffect(() => {
    const hasAuthParams = new URLSearchParams(window.location.search).has('pirai_user_id');

    if (hasAuthParams) {
      const timer = setTimeout(() => {
        if (isAuthenticated()) checkOnboarding();
        else router.replace('/login');
      }, 400);
      return () => clearTimeout(timer);
    }

    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      checkOnboarding();
    }
  }, [router]);

  async function checkOnboarding() {
    const userId = getUserId();
    if (!userId) { setReady(true); setOnboardingDone(true); return; }

    // If already dismissed in this browser, skip the check
    if (localStorage.getItem(`onboarding_done_${userId}`)) {
      setReady(true); setOnboardingDone(true); return;
    }

    try {
      const res = await fetch(`/api/user-record?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      const record = data?.record;
      const fields = record?.fields ?? {};

      // Done if: explicitly completed, OR has any profile data (existing users), OR record exists (registered before onboarding feature)
      const completed =
        Boolean(fields.onboarding_completed) ||
        Boolean(fields.stage) ||
        Boolean(fields.passion) ||
        Boolean(fields.cv_text) ||
        Boolean(fields.titular) ||
        Boolean(record?.createdTime); // any existing record = already onboarded

      if (completed) localStorage.setItem(`onboarding_done_${userId}`, '1');
      setOnboardingDone(completed);
    } catch {
      setOnboardingDone(true); // on error, skip onboarding
    }
    setReady(true);
  }

  if (!ready) return null;

  if (onboardingDone === false) {
    return <OnboardingFlow onComplete={() => setOnboardingDone(true)} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-brand-surface)]">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
