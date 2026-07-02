'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState } from 'react';
import { getUserId, getUserEmail, getUserName } from '@/lib/auth';
import { fetchQuota, PLAN_META, Quota } from '@/lib/quota';
import { Loader2, Zap, Check, X } from 'lucide-react';

interface PlanInfo {
  key: string;
  name: string;
  price: number;
  currency: string;
  symbol: string;
}

const PLAN_FEATURES: Record<string, string[]> = {
  gratis:    ['5 búsquedas de contactos/mes', 'CRM completo', 'Tu Día con IA', '10 mensajes IA/semana', '5 generaciones de CV/semana', '1 prep de entrevista/semana'],
  pro:       ['20 búsquedas de contactos/mes', 'CRM completo', 'Tu Día con IA', '25 mensajes IA/semana', '10 generaciones de CV/semana', 'Prep de entrevista ilimitada'],
  acelerado: ['Búsquedas ilimitadas', 'CRM completo', 'Tu Día con IA', 'Mensajes IA ilimitados', 'CV ilimitados', 'Prep de entrevista ilimitada'],
  impulso:   ['Búsquedas ilimitadas', 'CRM completo', 'Tu Día con IA', 'Mensajes IA ilimitados', 'CV ilimitados', 'Prep de entrevista ilimitada', 'Llamada mensual con coach'],
};

const PLAN_ORDER = ['gratis', 'pro', 'acelerado', 'impulso'];

export default function PlanPage() {
  const userId = getUserId();
  const [quota, setQuota] = useState<Quota | null>(null);
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      fetchQuota(userId),
      fetch('/api/pricing?currency=USD').then(r => r.json()),
    ]).then(([q, p]) => {
      setQuota(q);
      setPlans(p.plans || []);
    }).finally(() => setLoading(false));
  }, [userId]);

  const handleUpgrade = async (planKey: string) => {
    if (!userId) return;
    setCheckingOut(planKey);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email: getUserEmail(),
          name: getUserName(),
          plan: planKey,
          currency: 'USD',
          successUrl: `${window.location.origin}/plan?plan_activated=true`,
          cancelUrl: `${window.location.origin}/plan`,
        }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingOut(null);
    }
  };

  const currentPlan = quota?.plan || 'gratis';
  const meta = PLAN_META[currentPlan];
  const wu = quota?.weeklyUsage || { msgs: 0, cv: 0, prep: 0 };
  const wl = quota?.weeklyLimits || { msgs: 10, cv: 5, prep: 1 };
  const isUnlimited = quota?.totalQuota >= 999999;

  const rows = [
    { label: 'Búsquedas de contactos', used: quota?.used || 0, limit: isUnlimited ? null : quota?.totalQuota, period: 'este mes' },
    { label: 'Mensajes IA', used: wu.msgs, limit: wl.msgs, period: 'esta semana' },
    { label: 'Generación de CV', used: wu.cv, limit: wl.cv, period: 'esta semana' },
    { label: 'Prep de entrevista', used: wu.prep, limit: wl.prep, period: 'esta semana' },
  ];

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-60">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pirai-500)]" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-screen">
        <div className="bg-white border-b border-[var(--color-brand-border)] px-8 pt-6 pb-5">
          <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">Mi Plan</h1>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* Current plan badge + usage */}
            <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-[var(--color-brand-muted)] uppercase tracking-wider mb-1">Tu plan actual</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${meta?.color}`}>
                      {meta?.emoji} {meta?.name || currentPlan}
                    </span>
                  </div>
                </div>
                {currentPlan !== 'impulso' && (
                  <button
                    onClick={() => {
                      const next = PLAN_ORDER[PLAN_ORDER.indexOf(currentPlan) + 1];
                      if (next) handleUpgrade(next);
                    }}
                    className="flex items-center gap-2 bg-[var(--color-pirai-500)] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] transition-colors"
                  >
                    <Zap className="w-4 h-4" /> Mejorar plan
                  </button>
                )}
              </div>

              {/* Usage rows */}
              <div className="space-y-4">
                {rows.map((r) => {
                  const unlimited = r.limit === null;
                  const pct = unlimited || !r.limit ? 0 : Math.min(100, Math.round((r.used / r.limit) * 100));
                  const almostFull = !unlimited && r.limit && (r.limit - r.used) <= 1;
                  return (
                    <div key={r.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[var(--color-brand-dark)]">{r.label}</span>
                        {unlimited ? (
                          <span className="text-xs font-bold text-[var(--color-pirai-500)]">Ilimitado</span>
                        ) : (
                          <span className="text-xs text-[var(--color-brand-muted)]">
                            <span className="font-semibold text-[var(--color-brand-dark)]">{r.used}</span>
                            {' / '}{r.limit} {r.period}
                          </span>
                        )}
                      </div>
                      {!unlimited && r.limit && (
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${almostFull ? 'bg-red-400' : 'bg-[var(--color-pirai-500)]'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      )}
                      {almostFull && (
                        <p className="text-[10px] text-red-500 mt-0.5">Casi sin usos restantes</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Plan comparison */}
            {currentPlan !== 'impulso' && (
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-4">Planes disponibles</h2>
                <div className="grid grid-cols-2 gap-4">
                  {PLAN_ORDER.filter(p => p !== 'gratis').map(planKey => {
                    const planInfo = plans.find(p => p.key === planKey);
                    const isCurrent = planKey === currentPlan;
                    const isHigher = PLAN_ORDER.indexOf(planKey) > PLAN_ORDER.indexOf(currentPlan);
                    const planMeta = PLAN_META[planKey];
                    return (
                      <div
                        key={planKey}
                        className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${
                          isCurrent ? 'border-[var(--color-pirai-500)]' : 'border-[var(--color-brand-border)]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-[var(--color-brand-dark)]">{planMeta?.emoji} {planMeta?.name}</p>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-[var(--color-pirai-100)] text-[var(--color-pirai-700)] px-2 py-0.5 rounded-full">Tu plan</span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-[var(--color-brand-dark)] mb-4">
                          {planInfo ? `${planInfo.symbol}${planInfo.price}` : '—'}
                          <span className="text-sm font-normal text-[var(--color-brand-muted)]">/mes</span>
                        </p>
                        <ul className="space-y-2 mb-5">
                          {PLAN_FEATURES[planKey]?.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-[var(--color-brand-dark)]">
                              <Check className="w-3.5 h-3.5 text-[var(--color-pirai-500)] shrink-0 mt-0.5" />
                              {f}
                            </li>
                          ))}
                        </ul>
                        {!isCurrent && isHigher && (
                          <button
                            onClick={() => handleUpgrade(planKey)}
                            disabled={!!checkingOut}
                            className="w-full bg-[var(--color-pirai-500)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                          >
                            {checkingOut === planKey ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            {checkingOut === planKey ? 'Redirigiendo...' : 'Elegir plan'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentPlan === 'impulso' && (
              <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] rounded-2xl p-6 text-center">
                <p className="text-2xl mb-2">🔥</p>
                <p className="font-bold text-[var(--color-pirai-800)]">Estás en el plan máximo</p>
                <p className="text-sm text-[var(--color-pirai-600)] mt-1">Tenés acceso ilimitado a todas las funcionalidades de Piraí.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
