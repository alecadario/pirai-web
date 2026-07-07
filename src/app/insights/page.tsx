'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback } from 'react';
import { getUserId } from '@/lib/auth';
import {
  Loader2, TrendingUp, Activity, Target, Users, BarChart3,
  Lightbulb, RefreshCw, CheckCircle, Briefcase, MessageSquare,
  Award, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────

interface BootstrapData {
  empresas: Array<{ status?: string }>;
  contactos: Array<{ stage?: string }>;
  actividades: Array<{ fecha: string; respuesta?: boolean; tipo?: string }>;
  userStage?: string;
  profileAnalysis?: { chances_pct?: number };
}

interface DailyInsight {
  tip: string;
  tipo: string;
}

interface MemberStat {
  userId: string;
  name: string;
  role: string;
  totalActividades: number;
  actividadesSemana: number;
  respuestas: number;
  entrevistas: number;
  empresas: number;
  contactos: number;
  dealsActivos: number;
  dealsGanados: number;
  totalGanado: number;
  tasaRespuesta: number;
  lastActivity: string | null;
}

interface TeamData {
  hasTeam: boolean;
  isAdmin?: boolean;
  teamName?: string;
  memberCount?: number;
  members?: MemberStat[];
  totals?: {
    actividades: number;
    respuestas: number;
    tasaRespuesta: number;
    entrevistas: number;
    empresas: number;
    contactos: number;
    deals: number;
    dealsGanados: number;
    totalGanado: number;
    winRate: number;
    pipeline: Record<string, number>;
  };
  last7?: Array<{ day: string; count: number; date: string }>;
}

// ─── Labels ───────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  investigando: 'Investigando',
  contactado: 'Contactado',
  primera_entrevista: '1ª Entrevista',
  segunda_entrevista: '2ª Entrevista',
  oferta: 'Oferta',
  descartado: 'Descartado',
  sin_respuesta: 'Sin respuesta',
  nuevo_cliente: 'Nuevo cliente',
  propuesta: 'Propuesta enviada',
  seguimiento: 'Seguimiento',
  ganado: 'Ganado',
  perdido: 'Perdido',
};

const TIPO_LABELS: Record<string, string> = {
  email: 'Email',
  mensaje_linkedin: 'LinkedIn',
  postulacion: 'Postulación',
  seguimiento: 'Seguimiento',
  entrevista: 'Entrevista',
  llamada: 'Llamada',
  reunión: 'Reunión',
  otro: 'Otro',
};

const TIPO_COLORS: Record<string, string> = {
  outreach: 'bg-[var(--color-pirai-500)]',
  followup: 'bg-[var(--color-turquesa-500)]',
  pipeline: 'bg-amber-500',
  marca: 'bg-purple-500',
  networking: 'bg-pink-500',
  entrevistas: 'bg-green-500',
  general: 'bg-gray-400',
};

