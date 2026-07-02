export interface Quota {
  plan: 'gratis' | 'pro' | 'acelerado' | 'impulso';
  totalQuota: number;
  used: number;
  remaining: number;
  weeklyUsage: { msgs: number; cv: number; prep: number };
  weeklyLimits: { msgs: number | null; cv: number | null; prep: number | null };
}

export const PLAN_META: Record<string, { name: string; color: string; emoji: string }> = {
  gratis:    { name: 'Gratis',    color: 'bg-gray-100 text-gray-600',       emoji: '🌱' },
  pro:       { name: 'Pro',       color: 'bg-blue-100 text-blue-700',       emoji: '⚡' },
  acelerado: { name: 'Acelerado', color: 'bg-purple-100 text-purple-700',   emoji: '🚀' },
  impulso:   { name: 'Impulso',   color: 'bg-[var(--color-pirai-100)] text-[var(--color-pirai-700)]', emoji: '🔥' },
};

export async function fetchQuota(userId: string): Promise<Quota | null> {
  try {
    const res = await fetch(`/api/user/search-quota?userId=${userId}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
