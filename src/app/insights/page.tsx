'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback } from 'react';
import { getUserId } from '@/lib/auth';
import { api } from '@/lib/api';
import { Loader2, TrendingUp, Activity, Target, Users, BarChart3 } from 'lucide-react';

interface InsightData {
  totalEmpresas: number;
  totalContactos: number;
  totalActividades: number;
  actividadesSemana: number;
  actividadesMes: number;
  tasaRespuesta: number;
  etapas: Record<string, number>;
  tiposActividad: Record<string, number>;
  activePipeline: number;
}

export default function InsightsPage() {
  const [data, setData] = useState<InsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const userId = getUserId();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get<{
        empresas: { status?: string }[];
        contactos: { stage?: string }[];
        actividades: { fecha: string; respuesta?: boolean; tipo?: string }[];
      }>(`/api/bootstrap?userId=${userId}`);

      const { empresas = [], contactos = [], actividades = [] } = res;
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

      const etapas: Record<string, number> = {};
      empresas.forEach(e => { if (e.status) etapas[e.status] = (etapas[e.status] ?? 0) + 1; });

      const tiposActividad: Record<string, number> = {};
      actividades.forEach(a => { if (a.tipo) tiposActividad[a.tipo] = (tiposActividad[a.tipo] ?? 0) + 1; });

      const activePipeline = empresas.filter(e =>
        e.status && !['descartado', 'sin_respuesta'].includes(e.status)
      ).length;

      setData({
        totalEmpresas: empresas.length,
        totalContactos: contactos.length,
        totalActividades: actividades.length,
        actividadesSemana: actividades.filter(a => a.fecha >= sevenDaysAgo).length,
        actividadesMes: actividades.filter(a => a.fecha >= thirtyDaysAgo).length,
        tasaRespuesta: actividades.length > 0
          ? Math.round((actividades.filter(a => a.respuesta).length / actividades.length) * 100) : 0,
        etapas,
        tiposActividad,
        activePipeline,
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pirai-500)]" />
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">
        <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">Insights</h1>

        {/* Main stats */}
        <div className="grid grid-cols-4 gap-4">
          <StatBox icon={<Users className="w-5 h-5 text-[var(--color-pirai-500)]" />} label="Empresas en pipeline" value={data?.totalEmpresas ?? 0} bg="bg-[var(--color-pirai-50)]" />
          <StatBox icon={<Users className="w-5 h-5 text-[var(--color-turquesa-500)]" />} label="Contactos totales" value={data?.totalContactos ?? 0} bg="bg-[var(--color-turquesa-50)]" />
          <StatBox icon={<Activity className="w-5 h-5 text-[var(--color-pirai-500)]" />} label="Actividades este mes" value={data?.actividadesMes ?? 0} bg="bg-[var(--color-pirai-50)]" />
          <StatBox icon={<TrendingUp className="w-5 h-5 text-[var(--color-turquesa-500)]" />} label="Tasa de respuesta" value={`${data?.tasaRespuesta ?? 0}%`} bg="bg-[var(--color-turquesa-50)]" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Pipeline por etapa */}
          <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <Target className="w-4 h-4 text-[var(--color-pirai-500)]" />
              <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">Pipeline por etapa</h2>
            </div>
            {data && Object.keys(data.etapas).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.etapas)
                  .sort((a, b) => b[1] - a[1])
                  .map(([etapa, count]) => (
                    <div key={etapa} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--color-brand-muted)] w-28 shrink-0 capitalize">{etapa}</span>
                      <div className="flex-1 bg-[var(--color-brand-gray)] rounded-full h-2">
                        <div
                          className="bg-[var(--color-pirai-500)] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (count / (data?.totalEmpresas || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-brand-dark)] w-5 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-brand-muted)] text-center py-6">Sin datos aún</p>
            )}
          </div>

          {/* Tipos de actividad */}
          <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 className="w-4 h-4 text-[var(--color-turquesa-500)]" />
              <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">Actividades por tipo</h2>
            </div>
            {data && Object.keys(data.tiposActividad).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(data.tiposActividad)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([tipo, count]) => (
                    <div key={tipo} className="flex items-center gap-3">
                      <span className="text-xs text-[var(--color-brand-muted)] w-28 shrink-0 capitalize">{tipo.replace(/_/g, ' ')}</span>
                      <div className="flex-1 bg-[var(--color-brand-gray)] rounded-full h-2">
                        <div
                          className="bg-[var(--color-turquesa-500)] h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (count / (data?.totalActividades || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[var(--color-brand-dark)] w-5 text-right">{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-brand-muted)] text-center py-6">Sin actividades aún</p>
            )}
          </div>
        </div>

        {/* Weekly rhythm */}
        <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
          <h2 className="font-semibold text-sm text-[var(--color-brand-dark)] mb-4">Ritmo de actividad</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-pirai-500)]">{data?.actividadesSemana ?? 0}</p>
              <p className="text-xs text-[var(--color-brand-muted)] mt-1">Esta semana</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-turquesa-500)]">{data?.activePipeline ?? 0}</p>
              <p className="text-xs text-[var(--color-brand-muted)] mt-1">Oportunidades activas</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function StatBox({ icon, label, value, bg }: { icon: React.ReactNode; label: string; value: number | string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border border-white`}>
      <div className="mb-3">{icon}</div>
      <p className="text-2xl font-bold text-[var(--color-brand-dark)]">{value}</p>
      <p className="text-xs text-[var(--color-brand-muted)] mt-1">{label}</p>
    </div>
  );
}