// ─── Page ─────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const userId = getUserId();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [insight, setInsight] = useState<DailyInsight | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [bsRes, teamRes] = await Promise.all([
        fetch(`/api/bootstrap?userId=${userId}`).then(r => r.json()),
        fetch(`/api/team-insights?userId=${userId}`).then(r => r.json()).catch(() => ({ hasTeam: false })),
      ]);
      setBootstrap(bsRes);
      setTeamData(teamRes);

      // Load daily insight (GET = cached, POST = generate)
      setInsightLoading(true);
      const cached = await fetch(`/api/daily-insight?userId=${userId}`).then(r => r.json());
      if (cached?.insight) {
        setInsight(cached.insight);
        setInsightLoading(false);
      } else {
        // Generate new
        const gen = await fetch('/api/daily-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, marcaPct: bsRes?.profileAnalysis?.chances_pct || 0 }),
        }).then(r => r.json());
        if (gen?.insight) setInsight(gen.insight);
        setInsightLoading(false);
      }
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

  const { empresas = [], actividades = [], contactos = [] } = bootstrap ?? {};

  // ─── Derived metrics ──────────────────────────────────────────────────
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  const actsWeek = actividades.filter(a => a.fecha >= sevenDaysAgo).length;
  const actsMonth = actividades.filter(a => a.fecha >= thirtyDaysAgo).length;
  const withResponse = actividades.filter(a => a.respuesta).length;
  const tasaRespuesta = actividades.length > 0 ? Math.round((withResponse / actividades.length) * 100) : 0;
  const entrevistas = actividades.filter(a => a.tipo === 'entrevista').length;
  const activePipeline = empresas.filter(e => e.status && !['descartado', 'sin_respuesta', 'perdido'].includes(e.status)).length;

  // Pipeline por etapa
  const etapas: Record<string, number> = {};
  empresas.forEach(e => { if (e.status) etapas[e.status] = (etapas[e.status] ?? 0) + 1; });

  // Actividad por tipo
  const tiposAct: Record<string, number> = {};
  actividades.forEach(a => { if (a.tipo) tiposAct[a.tipo] = (tiposAct[a.tipo] ?? 0) + 1; });

  // Last 7 days bar chart
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (6 - i) * 86400000);
    const dateStr = d.toISOString().split('T')[0];
    return {
      day: dayNames[d.getDay()],
      count: actividades.filter(a => a.fecha === dateStr).length,
      date: dateStr,
    };
  });
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">Insights</h1>

        {/* Daily AI Tip */}
        <div className={`rounded-2xl p-5 border ${insight ? 'bg-gradient-to-r from-[var(--color-pirai-50)] to-[var(--color-turquesa-50)] border-[var(--color-pirai-200)]' : 'bg-white border-[var(--color-brand-border)]'}`}>
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-pirai-500)] flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--color-pirai-600)] uppercase tracking-wider mb-1">Tip del día</p>
              {insightLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-pirai-400)]" />
                  <span className="text-sm text-[var(--color-brand-muted)]">Generando tu tip personalizado…</span>
                </div>
              ) : insight ? (
                <>
                  <p className="text-sm text-[var(--color-brand-dark)] leading-relaxed">{insight.tip}</p>
                  {insight.tipo && insight.tipo !== 'general' && (
                    <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${TIPO_COLORS[insight.tipo] || 'bg-gray-400'}`}>
                      {insight.tipo}
                    </span>
                  )}
                </>
              ) : (
                <p className="text-sm text-[var(--color-brand-muted)]">Sin tip disponible por el momento.</p>
              )}
            </div>
          </div>
        </div>

        {/* Main KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={<Briefcase className="w-5 h-5 text-[var(--color-pirai-500)]" />} label="Empresas en pipeline" value={empresas.length} sub={`${activePipeline} activas`} bg="bg-[var(--color-pirai-50)]" />
          <KPI icon={<Users className="w-5 h-5 text-[var(--color-turquesa-500)]" />} label="Contactos" value={contactos.length} bg="bg-[var(--color-turquesa-50)]" />
          <KPI icon={<TrendingUp className="w-5 h-5 text-[var(--color-pirai-500)]" />} label="Tasa de respuesta" value={`${tasaRespuesta}%`} sub={`${withResponse} de ${actividades.length}`} bg="bg-[var(--color-pirai-50)]" />
          <KPI icon={<Award className="w-5 h-5 text-amber-500" />} label="Entrevistas" value={entrevistas} bg="bg-amber-50" />
        </div>

        {/* Activity rhythm */}
        <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">Actividad últimos 7 días</h2>
            <div className="flex gap-4 text-xs text-[var(--color-brand-muted)]">
              <span><span className="font-bold text-[var(--color-brand-dark)]">{actsWeek}</span> esta semana</span>
              <span><span className="font-bold text-[var(--color-brand-dark)]">{actsMonth}</span> este mes</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-24">
            {last7.map(({ day, count }) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: 72 }}>
                  <div
                    className="w-full rounded-t-lg bg-[var(--color-pirai-500)] transition-all"
                    style={{ height: `${Math.max(4, (count / maxDay) * 72)}px`, opacity: count === 0 ? 0.2 : 1 }}
                  />
                </div>
                <span className="text-[10px] text-[var(--color-brand-muted)]">{day}</span>
                {count > 0 && <span className="text-[10px] font-bold text-[var(--color-brand-dark)]">{count}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pipeline por etapa */}
          <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-[var(--color-pirai-500)]" />
              <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">Pipeline por etapa</h2>
            </div>
            {Object.keys(etapas).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(etapas).sort((a, b) => b[1] - a[1]).map(([etapa, count]) => (
                  <div key={etapa} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-brand-muted)] w-32 shrink-0">{STATUS_LABELS[etapa] || etapa}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[var(--color-pirai-500)] h-2 rounded-full"
                        style={{ width: `${Math.min(100, (count / (empresas.length || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-brand-dark)] w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-brand-muted)] text-center py-6">Sin datos aún</p>
            )}
          </div>

          {/* Actividades por tipo */}
          <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[var(--color-turquesa-500)]" />
              <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">Actividades por tipo</h2>
            </div>
            {Object.keys(tiposAct).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(tiposAct).sort((a, b) => b[1] - a[1]).slice(0, 7).map(([tipo, count]) => (
                  <div key={tipo} className="flex items-center gap-3">
                    <span className="text-xs text-[var(--color-brand-muted)] w-32 shrink-0">{TIPO_LABELS[tipo] || tipo}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[var(--color-turquesa-500)] h-2 rounded-full"
                        style={{ width: `${Math.min(100, (count / (actividades.length || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[var(--color-brand-dark)] w-5 text-right">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--color-brand-muted)] text-center py-6">Sin actividades aún</p>
            )}
          </div>
        </div>

        {/* Team insights (admin only) */}
        {teamData?.hasTeam && teamData?.isAdmin && teamData.members && (
          <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--color-pirai-500)]" />
                <h2 className="font-semibold text-sm text-[var(--color-brand-dark)]">{teamData.teamName || 'Mi equipo'}</h2>
                <span className="text-xs bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] px-2 py-0.5 rounded-full font-semibold">{teamData.memberCount} miembros</span>
              </div>
            </div>

            {/* Team totals */}
            {teamData.totals && (
              <div className="grid grid-cols-4 gap-3">
                <MiniKPI label="Actividades" value={teamData.totals.actividades} />
                <MiniKPI label="Tasa respuesta" value={`${teamData.totals.tasaRespuesta}%`} />
                <MiniKPI label="Entrevistas" value={teamData.totals.entrevistas} />
                <MiniKPI label="Win rate" value={`${teamData.totals.winRate}%`} />
              </div>
            )}

            {/* Member table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-[var(--color-brand-muted)] border-b border-[var(--color-brand-border)]">
                    <th className="text-left py-2 font-semibold">Miembro</th>
                    <th className="text-center py-2 font-semibold">Actividades</th>
                    <th className="text-center py-2 font-semibold">Esta semana</th>
                    <th className="text-center py-2 font-semibold">Respuestas</th>
                    <th className="text-center py-2 font-semibold">Entrevistas</th>
                    <th className="text-center py-2 font-semibold">Empresas</th>
                    <th className="text-right py-2 font-semibold">Última act.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {teamData.members.map(m => (
                    <tr key={m.userId} className="hover:bg-gray-50">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[var(--color-pirai-100)] flex items-center justify-center text-[var(--color-pirai-600)] font-bold text-[10px]">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-[var(--color-brand-dark)]">{m.name}</span>
                          {m.role === 'admin' && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">admin</span>}
                        </div>
                      </td>
                      <td className="text-center py-2.5 font-semibold text-[var(--color-brand-dark)]">{m.totalActividades}</td>
                      <td className="text-center py-2.5">
                        <span className={`font-semibold ${m.actividadesSemana > 0 ? 'text-[var(--color-pirai-600)]' : 'text-gray-300'}`}>{m.actividadesSemana}</span>
                      </td>
                      <td className="text-center py-2.5">
                        <span className="font-semibold text-[var(--color-turquesa-600)]">{m.respuestas}</span>
                        <span className="text-[var(--color-brand-muted)]"> ({m.tasaRespuesta}%)</span>
                      </td>
                      <td className="text-center py-2.5 font-semibold text-amber-600">{m.entrevistas}</td>
                      <td className="text-center py-2.5 text-[var(--color-brand-dark)]">{m.empresas}</td>
                      <td className="text-right py-2.5 text-[var(--color-brand-muted)]">
                        {m.lastActivity ? m.lastActivity : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Team last7 bar chart */}
            {teamData.last7 && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-brand-muted)] mb-3">Actividad del equipo (7 días)</p>
                <div className="flex items-end gap-2 h-16">
                  {teamData.last7.map(({ day, count }) => {
                    const mx = Math.max(...(teamData.last7 ?? []).map(d => d.count), 1);
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex items-end justify-center" style={{ height: 48 }}>
                          <div
                            className="w-full rounded-t-lg bg-[var(--color-pirai-400)] transition-all"
                            style={{ height: `${Math.max(3, (count / mx) * 48)}px`, opacity: count === 0 ? 0.2 : 1 }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--color-brand-muted)]">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ─── Small components ─────────────────────────────────────────────────────

function KPI({ icon, label, value, sub, bg }: { icon: React.ReactNode; label: string; value: number | string; sub?: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5 border border-white`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-[var(--color-brand-dark)]">{value}</p>
      <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[var(--color-brand-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniKPI({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-lg font-bold text-[var(--color-brand-dark)]">{value}</p>
      <p className="text-[10px] text-[var(--color-brand-muted)]">{label}</p>
    </div>
  );
}
