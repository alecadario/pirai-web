'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { getUserId, getUserName } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Loader2, TrendingUp, Users, Activity, Building2,
  Sparkles, RefreshCw, Send, Target, Zap, Play,
  ChevronRight, AlertCircle, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

interface ProfileData {
  stage?: string | null;
  passion?: string;
  impact?: string;
  services_description?: string;
  diagnosis?: string;
}

interface Empresa {
  id: string;
  name: string;
  status: string;
  numActividades?: number;
  logo_url?: string;
  industry?: string;
  country?: string;
}

interface Contacto {
  id: string;
  name: string;
  stage?: string;
  empresaId?: string;
  empresaNombre?: string;
}

interface Actividad {
  id: string;
  tipo: string;
  fecha: string;
  contactoId?: string;
  empresaId?: string;
  respuesta?: boolean;
  createdAt?: string;
}

interface FocusAction {
  label: string;
  icon: string;
  action: string;
  tag: 'urgente' | 'crecimiento' | 'aprendé';
  empresaId?: string;
  contactoId?: string;
}

interface DailyFocus {
  gradient: string;
  title: string;
  subtitle: string;
  actions: FocusAction[];
}

interface SuggestedCompany {
  id?: string;
  name: string;
  industry?: string;
  country?: string;
  logo_url?: string;
  reason?: string;
}

function getGradientStyle(gradient: string): string {
  const map: Record<string, string> = {
    'from-pirai-600 to-pirai-600': 'from-[#009660] to-[#009660]',
    'from-pirai-500 to-pirai-600': 'from-[#00A86B] to-[#009660]',
    'from-turquesa-600 to-pirai-600': 'from-[#17b8bc] to-[#009660]',
    'from-pirai-600 to-turquesa-600': 'from-[#009660] to-[#17b8bc]',
    'from-orange-500 to-red-600': 'from-orange-500 to-red-600',
    'from-amber-500 to-orange-600': 'from-amber-500 to-orange-600',
  };
  return map[gradient] ?? 'from-[#00A86B] to-[#1BCDD1]';
}

