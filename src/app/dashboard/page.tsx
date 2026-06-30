'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback } from 'react';
import { getUserId, getUserName } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Loader2, TrendingUp, Users, Activity, Briefcase,
  ChevronRight, Building2, Sparkles, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData { stage: string | null }
interface Stats {
  totalEmpresas: number;
  totalContactos: number;
  actividadesSemana: number;
  tasaRespuesta: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [insight, setInsight] = useState<{ tip: string; gradient: string } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();
  const name = getUserName()?.split(' ')[0] ?? '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      // Get user record first for diagnosis/stage (same as mobile app)
      let diagnosis = '';
      let stage = '';
      try {
        const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';
        const userRecord = await fetch(`${BASE}/api/user-record?userId=${encodeURIComponent(userId)}`).then(r => r.json());
        const fields = userRecord?.record?.fields ?? {};
        if (fields.onboarding_answers) {
          try {
            const answers = JSON.parse(fields.onboarding_answers);
            setProfile({ stage: answers.stage ?? null });
            diagnosis = answers.diagnosis ?? '';
            stage = answers.stage ?? '';
          } catch {}
        }
      } catch {}

      const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';
      const data = await fetch(
        `${BASE}/api/bootstrap?userId=${encodeURIComponent(userId)}&diagnosis=${encodeURIComponent(diagnosis)}&stage=${encodeURIComponent(stage)}`
      ).then(r => r.json());

      const empresas = data.companies ?? [];
      const contactos = data.contacts ?? [];
      const actividades = data.activities ?? [];
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      setStats({
        totalEmpresas: empresas.length,
        totalContactos: contactos.length,
        actividadesSemana: actividades.filter((a: { fecha: string }) => a.fecha >= sevenDaysAgo).length,
        tasaRespuesta: actividades.length > 0
          ? Math.round((actividades.filter((a: { respuesta?: boolean }) => a.respuesta).length / actividades.length) * 100) : 0,
      });
    } finally { setLoading(false); }
  }, [userId]);

  const loadInsight = useCallback(async () => {
    if (!userId) return;
    const cached = sessionStorage.getItem('pirai_daily_insight');
    if (cached) { setInsight(JSON.parse(cached)); return; }
    setInsightLoading(true);
    try {
      const res = await api.post<{ tip: string; gradient: string }>('/api/ai/daily-insight', { userId });
      if (res?.tip) { setInsight(res); sessionStorage.setItem('pirai_daily_insight', JSON.stringify(res)); }
    } catch { /* silent */ } finally { setInsightLoading(false); }
  }, [userId]);

  useEffect(() => { loadData(); loadInsight(); }, [loadData, loadInsight]);

  const isBizUser = ['emprendedor', 'freelancer', 'empresa'].includes(profile?.stage ?? '');
  const gradient = insight?.gradient ?? 'from-[#00A86B] to-[#1BCDD1]';

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        {/* Hero */}
        <div className={`bg-gradient-to-r ${gradient} rounded-2xl p-7 text-white shadow-sm`}>
          <p className="text-sm font-medium opacity-80 mb-1">{saludo}{name ? `, ${name}` : ''} 👋</p>
          {insightLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin opacity-70" />
              <span className="text-sm opacity-70">Analizando tu actividad...</span>
            </div>
          ) : insight?.tip ? (
            <p className="text-base leading-relaxed">{insight.tip}</p>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-1">
                {isBizUser ? '¿A qué prospecto contactás hoy?' : '¿A qué empresa te postulás hoy?'}
              </h2>
              <p className="text-sm opacity-85">Cada acción cuenta. Empezá por algo pequeño.</p>
            </>
          )}
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={<Building2 className="w-5 h-5 text-[var(--color-pirai-500)]" />} label={isBizUser ? 'Prospectos' : 'Empresas'} value={stats?.totalEmpresas ?? 0} bg="bg-[var(--color-pirai-50)]" href="/crm" />
            <StatCard icon={<Users className="w-5 h-5 text-[var(--color-turquesa-500)]" />} label="Contactos" value={stats?.totalContactos ?? 0} bg="bg-[var(--color-turquesa-50)]" href="/crm" />
            <StatCard icon={<Activity className="w-5 h-5 text-[var(--color-pirai-500)]" />} label="Esta semana" value={stats?.actividadesSemana ?? 0} bg="bg-[var(--color-pirai-50)]" href="/crm" />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-[var(--color-turquesa-500)]" />} label="Tasa respuesta" value={`${stats?.tasaRespuesta ?? 0}%`} bg="bg-[var(--color-turquesa-50)]" href="/crm" />
          </div>
        )}

        {/* Quick actions */}
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-3 gap-4">
            <QuickAction icon={<Building2 className="w-5 h-5" />} label={isBizUser ? 'Nueva empresa prospecto' : 'Nueva empresa'} href="/crm" color="pirai" />
            <QuickAction icon={<Briefcase className="w-5 h-5" />} label="Buscar empleos" href="/empleos" color="turquesa" />
            <QuickAction icon={<Sparkles className="w-5 h-5" />} label="Generar CV con IA" href="/marca" color="pirai" />
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={() => { loadData(); loadInsight(); }} className="flex items-center gap-2 text-xs text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ icon, label, value, bg, href }: { icon: React.ReactNode; label: string; value: number | string; bg: string; href: string }) {
  return (
    <Link href={href} className={`${bg} rounded-2xl p-5 border border-white hover:shadow-sm transition-shadow block`}>
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-bold text-[var(--color-brand-dark)]">{value}</p>
      <p className="text-xs text-[var(--color-brand-muted)] mt-1">{label}</p>
    </Link>
  );
}

function QuickAction({ icon, label, href, color }: { icon: React.ReactNode; label: string; href: string; color: 'pirai' | 'turquesa' }) {
  const c = color === 'pirai'
    ? 'border-[var(--color-pirai-100)] hover:border-[var(--color-pirai-500)] hover:bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)]'
    : 'border-[var(--color-turquesa-100)] hover:border-[var(--color-turquesa-500)] hover:bg-[var(--color-turquesa-50)] text-[var(--color-turquesa-600)]';
  return (
    <Link href={href} className={`flex items-center gap-3 bg-white border-2 ${c} rounded-2xl p-4 transition-all`}>
      {icon}
      <span className="text-sm font-medium text-[var(--color-brand-dark)]">{label}</span>
      <ChevronRight className="w-4 h-4 ml-auto opacity-40" />
    </Link>
  );
}
