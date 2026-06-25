'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId, getUserName } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface DailyInsight {
  tip: string;
}

interface ProfileData {
  stage?: string;
  accountType?: string;
  passion?: string;
  impact?: string;
  services_description?: string;
}

interface Activity {
  id: string;
  tipo: string;
  fecha: string;
  respuesta?: boolean;
  empresaId?: string;
  contactoId?: string;
  notas?: string;
}

interface Empresa {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  priority?: string;
  numActividades?: number;
  numContactos?: number;
  ultimaActividad?: string;
}

interface Deal {
  id: string;
  status: string;
  amount?: number;
  currency?: string;
}

function stageVocab(stage?: string) {
  const isBiz = stage === 'emprendedor' || stage === 'freelancer' || stage === 'empresa';
  return {
    empresas: isBiz ? 'clientes potenciales' : 'empresas',
    entrevista: isBiz ? 'reunión' : 'entrevista',
  };
}

export default function DashboardPage() {
  const [dailyInsight, setDailyInsight] = useState<DailyInsight | null>(null);
  const [dailyInsightLoading, setDailyInsightLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [actividades, setActividades] = useState<Activity[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const userId = getUserId();
    const name = getUserName();
    if (name) setUserName(name);
    if (!userId) return;

    // Load bootstrap data
    async function loadData() {
      try {
        const res = await fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId!)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.profileData) setProfileData(data.profileData);
        if (data.actividades) setActividades(data.actividades);
        if (data.empresas) setEmpresas(data.empresas);
        if (data.deals) setDeals(data.deals);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    // Load daily insight
    async function loadInsight() {
      setDailyInsightLoading(true);
      try {
        const res = await fetch(`${API}/api/daily-insight?userId=${encodeURIComponent(userId!)}`);
        if (res.ok) {
          const data = await res.json();
          setDailyInsight(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setDailyInsightLoading(false);
      }
    }

    loadData();
    loadInsight();
  }, []);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const recentActs = actividades.filter(a => a.fecha >= sevenDaysAgo).length;
  const respuestas = actividades.filter(a => a.respuesta).length;
  const tasaResp = actividades.length > 0 ? Math.round((respuestas / actividades.length) * 100) : 0;
  const dealsGanados = deals.filter(d => d.status === 'ganado');
  const dealsActivos = deals.filter(d => d.status === 'en_negociacion');
  const totalGanado = dealsGanados.reduce((sum, d) => sum + (d.amount || 0), 0);

  const isBiz = ['emprendedor', 'freelancer', 'empresa'].includes(profileData?.stage || '');
  const v = stageVocab(profileData?.stage);

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';
  const firstName = (userName || '').split(' ')[0] || '';

  // Pipeline stats
  const byStatus: Record<string, number> = {};
  empresas.forEach(e => {
    const s = e.status || 'investigando';
    byStatus[s] = (byStatus[s] || 0) + 1;
  });

  // Last 7 days activity bars
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const count = actividades.filter(a => a.fecha === dateStr).length;
    last7.push({ day: dayNames[d.getDay()], count, date: dateStr });
  }
  const maxDay = Math.max(...last7.map(d => d.count), 1);

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <div className="grid grid-cols-3 gap-6">
          {/* Left column — main content */}
          <div className="col-span-2 space-y-6">
            {/* Greeting banner */}
            <div className="bg-gradient-to-r from-pirai-600 to-pirai-700 rounded-2xl p-6 text-white">
              <p className="text-sm font-medium opacity-80 mb-2">
                {saludo}{firstName ? `, ${firstName}` : ''} 👋
              </p>
              {dailyInsightLoading ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <p className="text-sm opacity-80">Analizando tu actividad...</p>
                </div>
              ) : dailyInsight ? (
                <p className="text-sm opacity-95 leading-relaxed">{dailyInsight.tip}</p>
              ) : (
                <>
                  <h2 className="text-xl font-bold mb-1">Tu día en Piraí</h2>
                  <p className="text-sm opacity-90">Revisá tu pipeline, registrá actividades y avanzá hacia tus objetivos.</p>
                </>
              )}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <p className="text-2xl font-bold text-pirai-600">{recentActs}</p>
                <p className="text-sm text-[var(--color-brand-muted)] mt-1">Actividades esta semana</p>
              </div>
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <p className="text-2xl font-bold text-turquesa-600">{tasaResp}%</p>
                <p className="text-sm text-[var(--color-brand-muted)] mt-1">Tasa de respuesta</p>
              </div>
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <p className="text-2xl font-bold text-pirai-600">{empresas.length}</p>
                <p className="text-sm text-[var(--color-brand-muted)] mt-1">{isBiz ? 'Prospectos' : 'Empresas'} en pipeline</p>
              </div>
            </div>

            {/* Activity chart */}
            <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--color-brand-dark)]">Actividad últimos 7 días</h2>
                <span className="text-xs text-[var(--color-brand-muted)]">{last7.reduce((s, d) => s + d.count, 0)} total</span>
              </div>
              <div className="flex items-end gap-2 h-24">
                {last7.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end h-16">
                      <div
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          d.date === new Date().toISOString().split('T')[0]
                            ? 'bg-pirai-500'
                            : d.count > 0 ? 'bg-pirai-300' : 'bg-[var(--color-brand-gray)]'
                        }`}
                        style={{ height: `${d.count > 0 ? Math.max((d.count / maxDay) * 100, 15) : 8}%` }}
                      />
                    </div>
                    <span className={`text-[10px] ${
                      d.date === new Date().toISOString().split('T')[0] ? 'font-bold text-pirai-600' : 'text-[var(--color-brand-muted)]'
                    }`}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline funnel */}
            {empresas.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Tu embudo</h2>
                {[
                  { label: 'Sin prospectar', key: 'investigando', color: 'bg-gray-400', emoji: '🔍' },
                  { label: 'Contactadas', key: 'contactado', color: 'bg-turquesa-500', emoji: '💬' },
                  { label: 'En conversación', key: 'en conversación', color: 'bg-turquesa-600', emoji: '🔄' },
                  { label: v.entrevista, key: 'entrevista', color: 'bg-pirai-500', emoji: '📅' },
                  { label: 'Oferta / Propuesta', key: 'oferta', color: 'bg-orange-500', emoji: '🔥' },
                  { label: isBiz ? 'Clientes' : 'Contrataciones', key: 'cliente', color: 'bg-pirai-600', emoji: '🏆' },
                ].map(s => {
                  const count = byStatus[s.key] || 0;
                  return (
                    <div key={s.key} className="flex items-center gap-3 mb-3 last:mb-0">
                      <span className="text-sm w-5 text-center">{s.emoji}</span>
                      <span className="text-xs text-[var(--color-brand-muted)] w-32">{s.label}</span>
                      <div className="flex-1 h-5 bg-[var(--color-brand-gray)] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.color} flex items-center justify-end pr-2`}
                          style={{ width: `${empresas.length > 0 ? Math.max((count / empresas.length) * 100, count > 0 ? 15 : 0) : 0}%`, transition: 'width 0.5s ease' }}
                        >
                          {count > 0 && <span className="text-[10px] font-bold text-white">{count}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right column — sidebar info */}
          <div className="space-y-5">
            {/* Quick links */}
            <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
              <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">Acciones rápidas</h2>
              <div className="space-y-2">
                {[
                  { href: '/crm', label: '+ Agregar empresa', color: 'text-pirai-600 bg-pirai-50 hover:bg-pirai-100' },
                  { href: '/crm', label: '+ Registrar actividad', color: 'text-turquesa-600 bg-turquesa-50 hover:bg-turquesa-100' },
                  { href: '/empleos', label: isBiz ? 'Buscar prospectos' : 'Buscar empleos', color: 'text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] hover:bg-gray-200' },
                  { href: '/cv', label: 'Generar CV con IA', color: 'text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] hover:bg-gray-200' },
                ].map(({ href, label, color }) => (
                  <a
                    key={href + label}
                    href={href}
                    className={`block w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${color}`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Deals summary */}
            {deals.length > 0 && (
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">Deals</h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-brand-muted)]">Ganados</span>
                    <span className="text-sm font-bold text-pirai-600">{dealsGanados.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-brand-muted)]">Activos</span>
                    <span className="text-sm font-bold text-orange-600">{dealsActivos.length}</span>
                  </div>
                  {totalGanado > 0 && (
                    <div className="flex items-center justify-between pt-2 border-t border-[var(--color-brand-border)]">
                      <span className="text-sm text-[var(--color-brand-muted)]">Total ganado</span>
                      <span className="text-sm font-bold text-pirai-600">${totalGanado.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* This week summary */}
            <div className="bg-pirai-50 rounded-xl border border-pirai-100 p-5">
              <h2 className="font-semibold text-pirai-800 mb-3">Esta semana</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pirai-700">Actividades</span>
                  <span className="text-sm font-bold text-pirai-600">{recentActs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pirai-700">Respuestas</span>
                  <span className="text-sm font-bold text-pirai-600">{actividades.filter(a => a.respuesta && a.fecha >= sevenDaysAgo).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pirai-700">Tasa resp.</span>
                  <span className="text-sm font-bold text-pirai-600">{tasaResp}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