function getDailyFocus(
  empresas: Empresa[],
  contactos: Contacto[],
  actividades: Actividad[],
  profileData: ProfileData,
): DailyFocus {
  const today = new Date().toISOString().split('T')[0];
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const isBizUser = ['emprendedor', 'freelancer', 'empresa'].includes(profileData?.stage ?? '');
  const totalActs = actividades.length;
  const recentActs = actividades.filter(a => a.fecha >= sevenDaysAgo).length;
  const respuestas = actividades.filter(a => a.respuesta).length;
  const tasaResp = totalActs > 0 ? Math.round((respuestas / totalActs) * 100) : 0;

  const contactadosHoy = new Set(
    actividades.filter(a => a.fecha === today).map(a => a.contactoId).filter(Boolean),
  );

  const needFollowup = empresas.filter(e => {
    if (!['contactado', 'en conversación'].includes(e.status)) return false;
    const lastAct = actividades.find(a => a.empresaId === e.id);
    return !lastAct || lastAct.fecha < threeDaysAgo;
  });

  const soloInvestigando = empresas.filter(e => e.status === 'investigando' && (e.numActividades ?? 0) === 0);

  const allScoredContacts = contactos
    .filter(c => c.stage !== 'descartado' && c.stage !== 'nuevo_cliente')
    .filter(c => !contactadosHoy.has(c.id))
    .map(c => {
      const acts = actividades
        .filter(a => a.contactoId === c.id)
        .sort((a, b) => (b.createdAt ?? b.fecha ?? '').localeCompare(a.createdAt ?? a.fecha ?? ''));
      const lastAct = acts[0];
      const daysSinceContact = lastAct
        ? Math.floor((Date.now() - new Date(lastAct.fecha).getTime()) / 86400000)
        : 999;
      const hasResponded = acts.some(a => a.respuesta);
      const empresa = empresas.find(e => e.id === c.empresaId);
      let score = 0;
      if (hasResponded) score += 30;
      if (c.stage === 'en conversación' || c.stage === 'en_conversacion') score += 25;
      if (c.stage === 'primer_contacto') score += 15;
      if (daysSinceContact >= 3 && daysSinceContact < 7) score += 15;
      if (daysSinceContact >= 7) score += 10;
      if (daysSinceContact >= 1) score += 5;
      if (acts.length > 0 && acts.length <= 3) score += 10;
      if (acts.length === 0) score += 20;
      return { ...c, score, daysSinceContact, hasResponded, empresaNombre: empresa?.name ?? c.empresaNombre ?? '' };
    })
    .sort((a, b) => b.score - a.score);

  const scoredContacts = allScoredContacts.filter(c => c.daysSinceContact >= 2);
  const topContact = scoredContacts[0] ?? allScoredContacts[0] ?? null;
  const secondContact = scoredContacts[1] ?? allScoredContacts[1] ?? null;

  const contactLabel = (c: typeof topContact): string => {
    if (!c) return '';
    const dias = c.daysSinceContact;
    const empresa = c.empresaNombre ? ` (${c.empresaNombre})` : '';
    if (dias >= 999) return `Escribile a ${c.name}${empresa}`;
    if (dias === 0) return `Seguí la conversación con ${c.name}${empresa}`;
    if (dias === 1) return `Escribile a ${c.name}${empresa} — ayer`;
    return `Escribile a ${c.name}${empresa} — hace ${dias}d`;
  };

  const actions: FocusAction[] = [];

  // URGENTE
  if (totalActs > 0 && recentActs === 0) {
    if (topContact) {
      actions.push({ label: contactLabel(topContact), icon: 'Send', action: 'go_crm', tag: 'urgente', contactoId: topContact.id });
    } else {
      actions.push({ label: 'Llevás 7+ días sin actividad. Reactivá hoy.', icon: 'Zap', action: 'go_crm', tag: 'urgente' });
    }
  } else if (topContact) {
    actions.push({ label: contactLabel(topContact), icon: 'Send', action: 'go_crm', tag: 'urgente', contactoId: topContact.id });
  } else if (needFollowup.length > 0) {
    actions.push({ label: `Follow-up a ${needFollowup[0].name}`, icon: 'Send', action: 'go_crm', tag: 'urgente', empresaId: needFollowup[0].id });
  } else if (empresas.length > 0 && contactos.filter(c => c.stage !== 'descartado').length === 0) {
    actions.push({ label: `Agregá contactos en ${empresas[0].name}`, icon: 'Users', action: 'go_crm', tag: 'urgente', empresaId: empresas[0].id });
  } else {
    const actsToday = actividades.filter(a => a.fecha === today).length;
    if (actsToday > 0) {
      actions.push({ label: `¡Bien! ${actsToday} actividad${actsToday > 1 ? 'es' : ''} hoy. ¿Sumás otra?`, icon: 'Zap', action: 'go_crm', tag: 'urgente' });
    } else if (empresas.length === 0) {
      actions.push({ label: isBizUser ? 'Agregá tu primer prospecto' : 'Agregá tu primera empresa', icon: 'Building2', action: 'go_crm', tag: 'urgente' });
    } else {
      actions.push({ label: 'Registrá una actividad hoy', icon: 'Zap', action: 'go_crm', tag: 'urgente' });
    }
  }

  // CRECIMIENTO
  const postulaciones = actividades.filter(a => a.tipo === 'postulacion').length;
  const contactosEnEntrevista = contactos.filter(c => c.stage === 'entrevista').length;
  const contactosGanados = contactos.filter(c => c.stage === 'nuevo_cliente').length;

  if (secondContact) {
    actions.push({ label: contactLabel(secondContact), icon: 'Send', action: 'go_crm', tag: 'crecimiento', contactoId: secondContact.id });
  } else if (soloInvestigando.length > 0) {
    actions.push({ label: `Contactá a ${soloInvestigando[0].name}`, icon: 'Target', action: 'go_crm', tag: 'crecimiento', empresaId: soloInvestigando[0].id });
  } else if (isBizUser) {
    if (contactosEnEntrevista > 0) {
      actions.push({ label: 'Tenés reuniones activas. Cerrá con una propuesta.', icon: 'Target', action: 'go_crm', tag: 'crecimiento' });
    } else if (contactosGanados > 0 && contactosGanados < 3) {
      actions.push({ label: `${contactosGanados} cliente${contactosGanados > 1 ? 's' : ''}. Buscá el siguiente.`, icon: 'Building2', action: 'go_crm', tag: 'crecimiento' });
    } else if (empresas.length < 10) {
      actions.push({ label: `Sumá prospectos al pipeline (${empresas.length}/10)`, icon: 'Building2', action: 'go_crm', tag: 'crecimiento' });
    } else {
      actions.push({ label: 'Revisá tu pipeline de clientes', icon: 'Target', action: 'go_crm', tag: 'crecimiento' });
    }
  } else {
    if (postulaciones === 0 && totalActs > 0) {
      actions.push({ label: 'Todavía no postulaste. Mandá tu primera postulación.', icon: 'Target', action: 'go_empleos', tag: 'crecimiento' });
    } else if (contactosEnEntrevista > 0) {
      actions.push({ label: `${contactosEnEntrevista} entrevista${contactosEnEntrevista > 1 ? 's' : ''} activa${contactosEnEntrevista > 1 ? 's' : ''}. Preparate bien.`, icon: 'Target', action: 'go_crm', tag: 'crecimiento' });
    } else if (empresas.length < 10) {
      actions.push({ label: `Sumá empresas al pipeline (${empresas.length}/10)`, icon: 'Building2', action: 'go_crm', tag: 'crecimiento' });
    } else {
      actions.push({ label: 'Revisá tu pipeline de empleo', icon: 'Target', action: 'go_crm', tag: 'crecimiento' });
    }
  }

  // APRENDÉ
  actions.push({ label: 'Mejorá tu marca personal', icon: 'Sparkles', action: 'go_marca', tag: 'aprendé' });

  // Gradient & title
  let gradient = 'from-pirai-600 to-pirai-600';
  let title = 'Tu plan de hoy';
  if (totalActs > 0 && recentActs === 0) {
    gradient = 'from-orange-500 to-red-600';
    title = isBizUser ? 'Reactivá tu prospección' : 'Reactivá tu búsqueda';
  } else if (needFollowup.length > 0) {
    gradient = 'from-turquesa-600 to-pirai-600';
    title = `${needFollowup.length} follow-up${needFollowup.length > 1 ? 's' : ''} pendiente${needFollowup.length > 1 ? 's' : ''}`;
  } else if (recentActs >= 10) {
    gradient = 'from-pirai-500 to-pirai-600';
    title = 'Buen ritmo esta semana';
  } else if (empresas.length === 0) {
    gradient = 'from-pirai-600 to-turquesa-600';
    title = '¡Tu sistema está listo!';
  }

  return {
    gradient,
    title,
    subtitle: `${recentActs} actividades esta semana · ${empresas.length} ${isBizUser ? 'prospectos' : 'empresas'} · ${tasaResp}% respuesta`,
    actions,
  };
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Send: <Send className="w-4 h-4" />,
  Target: <Target className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Users: <Users className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Play: <Play className="w-4 h-4" />,
};

