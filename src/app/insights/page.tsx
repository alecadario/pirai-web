'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface Activity {
  id: string;
  tipo: string;
  fecha: string;
  respuesta?: boolean;
  empresaId?: string;
  contactoId?: string;
}

interface Empresa {
  id: string;
  name: string;
  status?: string;
}

interface Contacto {
  id: string;
  name: string;
  stage?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email?: string;
  actividades?: number;
  empresas?: number;
  respuestas?: number;
}

interface BootstrapData {
  profileData?: { stage?: string; accountType?: string; teamPlan?: boolean };
  actividades?: Activity[];
  empresas?: Empresa[];
  contactos?: Contacto[];
}

const STATUS_ORDER = [
  { key: 'investigando', label: 'Investigando', color: 'bg-gray-400' },
  { key: 'contactado', label: 'Contactados', color: 'bg-[var(--color-turquesa-500)]' },
  { key: 'en conversación', label: 'En conversación', color: 'bg-[var(--color-turquesa-600)]' },
  { key: 'entrevista', label: 'Entrevista / Reunión', color: 'bg-[var(--color-pirai-500)]' },
  { key: 'oferta', label: 'Oferta / Propuesta', color: 'bg-orange-500' },
  { key: 'cliente', label: 'Clientes / Contratados', color: 'bg-[var(--color-pirai-600)]' },
];