const TAG_STYLES: Record<string, string> = {
  urgente: 'bg-red-50 border border-red-100',
  crecimiento: 'bg-[#e8f8f4] border border-[#b3e8d8]',
  'aprendé': 'bg-[#e8f6fd] border border-[#b3ddf0]',
};

const TAG_BADGE: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  crecimiento: 'bg-[#00A86B]/10 text-[#00A86B]',
  'aprendé': 'bg-[#1BCDD1]/10 text-[#0fa8ac]',
};

export default function DashboardPage() {
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [insight, setInsight] = useState<{ tip: string; gradient: string } | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [suggestedCompanies, setSuggestedCompanies] = useState<SuggestedCompany[]>([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = getUserId();
  const name = getUserName()?.split(' ')[0] ?? '';
  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buen día' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let diagnosis = '';
      let stage = '';
      try {
        const userRecord = await fetch(`${BASE}/api/user-record?userId=${encodeURIComponent(userId)}`).then(r => r.json());
        const fields = userRecord?.record?.fields ?? {};
        if (fields.onboarding_answers) {
          try {
            const answers = JSON.parse(fields.onboarding_answers as string);
            setProfileData(answers);
            diagnosis = answers.diagnosis ?? '';
            stage = answers.stage ?? '';
          } catch { /* ignore */ }
        }
        if (fields.diagnosis) diagnosis = fields.diagnosis as string;
        if (fields.stage) stage = fields.stage as string;
      } catch { /* ignore */ }

      const data = await fetch(
        `${BASE}/api/bootstrap?userId=${encodeURIComponent(userId)}&diagnosis=${encodeURIComponent(diagnosis)}&stage=${encodeURIComponent(stage)}`
      ).then(r => r.json());

      const sortedActividades = (data.activities ?? []).sort((a: Actividad, b: Actividad) => {
        const ca = a.createdAt ?? a.fecha ?? '';
        const cb = b.createdAt ?? b.fecha ?? '';
        return cb.localeCompare(ca);
      });

      setEmpresas(data.companies ?? []);
      setContactos(data.contacts ?? []);
      setActividades(sortedActividades);
    } finally {
      setLoading(false);
    }
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

  const loadSuggestedCompanies = useCallback(async () => {
    if (!userId || empresas.length === 0) return;
    setSuggestedLoading(true);
    try {
      const alreadyInPipeline = empresas.map(e => e.name).join(',');
      const res = await fetch(
        `${BASE}/api/suggested-companies?userId=${encodeURIComponent(userId)}&alreadyInPipeline=${encodeURIComponent(alreadyInPipeline)}`
      ).then(r => r.json());
      if (Array.isArray(res?.suggestions)) setSuggestedCompanies(res.suggestions.slice(0, 4));
      else if (Array.isArray(res)) setSuggestedCompanies(res.slice(0, 4));
    } catch { /* silent */ } finally { setSuggestedLoading(false); }
  }, [userId, empresas]);

  useEffect(() => { loadData(); loadInsight(); }, [loadData, loadInsight]);
  useEffect(() => { if (!loading) loadSuggestedCompanies(); }, [loading, loadSuggestedCompanies]);

  const isBizUser = ['emprendedor', 'freelancer', 'empresa'].includes(profileData?.stage ?? '');

  const focus = useMemo(() => {
    if (loading) return null;
    return getDailyFocus(empresas, contactos, actividades, profileData);
  }, [loading, empresas, contactos, actividades, profileData]);

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const actividadesSemana = actividades.filter(a => a.fecha >= sevenDaysAgo).length;
  const tasaRespuesta = actividades.length > 0
    ? Math.round((actividades.filter(a => a.respuesta).length / actividades.length) * 100)
    : 0;
  const contactosGanados = contactos.filter(c => c.stage === 'nuevo_cliente').length;

  const heroGradient = insight?.gradient
    ? getGradientStyle(insight.gradient)
    : focus
    ? getGradientStyle(focus.gradient)
    : 'from-[#00A86B] to-[#1BCDD1]';

  function getActionHref(action: FocusAction): string {
    if (action.action === 'go_empleos') return '/empleos';
    if (action.action === 'go_marca') return '/marca';
    const params = new URLSearchParams();
    if (action.contactoId) { params.set('tab', 'contactos'); params.set('contactoId', action.contactoId); }
    else if (action.empresaId) { params.set('tab', 'empresas'); params.set('empresaId', action.empresaId); }
    const qs = params.toString();
    return qs ? `/crm?${qs}` : '/crm';
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl mx-auto space-y-8">

        {/* Hero banner */}
        <div className={`bg-gradient-to-r ${heroGradient} rounded-2xl p-7 text-white shadow-sm`}>
          <p className="text-sm font-medium opacity-80 mb-1">{saludo}{name ? `, ${name}` : ''} 👋</p>
          {insightLoading ? (
            <div className="flex items-center gap-2 mt-1">
              <Loader2 className="w-4 h-4 animate-spin opacity-70" />
              <span className="text-sm opacity-70">Analizando tu actividad...</span>
            </div>
          ) : insight?.tip ? (
            <p className="text-base leading-relaxed mt-1">{insight.tip}</p>
          ) : focus ? (
            <>
              <h2 className="text-2xl font-bold mt-1">{focus.title}</h2>
              <p className="text-sm opacity-85 mt-1">{focus.subtitle}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold mt-1">
                {isBizUser ? '¿A qué prospecto contactás hoy?' : '¿A qué empresa te postulás hoy?'}
              </h2>
              <p className="text-sm opacity-85 mt-1">Cada acción cuenta. Empezá por algo pequeño.</p>
            </>
          )}
        </div>

        {/* Weekly stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl p-5 h-20 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatBox icon={<Activity className="w-5 h-5 text-[#00A86B]" />} label="Actividades esta semana" value={actividadesSemana} />
            <StatBox icon={<TrendingUp className="w-5 h-5 text-[#1BCDD1]" />} label="Tasa de respuesta" value={`${tasaRespuesta}%`} />
            <StatBox icon={<Users className="w-5 h-5 text-[#00A86B]" />} label={isBizUser ? 'Clientes ganados' : 'Ofertas recibidas'} value={contactosGanados} />
          </div>
        )}

        {/* TUS ACCIONES DE HOY */}
        <div>
          <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-4">
            Tus acciones de hoy
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-16 animate-pulse" />)}
            </div>
          ) : focus ? (
            <div className="space-y-3">
              {focus.actions.map((action, i) => (
                <Link
                  key={i}
                  href={getActionHref(action)}
                  className={`flex items-center gap-4 rounded-2xl p-4 transition-all hover:shadow-sm ${TAG_STYLES[action.tag]}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[#2D3748]">
                    {ICON_MAP[action.icon] ?? <Zap className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2D3748] truncate">{action.label}</p>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex-shrink-0 ${TAG_BADGE[action.tag]}`}>
                    {action.tag}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#718096] flex-shrink-0" />
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {/* TU PROGRESO */}
        {!loading && (
          <div>
            <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider mb-4">Tu progreso</h3>
            <div className="grid grid-cols-3 gap-4">
              <Link href="/crm" className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-shadow block">
                <Building2 className="w-5 h-5 text-[#00A86B] mb-3" />
                <p className="text-2xl font-bold text-[#2D3748]">{empresas.length}</p>
                <p className="text-xs text-[#718096] mt-1">{isBizUser ? 'Prospectos' : 'Empresas'}</p>
              </Link>
              <Link href="/crm" className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-shadow block">
                <Users className="w-5 h-5 text-[#1BCDD1] mb-3" />
                <p className="text-2xl font-bold text-[#2D3748]">{contactos.length}</p>
                <p className="text-xs text-[#718096] mt-1">Contactos</p>
              </Link>
              <Link href="/crm" className="bg-white rounded-2xl p-5 border border-[#E2E8F0] hover:shadow-sm transition-shadow block">
                <Activity className="w-5 h-5 text-[#00A86B] mb-3" />
                <p className="text-2xl font-bold text-[#2D3748]">{actividades.length}</p>
                <p className="text-xs text-[#718096] mt-1">Actividades totales</p>
              </Link>
            </div>
          </div>
        )}

        {/* EMPRESAS SUGERIDAS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-[#718096] uppercase tracking-wider">
              {isBizUser ? 'Prospectos sugeridos para vos' : 'Empresas sugeridas para vos'}
            </h3>
            {suggestedLoading && <Loader2 className="w-4 h-4 animate-spin text-[#718096]" />}
          </div>
          {suggestedCompanies.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {suggestedCompanies.map((company, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-[#E2E8F0] flex items-start gap-3 hover:shadow-sm transition-shadow">
                  {company.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={company.logo_url} alt={company.name} className="w-10 h-10 rounded-xl object-contain border border-[#E2E8F0] flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#F2F4F7] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-[#718096]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2D3748] truncate">{company.name}</p>
                    {company.industry && <p className="text-xs text-[#718096] truncate">{company.industry}</p>}
                    {company.reason && <p className="text-xs text-[#00A86B] mt-1 line-clamp-2">{company.reason}</p>}
                  </div>
                  <Link href="/crm" className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[#F2F4F7] transition-colors">
                    <ChevronRight className="w-4 h-4 text-[#718096]" />
                  </Link>
                </div>
              ))}
            </div>
          ) : !suggestedLoading && !loading ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] text-center">
              <AlertCircle className="w-8 h-8 text-[#CBD5E0] mx-auto mb-2" />
              <p className="text-sm text-[#718096]">
                {empresas.length === 0
                  ? 'Agregá empresas a tu CRM para recibir sugerencias personalizadas'
                  : 'No hay sugerencias disponibles por ahora'}
              </p>
              {empresas.length === 0 && (
                <Link href="/crm" className="inline-flex items-center gap-1 mt-3 text-xs font-medium text-[#00A86B] hover:underline">
                  Ir al CRM <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              sessionStorage.removeItem('pirai_daily_insight');
              loadData();
              loadInsight();
            }}
            className="flex items-center gap-2 text-xs text-[#718096] hover:text-[#2D3748] transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Actualizar
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0]">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <p className="text-xs text-[#718096]">{label}</p>
      </div>
      <p className="text-2xl font-bold text-[#2D3748]">{value}</p>
    </div>
  );
}