export default function InsightsPage() {
  const [tab, setTab] = useState<'personal' | 'equipo'>('personal');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<BootstrapData>({});
  const [teamData, setTeamData] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [hasTeamPlan, setHasTeamPlan] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then((d: BootstrapData) => {
        setData(d);
        setHasTeamPlan(!!d.profileData?.teamPlan);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (tab !== 'equipo' || !hasTeamPlan) return;
    const userId = getUserId();
    if (!userId) return;
    setTeamLoading(true);
    fetch(`${API}/api/team-insights?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(d => setTeamData(d.members || d || []))
      .catch(console.error)
      .finally(() => setTeamLoading(false));
  }, [tab, hasTeamPlan]);

  const actividades = data.actividades || [];
  const empresas = data.empresas || [];
  const contactos = data.contactos || [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const actUltimoMes = actividades.filter(a => a.fecha >= thirtyDaysAgo).length;
  const actUltimaSemana = actividades.filter(a => a.fecha >= sevenDaysAgo).length;
  const respuestas = actividades.filter(a => a.respuesta).length;
  const tasaRespuesta = actividades.length > 0 ? Math.round((respuestas / actividades.length) * 100) : 0;

  // Pipeline breakdown
  const byStatus: Record<string, number> = {};
  empresas.forEach(e => {
    const s = e.status || 'investigando';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  // Activity by type
  const byTipo: Record<string, number> = {};
  actividades.forEach(a => {
    byTipo[a.tipo] = (byTipo[a.tipo] || 0) + 1;
  });
  const tiposSorted = Object.entries(byTipo).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Activity trend last 4 weeks
  const weeks: { label: string; count: number }[] = [];
  for (let i = 3; i >= 0; i--) {
    const from = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const to = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const count = actividades.filter(a => a.fecha >= from && a.fecha < to).length;
    weeks.push({ label: `Sem ${4 - i}`, count });
  }
  const maxWeek = Math.max(...weeks.map(w => w.count), 1);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">Insights</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-brand-gray)] rounded-xl p-1 mb-6 w-fit">
          {([
            { key: 'personal', label: 'Mi actividad' },
            { key: 'equipo', label: 'Equipo' },
          ] as const).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white text-[var(--color-brand-dark)] shadow-sm'
                  : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-[var(--color-brand-border)] border-t-[var(--color-pirai-600)] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* PERSONAL TAB */}
            {tab === 'personal' && (
              <div className="space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Empresas en pipeline', value: empresas.length, color: 'text-[var(--color-pirai-600)]' },
                    { label: 'Contactos', value: contactos.length, color: 'text-[var(--color-turquesa-600)]' },
                    { label: 'Actividades (30 días)', value: actUltimoMes, color: 'text-[var(--color-pirai-600)]' },
                    { label: 'Tasa de respuesta', value: `${tasaRespuesta}%`, color: 'text-orange-600' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-sm text-[var(--color-brand-muted)] mt-1">{label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Pipeline breakdown */}
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                    <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Pipeline por estado</h2>
                    <div className="space-y-3">
                      {STATUS_ORDER.map(s => {
                        const count = byStatus[s.key] || 0;
                        const pct = empresas.length > 0 ? (count / empresas.length) * 100 : 0;
                        return (
                          <div key={s.key} className="flex items-center gap-3">
                            <span className="text-xs text-[var(--color-brand-muted)] w-36 shrink-0">{s.label}</span>
                            <div className="flex-1 h-5 bg-[var(--color-brand-gray)] rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${s.color} flex items-center justify-end pr-2 transition-all duration-500`}
                                style={{ width: `${count > 0 ? Math.max(pct, 10) : 0}%` }}
                              >
                                {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activity trend */}
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                    <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Actividad últimas 4 semanas</h2>
                    <div className="flex items-end gap-3 h-24 mb-2">
                      {weeks.map((w, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col justify-end h-20">
                            <div
                              className="w-full rounded-t-md bg-[var(--color-pirai-400)] transition-all duration-500"
                              style={{ height: `${w.count > 0 ? Math.max((w.count / maxWeek) * 100, 10) : 4}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-[var(--color-brand-muted)]">{w.label}</span>
                          <span className="text-[10px] font-bold text-[var(--color-brand-dark)]">{w.count}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[var(--color-brand-border)]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-brand-muted)]">Esta semana</span>
                        <span className="font-bold text-[var(--color-brand-dark)]">{actUltimaSemana} actividades</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity by type */}
                {tiposSorted.length > 0 && (
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                    <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Actividades por tipo</h2>
                    <div className="grid grid-cols-5 gap-3">
                      {tiposSorted.map(([tipo, count]) => (
                        <div key={tipo} className="text-center p-3 bg-[var(--color-brand-surface)] rounded-xl">
                          <p className="text-xl font-bold text-[var(--color-pirai-600)]">{count}</p>
                          <p className="text-xs text-[var(--color-brand-muted)] mt-1 capitalize">{tipo}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-[var(--color-pirai-50)] rounded-xl border border-[var(--color-pirai-100)] p-5">
                  <h2 className="font-semibold text-[var(--color-pirai-800)] mb-3">Resumen total</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total actividades', value: actividades.length },
                      { label: 'Con respuesta', value: respuestas },
                      { label: 'Sin contactar', value: byStatus['investigando'] || 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-[var(--color-pirai-700)]">{label}</span>
                        <span className="text-sm font-bold text-[var(--color-pirai-600)]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* EQUIPO TAB */}
            {tab === 'equipo' && (
              <div>
                {!hasTeamPlan ? (
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-12 text-center">
                    <p className="text-4xl mb-3">👥</p>
                    <h2 className="font-semibold text-[var(--color-brand-dark)] text-lg mb-2">Plan de equipo</h2>
                    <p className="text-sm text-[var(--color-brand-muted)] max-w-sm mx-auto">
                      Los insights de equipo están disponibles para planes grupales. Contactá a soporte para activar esta función.
                    </p>
                  </div>
                ) : teamLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-[var(--color-brand-border)] border-t-[var(--color-pirai-600)] rounded-full animate-spin" />
                  </div>
                ) : teamData.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-12 text-center">
                    <p className="text-sm text-[var(--color-brand-muted)]">No hay datos de equipo disponibles.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
                      <span className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">{teamData.length} miembros</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--color-brand-border)]">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Miembro</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Empresas</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Actividades</th>
                          <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Respuestas</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--color-brand-border)]">
                        {teamData.map(m => (
                          <tr key={m.id} className="hover:bg-[var(--color-brand-surface)] transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-[var(--color-brand-dark)]">{m.name}</p>
                              {m.email && <p className="text-xs text-[var(--color-brand-muted)]">{m.email}</p>}
                            </td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{m.empresas ?? 0}</td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{m.actividades ?? 0}</td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{m.respuestas ?? 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
