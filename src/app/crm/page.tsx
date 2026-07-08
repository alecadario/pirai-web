'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getUserId } from '@/lib/auth';
import {
  Loader2, Building2, Users, Calendar, Plus, Search,
  ChevronRight, ExternalLink, Mail, Link2, X, Phone,
  Pencil, Trash2, CheckCircle, Activity, ChevronDown,
  MessageSquare, Send, Inbox, Copy, UserPlus, Zap, Sparkles,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Empresa {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  priority?: string;
  country?: string;
  city?: string;
  logo_url?: string;
  website?: string;
  notes?: string;
  objetivo?: string;
  numContactos?: number;
  numActividades?: number;
  ultimaActividad?: string;
}

interface Contacto {
  id: string;
  name: string;
  title?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  empresaId?: string | null;
  empresaNombre?: string;
  stage?: string;
  notes?: string;
  eventSource?: string;
}

interface Evento {
  id: string;
  name: string;
  date?: string;
  end_date?: string;
  time?: string;
  duration?: number;
  type?: string;
  city?: string;
  country?: string;
  location?: string;
  details?: string;
  contactGoal?: number;
  contactsMet?: number;
}

interface Actividad {
  id: string;
  tipo: string;
  fecha: string;
  notas?: string;
  respuesta?: boolean;
  empresaId?: string | null;
  empresaNombre?: string;
  contactoId?: string | null;
  contactoNombre?: string;
  createdAt?: string;
}

type Tab = 'empresas' | 'contactos' | 'networking';
type EventFilter = 'todos' | 'hoy' | 'proximos' | 'pasados';
type EmpresaFilter = 'todas' | 'activas' | 'sin_prospectar' | 'descartadas';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  investigando: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  'en conversación': 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]',
  'sin respuesta': 'bg-gray-100 text-gray-500',
  descartado: 'bg-red-100 text-red-500',
  entrevista: 'bg-purple-100 text-purple-700',
  oferta: 'bg-orange-100 text-orange-700',
  cliente: 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]',
};

const PRIORITY_COLORS: Record<string, string> = {
  alta: 'bg-red-100 text-red-700',
  media: 'bg-yellow-100 text-yellow-700',
  baja: 'bg-gray-100 text-gray-500',
};

const STAGE_LABELS: Record<string, string> = {
  nuevo: 'Nuevo',
  sin_contactar: 'Sin contactar',
  primer_contacto: 'Contactado',
  seguimiento: 'Seguimiento',
  respuesta_recibida: 'Respuesta recibida',
  en_conversacion: 'En conv.',
  'en conversación': 'En conv.',
  oferta: 'Oferta',
  nuevo_cliente: 'Contratado',
  descartado: 'No avanzó',
  entrevista: 'Entrevista',
};

const ACTIVITY_EMOJIS: Record<string, string> = {
  postulacion: '📝',
  mensaje_linkedin: '💼',
  email: '📧',
  whatsapp: '💬',
  llamada: '📞',
  seguimiento: '🔄',
  networking: '👥',
  entrevista: '🎤',
  demo: '🎯',
  propuesta: '📋',
  otro: '📌',
};

const ACTIVITY_LABELS: Record<string, string> = {
  postulacion: 'Postulación',
  mensaje_linkedin: 'LinkedIn',
  email: 'Email',
  whatsapp: 'WhatsApp',
  llamada: 'Llamada',
  seguimiento: 'Seguimiento',
  networking: 'Networking',
  entrevista: 'Entrevista',
  demo: 'Demo',
  propuesta: 'Propuesta',
  otro: 'Otro',
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  conferencia: 'Presencial',
  meetup: 'Presencial',
  feria: 'Presencial',
  workshop: 'Workshop',
  otro: 'Otro',
};

const EMPRESA_GROUPS = [
  { key: 'clientes', label: '🏆 Clientes', statuses: ['oferta', 'cliente', 'nuevo_cliente'] },
  { key: 'entrevista', label: '🎯 En entrevista / reunión', statuses: ['entrevista'] },
  { key: 'activas', label: '💬 Activas', statuses: ['contactado', 'en conversación', 'en_conversacion'] },
  { key: 'investigando', label: '🔍 Sin prospectar', statuses: ['investigando'] },
  { key: 'descartadas', label: '❌ Descartadas', statuses: ['descartado', 'sin respuesta', 'sin_respuesta'] },
];

// ─── Page entry with Suspense ─────────────────────────────────────────────────

export default function CRMPage() {
  return <Suspense><CRMPageInner /></Suspense>;
}

// ─── Main component ───────────────────────────────────────────────────────────

function CRMPageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get('tab');
    return (t === 'contactos' || t === 'networking') ? t : 'empresas';
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Empresa | Contacto | null>(null);
  const [empresaFilter, setEmpresaFilter] = useState<EmpresaFilter>('todas');
  const [eventFilter, setEventFilter] = useState<EventFilter>('todos');
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null);
  const [userName, setUserName] = useState('');
  const [userStage, setUserStage] = useState('');
  const [showNewEmpresa, setShowNewEmpresa] = useState(false);
  const [showNewContacto, setShowNewContacto] = useState(false);
  const [newEmpresaForm, setNewEmpresaForm] = useState({ name: '', industry: '', website: '', country: '', city: '', priority: 'media', status: 'investigando', objetivo: '' });
  const [newContactoForm, setNewContactoForm] = useState({ name: '', title: '', email: '', phone: '', linkedin_url: '', stage: 'sin_contactar', empresa_id: '', language: 'es' });
  const [inlineEmpresa, setInlineEmpresa] = useState({ name: '', industry: '' });
  const [savingNew, setSavingNew] = useState(false);
  const userId = getUserId();
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      let diagnosis = '';
      let stage = '';
      try {
        const ur = await fetch(`/api/user-record?userId=${encodeURIComponent(userId)}`).then(r => r.json());
        const fields = ur?.record?.fields ?? {};
        if (fields.name) setUserName(fields.name);
        else if (fields.full_name) setUserName(fields.full_name);
        if (fields.onboarding_answers) {
          const a = JSON.parse(fields.onboarding_answers);
          diagnosis = a.diagnosis ?? '';
          stage = a.stage ?? '';
          if (stage) setUserStage(stage);
          if (!fields.name && a.name) setUserName(a.name);
        }
      } catch {}
      const res = await fetch(
        `/api/bootstrap?userId=${encodeURIComponent(userId)}&diagnosis=${encodeURIComponent(diagnosis)}&stage=${encodeURIComponent(stage)}`
      ).then(r => r.json());
      setEmpresas(res.companies ?? []);
      setContactos(res.contacts ?? []);
      setEventos((res.events ?? []).sort((a: Evento, b: Evento) => (a.date || '').localeCompare(b.date || '')));
      setActividades(res.activities ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId, BASE]);

  useEffect(() => { load(); }, [load]);

  // Auto-select item from URL params after data loads
  useEffect(() => {
    if (loading) return;
    const empresaId = searchParams.get('empresaId');
    const contactoId = searchParams.get('contactoId');
    if (empresaId) {
      const emp = empresas.find(e => e.id === empresaId);
      if (emp) { setTab('empresas'); setSelected(emp); }
    } else if (contactoId) {
      const c = contactos.find(c => c.id === contactoId);
      if (c) { setTab('contactos'); setSelected(c); }
    }
  }, [loading, empresas, contactos, searchParams]);

  const TABS = [
    { id: 'empresas' as Tab, label: 'Empresas', icon: Building2, count: empresas.length },
    { id: 'contactos' as Tab, label: 'Contactos', icon: Users, count: contactos.length },
    { id: 'networking' as Tab, label: 'Eventos', icon: Calendar, count: eventos.length },
  ];

  const alpha = (a: string, b: string) => (a || '').localeCompare(b || '', 'es', { sensitivity: 'base' });

  // ── Empresa list logic ──
  const filteredEmpresas = [...empresas]
    .filter(e => !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.industry?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => alpha(a.name, b.name));

  const applyEmpresaFilter = (list: Empresa[]) => {
    if (empresaFilter === 'activas') return list.filter(e => ['contactado', 'en conversación', 'entrevista'].includes(e.status ?? '') || (e.status === 'investigando' && (e.numActividades ?? 0) > 0));
    if (empresaFilter === 'sin_prospectar') return list.filter(e => e.status === 'investigando' && (e.numActividades ?? 0) === 0);
    if (empresaFilter === 'descartadas') return list.filter(e => ['descartado', 'sin respuesta'].includes(e.status ?? ''));
    return list;
  };

  const displayedEmpresas = applyEmpresaFilter(filteredEmpresas);

  const empresaGroups = search
    ? [{ key: 'all', label: '', empresas: displayedEmpresas }]
    : EMPRESA_GROUPS.map(g => ({
        key: g.key,
        label: g.label,
        empresas: displayedEmpresas.filter(e => g.statuses.includes(e.status ?? '')),
      })).filter(g => g.empresas.length > 0);

  // ── Contacto list logic ──
  const CONTACTED_STAGES = new Set(['primer_contacto', 'seguimiento', 'respuesta_recibida', 'en_conversacion', 'en conversación', 'entrevista', 'oferta', 'nuevo_cliente']);

  const filteredContactos = [...contactos]
    .filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.empresaNombre?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => alpha(a.name, b.name));

  const contactoGroups = search
    ? [{ key: 'all', label: '', contactos: filteredContactos }]
    : [
        { key: 'contactados', label: '✉️ Contactados', contactos: filteredContactos.filter(c => CONTACTED_STAGES.has(c.stage ?? '')) },
        { key: 'sin_contactar', label: '👤 Sin contactar', contactos: filteredContactos.filter(c => !CONTACTED_STAGES.has(c.stage ?? '')) },
      ].filter(g => g.contactos.length > 0);

  // ── Networking coach tip ──
  const getNetworkingCoachTip = () => {
    if (eventos.length === 0) return { icon: '🤝', text: 'El networking intencional acelera todo. Agregá un evento al que vayas a ir y ponete una meta de contactos.' };
    const totalGoal = eventos.reduce((s, e) => s + (e.contactGoal || 0), 0);
    const totalMet = eventos.reduce((s, e) => s + (e.contactsMet || 0), 0);
    const eventContacts = contactos.filter(c => c.eventSource);
    const sinSeguimiento = eventContacts.filter(c => actividades.filter(a => a.contactoId === c.id).length === 0);
    if (sinSeguimiento.length > 0) return { icon: '📩', text: `Tenés ${sinSeguimiento.length} contacto${sinSeguimiento.length > 1 ? 's' : ''} de eventos sin seguimiento. El networking no sirve si no hacés follow-up.` };
    if (totalGoal > 0 && totalMet < totalGoal * 0.5) return { icon: '🎯', text: `Vas por ${totalMet} de ${totalGoal} contactos meta. Animate a hablar con más personas en tus próximos eventos.` };
    const today = new Date().toISOString().split('T')[0];
    const conEntrevista = empresas.filter(e => e.status === 'entrevista');
    if (conEntrevista.length > 0) return { icon: '🔥', text: `Tenés ${conEntrevista.length} empresa${conEntrevista.length > 1 ? 's' : ''} en entrevista. Enfocá tu energía ahí.` };
    return { icon: '✨', text: 'Buen trabajo conectando. Revisá si podés convertir algún contacto de evento en una oportunidad real.' };
  };

  const handleCreateEmpresa = async () => {
    if (!newEmpresaForm.name.trim()) return;
    setSavingNew(true);
    try {
      const res = await fetch(`/api/crm/empresa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...newEmpresaForm }),
      });
      if (res.ok) {
        setShowNewEmpresa(false);
        setNewEmpresaForm({ name: '', industry: '', website: '', country: '', city: '', priority: 'media', status: 'investigando', objetivo: '' });
        load();
      }
    } finally { setSavingNew(false); }
  };

  const handleCreateContacto = async () => {
    if (!newContactoForm.name.trim()) return;
    setSavingNew(true);
    try {
      let empresaId = newContactoForm.empresa_id;
      if (empresaId === '__new__') {
        if (!inlineEmpresa.name.trim()) { alert('Escribí el nombre de la empresa'); setSavingNew(false); return; }
        const er = await fetch(`/api/crm/empresa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: inlineEmpresa.name, industry: inlineEmpresa.industry, priority: 'media', status: 'investigando' }) });
        const ed = await er.json();
        empresaId = ed.id || ed.empresa?.id || '';
        setInlineEmpresa({ name: '', industry: '' });
      }
      const res = await fetch(`/api/crm/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newContactoForm.name, title: newContactoForm.title, email: newContactoForm.email, phone: newContactoForm.phone, linkedinUrl: newContactoForm.linkedin_url, stage: newContactoForm.stage, empresaId, language: newContactoForm.language }),
      });
      if (res.ok) {
        setShowNewContacto(false);
        setNewContactoForm({ name: '', title: '', email: '', phone: '', linkedin_url: '', stage: 'sin_contactar', empresa_id: '', language: 'es' });
        load();
      }
    } finally { setSavingNew(false); }
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-screen">
        {/* ── Left panel ── */}
        <div className="flex-1 flex flex-col border-r border-[var(--color-brand-border)]">
          {/* Header */}
          <div className="bg-white border-b border-[var(--color-brand-border)] px-6 pt-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">CRM</h1>
              <div className="flex gap-2">
                <button onClick={() => setShowNewEmpresa(true)} className="flex items-center gap-1.5 bg-[var(--color-pirai-500)] text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-[var(--color-pirai-600)] transition-colors">
                  <Plus className="w-4 h-4" /> Empresa
                </button>
                <button onClick={() => setShowNewContacto(true)} className="flex items-center gap-1.5 bg-white text-[var(--color-pirai-600)] text-sm font-semibold px-3 py-2 rounded-xl border border-[var(--color-pirai-300)] hover:bg-[var(--color-pirai-50)] transition-colors">
                  <Plus className="w-4 h-4" /> Contacto
                </button>
              </div>
            </div>

            {/* Search */}
            {tab !== 'networking' && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-[var(--color-brand-gray)]"
                />
                {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
              </div>
            )}

            {/* Empresa filter chips — hide when searching */}
            {tab === 'empresas' && !search && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {([
                  { key: 'todas', label: 'Todas', count: empresas.length },
                  { key: 'activas', label: 'Activas', count: empresas.filter(e => ['contactado', 'en conversación', 'entrevista'].includes(e.status ?? '') || (e.status === 'investigando' && (e.numActividades ?? 0) > 0)).length },
                  { key: 'sin_prospectar', label: 'Sin prospectar', count: empresas.filter(e => e.status === 'investigando' && (e.numActividades ?? 0) === 0).length },
                  { key: 'descartadas', label: 'Descartadas', count: empresas.filter(e => ['descartado', 'sin respuesta'].includes(e.status ?? '')).length },
                ] as { key: EmpresaFilter; label: string; count: number }[])
                  .filter(f => f.key === 'todas' || f.count > 0)
                  .map(f => (
                    <button
                      key={f.key}
                      onClick={() => setEmpresaFilter(f.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        empresaFilter === f.key
                          ? 'bg-[var(--color-pirai-500)] text-white'
                          : 'bg-[var(--color-brand-gray)] text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setSelected(null); setSelectedEvent(null); setSearch(''); }}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-colors ${
                    tab === id
                      ? 'text-[var(--color-pirai-600)] border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)]'
                      : 'text-gray-400 border-transparent hover:text-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[var(--color-pirai-500)]" /></div>
            ) : tab === 'empresas' ? (
              displayedEmpresas.length === 0 ? (
                <EmptyState label="Sin empresas aún" sub="Agregá la primera empresa a tu pipeline." />
              ) : (
                <div className="space-y-6">
                  {empresaGroups.map(group => (
                    <div key={group.key}>
                      {group.label && (
                        <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-2 px-1">{group.label}</p>
                      )}
                      <div className="space-y-2">
                        {group.empresas.map(emp => (
                          <EmpresaRow key={emp.id} emp={emp} active={(selected as Empresa)?.id === emp.id} onClick={() => setSelected(emp)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : tab === 'contactos' ? (
              filteredContactos.length === 0 ? (
                <EmptyState label="Sin contactos aún" sub="Agregá contactos para hacer seguimiento." />
              ) : (
                <div className="space-y-6">
                  {contactoGroups.map(group => (
                    <div key={group.key}>
                      {group.label && (
                        <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-2 px-1">{group.label}</p>
                      )}
                      <div className="space-y-2">
                        {group.contactos.map(c => (
                          <ContactoRow key={c.id} c={c} active={(selected as Contacto)?.id === c.id} onClick={() => setSelected(c)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              /* ── Networking / Eventos tab ── */
              <EventosPanel
                eventos={eventos}
                contactos={contactos}
                actividades={actividades}
                empresas={empresas}
                eventFilter={eventFilter}
                setEventFilter={setEventFilter}
                coachTip={getNetworkingCoachTip()}
                BASE={BASE}
                userId={userId ?? ''}
                selectedEvent={selectedEvent}
                onSelectEvent={setSelectedEvent}
                onDeleteEvento={(id) => { setEventos(prev => prev.filter(e => e.id !== id)); if (selectedEvent?.id === id) setSelectedEvent(null); }}
                onContactAdded={load}
                onEventAdded={load}
              />
            )}
          </div>
        </div>

        {/* ── Detail panel ── */}
        <div className="w-[420px] bg-white overflow-auto border-l border-[var(--color-brand-border)]">
          {tab === 'networking' && selectedEvent ? (
            <div key={selectedEvent.id} className="h-full overflow-auto p-4">
              <EventoDetail
                event={selectedEvent}
                contactos={contactos}
                empresas={empresas}
                BASE={BASE}
                userId={userId ?? ''}
                onClose={() => setSelectedEvent(null)}
                onContactAdded={load}
                onEventUpdated={(updated) => {
                  setEventos(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
                  setSelectedEvent(updated);
                }}
                onEventDeleted={(id) => { setEventos(prev => prev.filter(e => e.id !== id)); setSelectedEvent(null); }}
              />
            </div>
          ) : selected ? (
            <div key={(selected as Empresa | Contacto).id} className="h-full overflow-auto">
            {tab === 'empresas' ? (
              <EmpresaDetail
                emp={selected as Empresa}
                contactos={contactos}
                actividades={actividades}
                BASE={BASE}
                userId={userId ?? ''}
                onClose={() => setSelected(null)}
                onUpdate={(updated) => {
                  setEmpresas(prev => prev.map(e => e.id === updated.id ? { ...e, ...updated } : e));
                  setSelected(updated);
                }}
                onDelete={(id) => { setEmpresas(prev => prev.filter(e => e.id !== id)); setSelected(null); }}
                onSelectContact={(c) => { setTab('contactos'); setSelected(c); }}
              />
            ) : tab === 'contactos' ? (
              <ContactoDetail
                c={selected as Contacto}
                empresas={empresas}
                actividades={actividades}
                BASE={BASE}
                userId={userId ?? ''}
                userName={userName}
                userStage={userStage}
                onClose={() => setSelected(null)}
                onUpdate={(updated) => {
                  setContactos(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
                  setSelected(updated);
                }}
                onDelete={(id) => { setContactos(prev => prev.filter(c => c.id !== id)); setSelected(null); }}
              />
            ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-brand-muted)] text-sm p-8 text-center">
              Seleccioná un elemento para ver sus detalles
            </div>
          )}
        </div>
      </div>

      {/* ── Modal: Nueva empresa ── */}
      {showNewEmpresa && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">Nueva empresa</h3>
              <button onClick={() => setShowNewEmpresa(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {/* CSV import */}
            <div className="flex items-center gap-2 bg-[var(--color-brand-gray)] rounded-xl px-3 py-2.5 border border-dashed border-gray-300">
              <div className="flex-1 text-xs text-gray-500">Importar desde CSV</div>
              <button
                onClick={() => { const csv = 'name,industry,website,country,city,priority,status,objetivo\nAcme Inc,Tecnología,acme.com,Argentina,Buenos Aires,alta,investigando,Conseguir entrevista'; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'template_empresas.csv'; a.click(); }}
                className="text-[10px] font-semibold text-[var(--color-pirai-600)] hover:underline whitespace-nowrap"
              >↓ Descargar template</button>
              <label className="cursor-pointer text-[10px] font-semibold bg-[var(--color-pirai-500)] text-white px-2 py-1 rounded-lg hover:bg-[var(--color-pirai-600)] transition-colors whitespace-nowrap">
                Subir CSV
                <input type="file" accept=".csv" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const text = await file.text();
                  const lines = text.trim().split('\n').filter(Boolean);
                  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                  const rows = lines.slice(1);
                  setSavingNew(true);
                  for (const row of rows) {
                    const vals = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj: Record<string, string> = {};
                    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
                    if (!obj.name) continue;
                    await fetch(`/api/crm/empresa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: obj.name, industry: obj.industry, website: obj.website, country: obj.country, city: obj.city, priority: obj.priority || 'media', status: obj.status || 'investigando', objetivo: obj.objetivo }) }).catch(() => {});
                  }
                  setSavingNew(false);
                  setShowNewEmpresa(false);
                  load();
                  e.target.value = '';
                }} />
              </label>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><div className="flex-1 h-px bg-gray-200" />o completá el formulario<div className="flex-1 h-px bg-gray-200" /></div>
            <input value={newEmpresaForm.name} onChange={e => setNewEmpresaForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <input value={newEmpresaForm.industry} onChange={e => setNewEmpresaForm(p => ({ ...p, industry: e.target.value }))} placeholder="Industria" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <input value={newEmpresaForm.website} onChange={e => setNewEmpresaForm(p => ({ ...p, website: e.target.value }))} placeholder="Sitio web" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <div className="grid grid-cols-2 gap-2">
              <input value={newEmpresaForm.country} onChange={e => setNewEmpresaForm(p => ({ ...p, country: e.target.value }))} placeholder="País" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <input value={newEmpresaForm.city} onChange={e => setNewEmpresaForm(p => ({ ...p, city: e.target.value }))} placeholder="Ciudad" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            </div>
            <select value={newEmpresaForm.priority} onChange={e => setNewEmpresaForm(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="alta">Prioridad: Alta</option>
              <option value="media">Prioridad: Media</option>
              <option value="baja">Prioridad: Baja</option>
            </select>
            <select value={newEmpresaForm.status} onChange={e => setNewEmpresaForm(p => ({ ...p, status: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea value={newEmpresaForm.objetivo} onChange={e => setNewEmpresaForm(p => ({ ...p, objetivo: e.target.value }))} placeholder="¿Cuál es tu objetivo con esta empresa?" rows={3} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowNewEmpresa(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleCreateEmpresa} disabled={savingNew || !newEmpresaForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingNew ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Nuevo contacto ── */}
      {showNewContacto && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">Nuevo contacto</h3>
              <button onClick={() => setShowNewContacto(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            {/* CSV import */}
            <div className="flex items-center gap-2 bg-[var(--color-brand-gray)] rounded-xl px-3 py-2.5 border border-dashed border-gray-300">
              <div className="flex-1 text-xs text-gray-500">Importar desde CSV</div>
              <button
                onClick={() => { const csv = 'name,title,email,phone,linkedin_url,stage,language\nJuan Pérez,Product Manager,juan@acme.com,+54911234567,https://linkedin.com/in/juanperez,sin_contactar,es'; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'template_contactos.csv'; a.click(); }}
                className="text-[10px] font-semibold text-[var(--color-pirai-600)] hover:underline whitespace-nowrap"
              >↓ Descargar template</button>
              <label className="cursor-pointer text-[10px] font-semibold bg-[var(--color-pirai-500)] text-white px-2 py-1 rounded-lg hover:bg-[var(--color-pirai-600)] transition-colors whitespace-nowrap">
                Subir CSV
                <input type="file" accept=".csv" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return;
                  const text = await file.text();
                  const lines = text.trim().split('\n').filter(Boolean);
                  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                  const rows = lines.slice(1);
                  setSavingNew(true);
                  for (const row of rows) {
                    const vals = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
                    const obj: Record<string, string> = {};
                    headers.forEach((h, i) => { obj[h] = vals[i] ?? ''; });
                    if (!obj.name) continue;
                    await fetch(`/api/crm/contacto`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: obj.name, title: obj.title, email: obj.email, phone: obj.phone, linkedinUrl: obj.linkedin_url, stage: obj.stage || 'sin_contactar', language: obj.language || 'es' }) }).catch(() => {});
                  }
                  setSavingNew(false);
                  setShowNewContacto(false);
                  load();
                  e.target.value = '';
                }} />
              </label>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><div className="flex-1 h-px bg-gray-200" />o completá el formulario<div className="flex-1 h-px bg-gray-200" /></div>
            <input value={newContactoForm.name} onChange={e => setNewContactoForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <input value={newContactoForm.title} onChange={e => setNewContactoForm(p => ({ ...p, title: e.target.value }))} placeholder="Cargo" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <input type="email" value={newContactoForm.email} onChange={e => setNewContactoForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            {newContactoForm.email && contactos.some(c => c.email?.toLowerCase() === newContactoForm.email.toLowerCase()) && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">⚠️ Ya tenés un contacto con ese email.</p>
            )}
            <input type="tel" value={newContactoForm.phone} onChange={e => setNewContactoForm(p => ({ ...p, phone: e.target.value }))} placeholder="Teléfono" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <input value={newContactoForm.linkedin_url} onChange={e => setNewContactoForm(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="LinkedIn URL" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <select value={newContactoForm.language} onChange={e => setNewContactoForm(p => ({ ...p, language: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="es">Idioma: Español</option>
              <option value="en">Idioma: Inglés</option>
              <option value="pt">Idioma: Portugués</option>
              <option value="fr">Idioma: Francés</option>
              <option value="ar">Idioma: Árabe</option>
              <option value="de">Idioma: Alemán</option>
              <option value="it">Idioma: Italiano</option>
            </select>
            <select value={newContactoForm.empresa_id} onChange={e => { setNewContactoForm(p => ({ ...p, empresa_id: e.target.value })); if (e.target.value !== '__new__') setInlineEmpresa({ name: '', industry: '' }); }} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="">Sin empresa</option>
              <option value="__new__">＋ Crear nueva empresa</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {newContactoForm.empresa_id === '__new__' && (
              <div className="bg-[var(--color-brand-gray)] rounded-xl p-3 space-y-2 border border-dashed border-gray-300">
                <p className="text-xs font-medium text-gray-500">Nueva empresa</p>
                <input value={inlineEmpresa.name} onChange={e => setInlineEmpresa(p => ({ ...p, name: e.target.value }))} placeholder="Nombre de la empresa *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
                <input value={inlineEmpresa.industry} onChange={e => setInlineEmpresa(p => ({ ...p, industry: e.target.value }))} placeholder="Industria" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
            )}
            <select value={newContactoForm.stage} onChange={e => setNewContactoForm(p => ({ ...p, stage: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              {Object.entries(STAGE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowNewContacto(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleCreateContacto} disabled={savingNew || !newContactoForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingNew ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ─── Eventos Panel ────────────────────────────────────────────────────────────

function buildGoogleCalendarUrl(event: Evento): string {
  const params = new URLSearchParams();
  params.set('action', 'TEMPLATE');
  params.set('text', event.name || 'Evento de networking');
  const durationHours = parseFloat(String(event.duration ?? 2)) || 2;
  if (event.date) {
    if (event.time) {
      const d = event.date.replace(/-/g, '');
      const t = event.time.replace(/:/g, '') + '00';
      const startDt = new Date(`${event.date}T${event.time}:00`);
      const endDt = new Date(startDt.getTime() + durationHours * 3600000);
      const endD = endDt.toISOString().split('T')[0].replace(/-/g, '');
      const endT = endDt.toTimeString().slice(0, 5).replace(/:/g, '') + '00';
      params.set('dates', `${d}T${t}/${endD}T${endT}`);
    } else {
      const d = event.date.replace(/-/g, '');
      const endDateStr = event.end_date && event.end_date !== event.date ? event.end_date : event.date;
      const nextDay = new Date(endDateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      const nd = nextDay.toISOString().split('T')[0].replace(/-/g, '');
      params.set('dates', `${d}/${nd}`);
    }
  }
  const locationStr = [event.location, event.city, event.country].filter(Boolean).join(', ');
  if (locationStr) params.set('location', locationStr);
  if (event.details) params.set('details', event.details);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

const EVENT_FORM_EMPTY = { name: '', date: '', time: '', duration: '2', end_date: '', type: 'presencial', contactGoal: '5', country: '', city: '', location: '', details: '' };

function EventosPanel({ eventos, contactos, actividades, empresas, eventFilter, setEventFilter, coachTip, BASE, userId, selectedEvent, onSelectEvent, onDeleteEvento, onContactAdded, onEventAdded }: {
  eventos: Evento[];
  contactos: Contacto[];
  actividades: Actividad[];
  empresas: Empresa[];
  eventFilter: EventFilter;
  setEventFilter: (f: EventFilter) => void;
  coachTip: { icon: string; text: string };
  BASE: string;
  userId: string;
  selectedEvent: Evento | null;
  onSelectEvent: (e: Evento | null) => void;
  onDeleteEvento: (id: string) => void;
  onContactAdded: () => void;
  onEventAdded: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [showNewContact, setShowNewContact] = useState(false);
  const [newContactEvent, setNewContactEvent] = useState<Evento | null>(null);
  const [newContactForm, setNewContactForm] = useState({ name: '', title: '', email: '', phone: '', linkedin_url: '', empresa_id: '' });
  const [inlineEmpresaContact, setInlineEmpresaContact] = useState({ name: '', industry: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [confirmDelEvento, setConfirmDelEvento] = useState<Evento | null>(null);
  const [deletingEvento, setDeletingEvento] = useState(false);
  const [showNewEvento, setShowNewEvento] = useState(false);
  const [showEditEvento, setShowEditEvento] = useState<Evento | null>(null);
  const [eventoForm, setEventoForm] = useState(EVENT_FORM_EMPTY);
  const [savingEvento, setSavingEvento] = useState(false);

  const totalGoal = eventos.reduce((s, e) => s + (e.contactGoal || 0), 0);
  const totalMet = eventos.reduce((s, e) => s + (e.contactsMet || 0), 0);
  const overallProgress = totalGoal > 0 ? Math.min(100, Math.round((totalMet / totalGoal) * 100)) : 0;

  const eventTabs = [
    { key: 'todos' as EventFilter, label: 'Todos', count: eventos.length },
    { key: 'hoy' as EventFilter, label: 'Hoy', count: eventos.filter(e => e.date === today).length },
    { key: 'proximos' as EventFilter, label: 'Próximos', count: eventos.filter(e => e.date && e.date > today).length },
    { key: 'pasados' as EventFilter, label: 'Pasados', count: eventos.filter(e => !e.date || e.date < today).length },
  ].filter(t => t.key === 'todos' || t.count > 0);

  let filtered = [...eventos];
  if (eventFilter === 'hoy') filtered = eventos.filter(e => e.date === today);
  else if (eventFilter === 'proximos') filtered = eventos.filter(e => e.date && e.date > today);
  else if (eventFilter === 'pasados') filtered = eventos.filter(e => !e.date || e.date < today);
  filtered.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  const handleSaveContact = async () => {
    if (!newContactForm.name.trim() || !newContactEvent) return;
    setSavingContact(true);
    try {
      let empresaId = newContactForm.empresa_id;
      if (empresaId === '__new__') {
        if (!inlineEmpresaContact.name.trim()) { alert('Escribí el nombre de la empresa'); setSavingContact(false); return; }
        const er = await fetch(`/api/crm/empresa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: inlineEmpresaContact.name, industry: inlineEmpresaContact.industry, priority: 'media', status: 'investigando' }) });
        const ed = await er.json();
        empresaId = ed.id || ed.empresa?.id || '';
        setInlineEmpresaContact({ name: '', industry: '' });
      }
      await fetch(`/api/crm/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: newContactForm.name.trim(),
          title: newContactForm.title.trim(),
          email: newContactForm.email.trim(),
          phone: newContactForm.phone.trim(),
          linkedinUrl: newContactForm.linkedin_url.trim(),
          stage: 'primer_contacto',
          eventSource: newContactEvent.name,
          empresaId: empresaId || undefined,
        }),
      });
      setShowNewContact(false);
      setNewContactForm({ name: '', title: '', email: '', phone: '', linkedin_url: '', empresa_id: '' });
      onContactAdded();
    } finally { setSavingContact(false); }
  };

  const handleDeleteEvento = async () => {
    if (!confirmDelEvento) return;
    setDeletingEvento(true);
    try {
      await fetch(`/api/events`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, eventId: confirmDelEvento.id }) });
      onDeleteEvento(confirmDelEvento.id);
      setConfirmDelEvento(null);
    } finally { setDeletingEvento(false); }
  };

  const handleSaveEvento = async () => {
    if (!eventoForm.name.trim()) return;
    setSavingEvento(true);
    try {
      if (showEditEvento) {
        await fetch(`/api/events`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId: showEditEvento.id, name: eventoForm.name, date: eventoForm.date, time: eventoForm.time, duration: parseFloat(eventoForm.duration) || 2, end_date: eventoForm.end_date, type: eventoForm.type, contactGoal: parseInt(eventoForm.contactGoal) || 0, country: eventoForm.country, city: eventoForm.city, location: eventoForm.location, details: eventoForm.details }),
        });
        setShowEditEvento(null);
        onEventAdded();
      } else {
        await fetch(`/api/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, name: eventoForm.name, date: eventoForm.date, time: eventoForm.time, duration: parseFloat(eventoForm.duration) || 2, end_date: eventoForm.end_date, type: eventoForm.type, contactGoal: parseInt(eventoForm.contactGoal) || 0, country: eventoForm.country, city: eventoForm.city, location: eventoForm.location, details: eventoForm.details }),
        });
        setShowNewEvento(false);
        onEventAdded();
      }
      setEventoForm(EVENT_FORM_EMPTY);
    } finally { setSavingEvento(false); }
  };

  // ── Event list view ──
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] rounded-2xl p-3 flex items-start gap-2.5 flex-1 mr-2">
          <span className="text-lg mt-0.5">{coachTip.icon}</span>
          <p className="text-sm text-[var(--color-pirai-800)] leading-relaxed">{coachTip.text}</p>
        </div>
        <button
          onClick={() => { setEventoForm(EVENT_FORM_EMPTY); setShowNewEvento(true); }}
          className="shrink-0 flex items-center gap-1.5 bg-[var(--color-pirai-500)] text-white text-sm font-semibold px-3 py-2 rounded-xl hover:bg-[var(--color-pirai-600)] transition-colors"
        >
          <Plus className="w-4 h-4" /> Evento
        </button>
      </div>

      {eventos.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[var(--color-brand-border)] shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Meta total de contactos</p>
            <p className="text-sm font-bold text-[var(--color-pirai-600)]">{totalMet} / {totalGoal}</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-[var(--color-pirai-500)] h-2.5 rounded-full transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{overallProgress}% completado</p>
        </div>
      )}

      {eventos.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {eventTabs.map(t => (
            <button key={t.key} onClick={() => setEventFilter(t.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${eventFilter === t.key ? 'bg-[var(--color-pirai-500)] text-white' : 'bg-[var(--color-brand-gray)] text-gray-600 hover:bg-gray-200'}`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      )}

      {eventos.length === 0 ? (
        <EmptyState label="Sin eventos aún" sub="Registrá eventos de networking para hacer seguimiento." />
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--color-brand-gray)] rounded-2xl p-6 text-center">
          <p className="text-sm text-gray-400">No hay eventos en este filtro.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(event => {
            const eventContacts = contactos.filter(c => c.eventSource === event.name);
            const progress = (event.contactGoal ?? 0) > 0
              ? Math.min(100, Math.round(((event.contactsMet ?? 0) / (event.contactGoal ?? 1)) * 100))
              : 0;
            const isComplete = (event.contactsMet ?? 0) >= (event.contactGoal ?? 1) && (event.contactGoal ?? 0) > 0;
            const typeLabel = EVENT_TYPE_LABELS[event.type ?? ''] || event.type || '';

            return (
              <div key={event.id} className="bg-white rounded-2xl p-4 border border-[var(--color-brand-border)] shadow-sm">
                {/* Clickable header → detail */}
                <button className="w-full text-left" onClick={() => onSelectEvent(event)}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-[var(--color-brand-dark)]">{event.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {event.date && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {event.date}
                            {event.end_date && event.end_date !== event.date ? ` → ${event.end_date}` : ''}
                            {event.time ? ` · ${event.time}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    {typeLabel && (
                      <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${event.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]'}`}>
                        {typeLabel}
                      </span>
                    )}
                  </div>
                  <div className="mb-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">
                        Contactos: {event.contactsMet ?? 0} / {event.contactGoal ?? 0}
                        {eventContacts.length > 0 && ` · ${eventContacts.length} registrados`}
                      </span>
                      {isComplete && (
                        <span className="text-xs text-[var(--color-pirai-600)] font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Meta cumplida
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-[var(--color-pirai-500)] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </button>

                {/* Action bar */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setNewContactEvent(event); setShowNewContact(true); }}
                      className="text-xs font-semibold text-[var(--color-pirai-600)] hover:text-[var(--color-pirai-700)] flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Conocí a alguien
                    </button>
                    <a
                      href={buildGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="text-xs font-semibold text-[var(--color-turquesa-500)] hover:text-[var(--color-turquesa-600)] flex items-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" /> Agendar
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => { e.stopPropagation(); setEventoForm({ name: event.name, date: event.date ?? '', time: event.time ?? '', duration: String(event.duration ?? 2), end_date: event.end_date ?? '', type: event.type ?? 'presencial', contactGoal: String(event.contactGoal ?? 5), country: event.country ?? '', city: event.city ?? '', location: event.location ?? '', details: event.details ?? '' }); setShowEditEvento(event); }}
                      className="text-gray-300 hover:text-[var(--color-pirai-500)] transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelEvento(event); }}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirm modal */}
      {confirmDelEvento && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="font-semibold text-[var(--color-brand-dark)] mb-2">¿Eliminar evento?</p>
            <p className="text-sm text-gray-500 mb-4">Se eliminará <strong>{confirmDelEvento.name}</strong>. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelEvento(null)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDeleteEvento} disabled={deletingEvento} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deletingEvento ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nuevo / Editar evento modal */}
      {(showNewEvento || showEditEvento) && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">{showEditEvento ? 'Editar evento' : 'Nuevo evento'}</h3>
              <button onClick={() => { setShowNewEvento(false); setShowEditEvento(null); setEventoForm(EVENT_FORM_EMPTY); }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input value={eventoForm.name} onChange={e => setEventoForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del evento *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Fecha inicio</label>
                <input type="date" value={eventoForm.date} onChange={e => setEventoForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Fecha fin</label>
                <input type="date" value={eventoForm.end_date} onChange={e => setEventoForm(p => ({ ...p, end_date: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Hora</label>
                <input type="time" value={eventoForm.time} onChange={e => setEventoForm(p => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Duración (hs)</label>
                <input type="number" min="0.5" step="0.5" value={eventoForm.duration} onChange={e => setEventoForm(p => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
            </div>
            <select value={eventoForm.type} onChange={e => setEventoForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrido">Híbrido</option>
              <option value="otro">Otro</option>
            </select>
            <div>
              <label className="text-[10px] text-gray-500 mb-1 block">Meta de contactos</label>
              <input type="number" min="0" value={eventoForm.contactGoal} onChange={e => setEventoForm(p => ({ ...p, contactGoal: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input value={eventoForm.country} onChange={e => setEventoForm(p => ({ ...p, country: e.target.value }))} placeholder="País" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <input value={eventoForm.city} onChange={e => setEventoForm(p => ({ ...p, city: e.target.value }))} placeholder="Ciudad" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            </div>
            <input value={eventoForm.location} onChange={e => setEventoForm(p => ({ ...p, location: e.target.value }))} placeholder="Lugar / dirección" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <textarea value={eventoForm.details} onChange={e => setEventoForm(p => ({ ...p, details: e.target.value }))} placeholder="Detalles adicionales" rows={3} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setShowNewEvento(false); setShowEditEvento(null); setEventoForm(EVENT_FORM_EMPTY); }} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveEvento} disabled={savingEvento || !eventoForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingEvento ? 'Guardando...' : showEditEvento ? 'Guardar cambios' : 'Crear evento'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New contact modal */}
      {showNewContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[var(--color-brand-dark)]">Conocí a alguien en {newContactEvent?.name}</p>
              <button onClick={() => setShowNewContact(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {(['name', 'title', 'email', 'phone', 'linkedin_url'] as const).map(field => (
              <input key={field} value={newContactForm[field]} onChange={e => setNewContactForm(p => ({ ...p, [field]: e.target.value }))}
                placeholder={{ name: 'Nombre *', title: 'Cargo', email: 'Email', phone: 'Teléfono', linkedin_url: 'LinkedIn URL' }[field]}
                className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
              />
            ))}
            <select value={newContactForm.empresa_id} onChange={e => { setNewContactForm(p => ({ ...p, empresa_id: e.target.value })); if (e.target.value !== '__new__') setInlineEmpresaContact({ name: '', industry: '' }); }} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="">Empresa (opcional)</option>
              <option value="__new__">＋ Crear nueva empresa</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {newContactForm.empresa_id === '__new__' && (
              <div className="bg-[var(--color-brand-gray)] rounded-xl p-3 space-y-2 border border-dashed border-gray-300">
                <p className="text-xs font-medium text-gray-500">Nueva empresa</p>
                <input value={inlineEmpresaContact.name} onChange={e => setInlineEmpresaContact(p => ({ ...p, name: e.target.value }))} placeholder="Nombre de la empresa *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
                <input value={inlineEmpresaContact.industry} onChange={e => setInlineEmpresaContact(p => ({ ...p, industry: e.target.value }))} placeholder="Industria" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowNewContact(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600">Cancelar</button>
              <button onClick={handleSaveContact} disabled={savingContact || !newContactForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingContact ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EventoDetail ─────────────────────────────────────────────────────────────

function EventoDetail({ event, contactos, empresas, BASE, userId, onClose, onContactAdded, onEventUpdated, onEventDeleted }: {
  event: Evento;
  contactos: Contacto[];
  empresas: Empresa[];
  BASE: string;
  userId: string;
  onClose: () => void;
  onContactAdded: () => void;
  onEventUpdated: (e: Evento) => void;
  onEventDeleted: (id: string) => void;
}) {
  const eventContacts = contactos.filter(c => c.eventSource === event.name);
  const progress = (event.contactGoal ?? 0) > 0 ? Math.min(100, Math.round(((event.contactsMet ?? 0) / (event.contactGoal ?? 1)) * 100)) : 0;
  const isComplete = (event.contactsMet ?? 0) >= (event.contactGoal ?? 1) && (event.contactGoal ?? 0) > 0;
  const typeLabel = EVENT_TYPE_LABELS[event.type ?? ''] || event.type || '';
  const [showNewContact, setShowNewContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', title: '', email: '', phone: '', linkedin_url: '', empresa_id: '' });
  const [inlineEmpresa, setInlineEmpresa] = useState({ name: '', industry: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [eventoForm, setEventoForm] = useState({ name: event.name, date: event.date ?? '', time: event.time ?? '', duration: String(event.duration ?? 2), end_date: event.end_date ?? '', type: event.type ?? 'presencial', contactGoal: String(event.contactGoal ?? 5), country: event.country ?? '', city: event.city ?? '', location: event.location ?? '', details: event.details ?? '' });
  const [savingEvento, setSavingEvento] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveContact = async () => {
    if (!contactForm.name.trim()) return;
    setSavingContact(true);
    try {
      let empresaId = contactForm.empresa_id;
      if (empresaId === '__new__') {
        if (!inlineEmpresa.name.trim()) { alert('Escribí el nombre de la empresa'); setSavingContact(false); return; }
        const er = await fetch(`/api/crm/empresa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, name: inlineEmpresa.name, industry: inlineEmpresa.industry, priority: 'media', status: 'investigando' }) });
        const ed = await er.json();
        empresaId = ed.id || ed.empresa?.id || '';
        setInlineEmpresa({ name: '', industry: '' });
      }
      await fetch(`/api/crm/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: contactForm.name.trim(), title: contactForm.title.trim(), email: contactForm.email.trim(), phone: contactForm.phone.trim(), linkedinUrl: contactForm.linkedin_url.trim(), stage: 'primer_contacto', eventSource: event.name, empresaId: empresaId || undefined }),
      });
      setShowNewContact(false);
      setContactForm({ name: '', title: '', email: '', phone: '', linkedin_url: '', empresa_id: '' });
      onContactAdded();
    } finally { setSavingContact(false); }
  };

  const handleSaveEvento = async () => {
    if (!eventoForm.name.trim()) return;
    setSavingEvento(true);
    try {
      await fetch(`/api/events`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eventId: event.id, name: eventoForm.name, date: eventoForm.date, time: eventoForm.time, duration: parseFloat(eventoForm.duration) || 2, end_date: eventoForm.end_date, type: eventoForm.type, contactGoal: parseInt(eventoForm.contactGoal) || 0, country: eventoForm.country, city: eventoForm.city, location: eventoForm.location, details: eventoForm.details }) });
      onEventUpdated({ ...event, name: eventoForm.name, date: eventoForm.date, time: eventoForm.time, duration: parseFloat(eventoForm.duration) || 2, end_date: eventoForm.end_date, type: eventoForm.type, contactGoal: parseInt(eventoForm.contactGoal) || 0, country: eventoForm.country, city: eventoForm.city, location: eventoForm.location, details: eventoForm.details });
      setShowEdit(false);
    } finally { setSavingEvento(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/events`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, eventId: event.id }) });
      onEventDeleted(event.id);
    } finally { setDeleting(false); }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button onClick={onClose} className="p-2 hover:bg-[var(--color-brand-gray)] rounded-lg">
          <ChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] truncate">{event.name}</h2>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {event.date && <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}{event.time ? ` · ${event.time}` : ''}</span>}
            {typeLabel && <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${event.type === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]'}`}>{typeLabel}</span>}
          </div>
        </div>
        <button onClick={() => setShowEdit(true)} className="p-2 hover:bg-[var(--color-pirai-50)] rounded-lg text-gray-400 hover:text-[var(--color-pirai-500)] transition-colors"><Pencil className="w-4 h-4" /></button>
        <button onClick={() => setConfirmDel(true)} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-2xl p-4 border border-[var(--color-brand-border)] shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-gray-700">Meta de contactos</p>
          <p className="text-sm font-bold text-[var(--color-pirai-600)]">{event.contactsMet ?? 0} / {event.contactGoal ?? 0}</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full transition-all ${isComplete ? 'bg-[var(--color-pirai-500)]' : 'bg-[var(--color-pirai-600)]'}`} style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{isComplete ? '¡Meta cumplida!' : `${progress}% completado`}</p>
      </div>

      {/* Location / details */}
      {(event.location || event.city || event.country || event.details) && (
        <div className="bg-white rounded-2xl p-4 border border-[var(--color-brand-border)] shadow-sm space-y-2">
          {(event.location || event.city || event.country) && <p className="text-sm text-gray-600">📍 {[event.location, event.city, event.country].filter(Boolean).join(', ')}</p>}
          {event.details && <p className="text-sm text-gray-600 whitespace-pre-line">{event.details}</p>}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => setShowNewContact(true)} className="flex-1 bg-[var(--color-pirai-600)] text-white px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-pirai-700)]">
          <Plus className="w-4 h-4" /> Conocí a alguien
        </button>
        <a href={buildGoogleCalendarUrl(event)} target="_blank" rel="noopener noreferrer" className="bg-[var(--color-turquesa-50)] text-[var(--color-turquesa-600)] px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-turquesa-100)] border border-[var(--color-turquesa-200)] transition-colors">
          <Calendar className="w-4 h-4" /> Agendar
        </a>
      </div>

      {/* Contacts from event */}
      <div>
        <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-2">Contactos ({eventContacts.length})</p>
        {eventContacts.length === 0 ? (
          <div className="bg-[var(--color-brand-gray)] rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-400">Todavía no registraste contactos de este evento.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventContacts.map(c => (
              <div key={c.id} className="bg-white rounded-xl p-3 border border-[var(--color-brand-border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-pirai-400)] to-[var(--color-turquesa-500)] flex items-center justify-center text-white font-bold text-xs shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-brand-dark)] truncate">{c.name}</p>
                  {c.title && <p className="text-xs text-gray-500 truncate">{c.title}</p>}
                  {c.empresaNombre && <p className="text-xs text-gray-400 truncate">{c.empresaNombre}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New contact modal */}
      {showNewContact && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[var(--color-brand-dark)]">Conocí a alguien en {event.name}</p>
              <button onClick={() => setShowNewContact(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {(['name', 'title', 'email', 'phone', 'linkedin_url'] as const).map(field => (
              <input key={field} value={contactForm[field]} onChange={e => setContactForm(p => ({ ...p, [field]: e.target.value }))}
                placeholder={{ name: 'Nombre *', title: 'Cargo', email: 'Email', phone: 'Teléfono', linkedin_url: 'LinkedIn URL' }[field]}
                className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
              />
            ))}
            <select value={contactForm.empresa_id} onChange={e => { setContactForm(p => ({ ...p, empresa_id: e.target.value })); if (e.target.value !== '__new__') setInlineEmpresa({ name: '', industry: '' }); }} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="">Empresa (opcional)</option>
              <option value="__new__">＋ Crear nueva empresa</option>
              {empresas.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            {contactForm.empresa_id === '__new__' && (
              <div className="bg-[var(--color-brand-gray)] rounded-xl p-3 space-y-2 border border-dashed border-gray-300">
                <p className="text-xs font-medium text-gray-500">Nueva empresa</p>
                <input value={inlineEmpresa.name} onChange={e => setInlineEmpresa(p => ({ ...p, name: e.target.value }))} placeholder="Nombre de la empresa *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
                <input value={inlineEmpresa.industry} onChange={e => setInlineEmpresa(p => ({ ...p, industry: e.target.value }))} placeholder="Industria" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              </div>
            )}
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowNewContact(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600">Cancelar</button>
              <button onClick={handleSaveContact} disabled={savingContact || !contactForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingContact ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit event modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-[var(--color-brand-dark)]">Editar evento</h3>
              <button onClick={() => setShowEdit(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <input value={eventoForm.name} onChange={e => setEventoForm(p => ({ ...p, name: e.target.value }))} placeholder="Nombre del evento *" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] text-gray-500 mb-1 block">Fecha inicio</label><input type="date" value={eventoForm.date} onChange={e => setEventoForm(p => ({ ...p, date: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Fecha fin</label><input type="date" value={eventoForm.end_date} onChange={e => setEventoForm(p => ({ ...p, end_date: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[10px] text-gray-500 mb-1 block">Hora</label><input type="time" value={eventoForm.time} onChange={e => setEventoForm(p => ({ ...p, time: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" /></div>
              <div><label className="text-[10px] text-gray-500 mb-1 block">Duración (hs)</label><input type="number" min="0.5" step="0.5" value={eventoForm.duration} onChange={e => setEventoForm(p => ({ ...p, duration: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" /></div>
            </div>
            <select value={eventoForm.type} onChange={e => setEventoForm(p => ({ ...p, type: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="hibrido">Híbrido</option>
              <option value="otro">Otro</option>
            </select>
            <div><label className="text-[10px] text-gray-500 mb-1 block">Meta de contactos</label><input type="number" min="0" value={eventoForm.contactGoal} onChange={e => setEventoForm(p => ({ ...p, contactGoal: e.target.value }))} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" /></div>
            <div className="grid grid-cols-2 gap-2">
              <input value={eventoForm.country} onChange={e => setEventoForm(p => ({ ...p, country: e.target.value }))} placeholder="País" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <input value={eventoForm.city} onChange={e => setEventoForm(p => ({ ...p, city: e.target.value }))} placeholder="Ciudad" className="px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            </div>
            <input value={eventoForm.location} onChange={e => setEventoForm(p => ({ ...p, location: e.target.value }))} placeholder="Lugar / dirección" className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
            <textarea value={eventoForm.details} onChange={e => setEventoForm(p => ({ ...p, details: e.target.value }))} placeholder="Detalles adicionales" rows={3} className="w-full px-3 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowEdit(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleSaveEvento} disabled={savingEvento || !eventoForm.name.trim()} className="flex-1 px-4 py-2 rounded-xl bg-[var(--color-pirai-500)] text-white text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50">
                {savingEvento ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <p className="font-semibold text-[var(--color-brand-dark)] mb-2">¿Eliminar evento?</p>
            <p className="text-sm text-gray-500 mb-4">Se eliminará <strong>{event.name}</strong>. Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDel(false)} className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-brand-border)] text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={handleDelete} disabled={deleting} className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-50">
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Row components ───────────────────────────────────────────────────────────

function EmpresaRow({ emp, active, onClick }: { emp: Empresa; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)]' : 'bg-white border border-transparent hover:border-[var(--color-brand-border)] hover:shadow-sm'}`}
    >
      {emp.logo_url ? (
        <img src={emp.logo_url} alt={emp.name} className="w-10 h-10 rounded-xl object-contain border border-gray-100" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[var(--color-pirai-400)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{emp.name}</p>
        <p className="text-xs text-[var(--color-brand-muted)] truncate">{[emp.industry, emp.country].filter(Boolean).join(' · ')}</p>
        {(emp.numContactos !== undefined || emp.numActividades !== undefined) && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            {emp.numContactos ?? 0} contactos · {emp.numActividades ?? 0} actividades
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        {emp.priority && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_COLORS[emp.priority] ?? 'bg-gray-100 text-gray-500'}`}>
            {emp.priority}
          </span>
        )}
        {emp.status && (
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${STATUS_COLORS[emp.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {emp.status}
          </span>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  );
}

function ContactoRow({ c, active, onClick }: { c: Contacto; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)]' : 'bg-white border border-transparent hover:border-[var(--color-brand-border)] hover:shadow-sm'}`}
    >
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-pirai-400)] to-[var(--color-turquesa-500)] flex items-center justify-center text-white font-bold text-sm shrink-0">
        {c.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{c.name}</p>
        <p className="text-xs text-[var(--color-brand-muted)] truncate">{[c.title, c.empresaNombre].filter(Boolean).join(' · ')}</p>
      </div>
      {c.stage && (
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)] shrink-0">
          {STAGE_LABELS[c.stage] ?? c.stage}
        </span>
      )}
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  );
}

// ─── Empresa Detail Panel ─────────────────────────────────────────────────────

function EmpresaDetail({ emp, contactos, actividades, BASE, userId, onClose, onUpdate, onDelete, onSelectContact }: {
  emp: Empresa;
  contactos: Contacto[];
  actividades: Actividad[];
  BASE: string;
  userId: string;
  onClose: () => void;
  onUpdate: (emp: Empresa) => void;
  onDelete: (id: string) => void;
  onSelectContact: (c: Contacto) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: emp.name, industry: emp.industry ?? '', status: emp.status ?? '', priority: emp.priority ?? '', notes: emp.notes ?? '', objetivo: emp.objetivo ?? '', website: emp.website ?? '', country: emp.country ?? '' });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAllActs, setShowAllActs] = useState(false);
  const [showContactos, setShowContactos] = useState(false);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [foundContacts, setFoundContacts] = useState<Array<{ name: string; title?: string; email?: string; linkedinUrl?: string }>>([]);
  const [contactSearchDone, setContactSearchDone] = useState(false);
  const [addingContact, setAddingContact] = useState<string | null>(null);
  const [addedContacts, setAddedContacts] = useState<Set<string>>(new Set());

  const handleSearchContacts = async () => {
    const rawDomain = emp.website || (emp.name?.toLowerCase().replace(/\s+/g, '') + '.com');
    const domain = rawDomain.trim().replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].toLowerCase();
    if (!domain) return;
    setSearchingContacts(true);
    setContactSearchDone(false);
    setFoundContacts([]);
    try {
      const res = await fetch(`/api/contacts/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, userId }),
      }).then(r => r.json());
      const raw: Array<{ first_name?: string; last_name?: string; name?: string; email?: string; title?: string; linkedin_url?: string; linkedinUrl?: string }> = res.contacts ?? (Array.isArray(res) ? res : []);
      setFoundContacts(raw.map(c => ({
        name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || '',
        title: c.title,
        email: c.email,
        linkedinUrl: c.linkedinUrl || c.linkedin_url,
      })).filter(c => c.name));
    } catch {
      setFoundContacts([]);
    } finally {
      setSearchingContacts(false);
      setContactSearchDone(true);
    }
  };

  const handleAddFoundContact = async (contact: { name: string; title?: string; email?: string; linkedinUrl?: string }) => {
    setAddingContact(contact.name);
    try {
      const res = await fetch(`/api/crm/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: contact.name, title: contact.title, email: contact.email, linkedinUrl: contact.linkedinUrl, empresaId: emp.id }),
      });
      if (res.ok) setAddedContacts(prev => new Set([...prev, contact.name]));
    } catch {}
    finally { setAddingContact(null); }
  };

  const contactosEmpresa = contactos.filter(c => c.empresaId === emp.id);
  const actividadesEmpresa = actividades
    .filter(a => a.empresaId === emp.id)
    .sort((a, b) => (b.createdAt || b.fecha || '').localeCompare(a.createdAt || a.fecha || ''));

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/crm/empresa`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, userId, ...editForm }),
      });
      onUpdate({ ...emp, ...editForm });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/crm/empresa`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: emp.id, userId }),
      });
      onDelete(emp.id);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-[var(--color-brand-dark)]">Editar empresa</h2>
          <button onClick={() => setEditing(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <EditField label="Nombre" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
        <EditField label="Industria" value={editForm.industry} onChange={v => setEditForm(f => ({ ...f, industry: v }))} />
        <div>
          <label className="text-xs text-[var(--color-brand-muted)] mb-1 block">Estado</label>
          <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))} className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
            {['investigando','contactado','en conversación','sin respuesta','descartado','entrevista','oferta','cliente'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-[var(--color-brand-muted)] mb-1 block">Prioridad</label>
          <select value={editForm.priority} onChange={e => setEditForm(f => ({ ...f, priority: e.target.value }))} className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
            {['alta','media','baja'].map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <EditField label="Objetivo" value={editForm.objetivo} onChange={v => setEditForm(f => ({ ...f, objetivo: v }))} textarea />
        <EditField label="Notas" value={editForm.notes} onChange={v => setEditForm(f => ({ ...f, notes: v }))} textarea />
        <EditField label="Website" value={editForm.website} onChange={v => setEditForm(f => ({ ...f, website: v }))} />
        <EditField label="País" value={editForm.country} onChange={v => setEditForm(f => ({ ...f, country: v }))} />
        <div className="flex gap-2 pt-2">
          <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-[var(--color-brand-border)] text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {emp.logo_url ? (
            <img src={emp.logo_url} alt={emp.name} className="w-12 h-12 rounded-xl object-contain border border-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-pirai-400)]" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-[var(--color-brand-dark)]">{emp.name}</h2>
            {emp.industry && <p className="text-xs text-[var(--color-brand-muted)]">{emp.industry}</p>}
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        {emp.priority && <Badge className={PRIORITY_COLORS[emp.priority] ?? 'bg-gray-100 text-gray-500'}>{emp.priority}</Badge>}
        {emp.status && <Badge className={STATUS_COLORS[emp.status] ?? 'bg-gray-100 text-gray-500'}>{emp.status}</Badge>}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-center bg-[var(--color-brand-gray)] rounded-xl p-3">
        <div className="p-2">
          <p className="text-lg font-bold text-[var(--color-pirai-600)]">{contactosEmpresa.length}</p>
          <p className="text-[10px] text-gray-500">Contactos</p>
        </div>
        <div className="p-2">
          <p className="text-lg font-bold text-[var(--color-turquesa-500)]">{emp.numActividades ?? actividadesEmpresa.length}</p>
          <p className="text-[10px] text-gray-500">Actividades</p>
        </div>
        <div className="p-2">
          <p className="text-xs font-semibold text-gray-700 truncate">{emp.ultimaActividad ?? '—'}</p>
          <p className="text-[10px] text-gray-500">Última act.</p>
        </div>
      </div>

      {/* Contextual tips */}
      {(() => {
        const tips: string[] = [];
        if (!contactosEmpresa.length) tips.push('Agregá 2 contactos clave: alguien decisor y alguien del área.');
        if (!actividadesEmpresa.length) tips.push('Todavía no hiciste ninguna actividad. Tu mejor siguiente paso es un primer outreach.');
        else if (actividadesEmpresa.length === 1) tips.push('Solo hay una actividad registrada. Hacé seguimiento antes de dejar enfriar esta cuenta.');
        else if (!actividadesEmpresa.some(a => a.respuesta)) tips.push('Todavía no hubo respuesta. Probá follow-up con otro ángulo o cambiá de contacto.');
        if (contactosEmpresa.length > 0 && !actividadesEmpresa.length) tips.push('Ya tenés contactos cargados. Convertí eso en movimiento: mandá mensaje o email.');
        if (!tips.length && contactosEmpresa.length >= 2 && actividadesEmpresa.length >= 2) tips.push('Bien encaminado: base de contactos y actividad. Ahora cuidá consistencia y seguimiento.');
        if (!tips.length) return null;
        return (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
            {tips.slice(0, 3).map((tip, i) => (
              <p key={i} className="text-xs text-amber-800 flex gap-1.5"><span className="shrink-0">💡</span>{tip}</p>
            ))}
          </div>
        );
      })()}

      {/* Objetivo */}
      {emp.objetivo && (
        <div>
          <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-1">🎯 Objetivo</p>
          <p className="text-sm text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] rounded-xl p-3 leading-relaxed whitespace-pre-line">{emp.objetivo}</p>
        </div>
      )}

      {/* Notes */}
      {emp.notes && (
        <div>
          <p className="text-xs text-[var(--color-brand-muted)] mb-1">Notas</p>
          <p className="text-sm text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] rounded-xl p-3 leading-relaxed whitespace-pre-line">{emp.notes}</p>
        </div>
      )}

      {/* Website / country */}
      <div className="space-y-2 text-sm">
        {emp.country && <InfoRow label="País" value={emp.country} />}
        {emp.website && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-brand-muted)]">Web</span>
            <a href={emp.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-pirai-600)] text-xs hover:underline">
              {emp.website} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>

      {/* Contactos — siempre visible */}
      <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden">
        <div className="px-3 py-2.5 bg-[var(--color-brand-gray)] border-b border-[var(--color-brand-border)] flex items-center justify-between">
          <p className="text-xs font-semibold text-[var(--color-brand-dark)] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[var(--color-pirai-500)]" />
            Contactos {contactosEmpresa.length > 0 && <span className="text-[var(--color-pirai-600)]">({contactosEmpresa.length})</span>}
          </p>
          <button
            onClick={handleSearchContacts}
            disabled={searchingContacts}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] disabled:opacity-60 transition-colors"
          >
            {searchingContacts ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            {searchingContacts ? 'Buscando...' : 'Buscar contactos'}
          </button>
        </div>

        {/* Lista de contactos existentes */}
        {contactosEmpresa.length > 0 && (
          <div className="divide-y divide-[var(--color-brand-border)]">
            {contactosEmpresa.map(c => (
              <button key={c.id} onClick={() => onSelectContact(c)} className="w-full px-3 py-3 flex items-center justify-between hover:bg-[var(--color-pirai-50)] transition-colors text-left group">
                <div>
                  <p className="text-sm font-medium text-[var(--color-brand-dark)]">{c.name}</p>
                  {c.title && <p className="text-xs text-gray-400">{c.title}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {c.stage && <Badge className="bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]">{STAGE_LABELS[c.stage] ?? c.stage}</Badge>}
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[var(--color-pirai-500)] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state con CTAs */}
        {contactosEmpresa.length === 0 && !contactSearchDone && !searchingContacts && (
          <div className="p-5 text-center space-y-3">
            <p className="text-sm text-gray-500 font-medium">Sin contactos en {emp.name}</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Buscá contactos automáticamente por dominio o agregá uno manualmente.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button
                onClick={handleSearchContacts}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] transition-colors"
              >
                <Search className="w-3.5 h-3.5" /> Buscar contactos automáticamente
              </button>
            </div>
          </div>
        )}

        {searchingContacts && (
          <div className="p-5 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-pirai-500)]" /> Buscando contactos en {emp.website || emp.name}...
          </div>
        )}

        {/* Resultados de búsqueda automática */}
        {foundContacts.length > 0 && (
          <>
            <div className="px-3 py-2 bg-[var(--color-pirai-50)] border-t border-[var(--color-pirai-100)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-pirai-600)]" />
              <p className="text-xs font-semibold text-[var(--color-pirai-700)]">{foundContacts.length} contacto{foundContacts.length !== 1 ? 's' : ''} encontrado{foundContacts.length !== 1 ? 's' : ''} — elegí cuáles agregar</p>
            </div>
            <div className="divide-y divide-[var(--color-brand-border)]">
              {foundContacts.map((fc, i) => (
                <div key={i} className="px-3 py-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-brand-dark)] truncate">{fc.name}</p>
                    {fc.title && <p className="text-xs text-gray-400 truncate">{fc.title}</p>}
                    {fc.email && <p className="text-[10px] text-[var(--color-pirai-600)] truncate">{fc.email}</p>}
                  </div>
                  {addedContacts.has(fc.name) ? (
                    <span className="text-xs text-[var(--color-pirai-600)] font-semibold flex items-center gap-1 shrink-0"><CheckCircle className="w-3.5 h-3.5" /> Agregado</span>
                  ) : (
                    <button
                      onClick={() => handleAddFoundContact(fc)}
                      disabled={addingContact === fc.name}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] border border-[var(--color-pirai-200)] hover:bg-[var(--color-pirai-100)] disabled:opacity-60 transition-colors shrink-0"
                    >
                      {addingContact === fc.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Agregar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {contactSearchDone && foundContacts.length === 0 && (
          <p className="px-3 py-3 text-xs text-gray-400 border-t border-[var(--color-brand-border)] text-center">
            No se encontraron contactos nuevos. Agregá uno manualmente.
          </p>
        )}
      </div>

      {/* Activities timeline */}
      {actividadesEmpresa.length > 0 && (
        <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-[var(--color-brand-gray)] border-b border-[var(--color-brand-border)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-turquesa-500)]" />
            <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Actividades ({actividadesEmpresa.length})</p>
          </div>
          <div className="divide-y divide-[var(--color-brand-border)]">
            {(showAllActs ? actividadesEmpresa : actividadesEmpresa.slice(0, 10)).map(a => (
              <div key={a.id} className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-sm">{ACTIVITY_EMOJIS[a.tipo] ?? '📌'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--color-brand-dark)] truncate">{ACTIVITY_LABELS[a.tipo] ?? a.tipo}</p>
                    {a.contactoNombre && <p className="text-[10px] text-gray-400">{a.contactoNombre}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-400">{a.fecha}</span>
                  {a.respuesta && <Badge className="bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)]">✓</Badge>}
                </div>
              </div>
            ))}
          </div>
          {!showAllActs && actividadesEmpresa.length > 10 && (
            <button onClick={() => setShowAllActs(true)} className="w-full py-2 text-xs font-semibold text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-50)] transition-colors">
              Ver más ({actividadesEmpresa.length - 10} más)
            </button>
          )}
        </div>
      )}

      {/* Edit / Delete buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            setEditForm({ name: emp.name, industry: emp.industry ?? '', status: emp.status ?? '', priority: emp.priority ?? '', notes: emp.notes ?? '', objetivo: emp.objetivo ?? '', website: emp.website ?? '', country: emp.country ?? '' });
            setEditing(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          onClick={() => setConfirmDel(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-red-800">¿Eliminar "{emp.name}"?</p>
          <p className="text-xs text-red-600">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-100">Cancelar</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-1">
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Contacto Detail Panel ────────────────────────────────────────────────────

function ContactoDetail({ c, empresas, actividades, BASE, userId, userName, userStage, onClose, onUpdate, onDelete }: {
  c: Contacto;
  empresas: Empresa[];
  actividades: Actividad[];
  BASE: string;
  userId: string;
  userName: string;
  userStage?: string;
  onClose: () => void;
  onUpdate: (c: Contacto) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: c.name, title: c.title ?? '', email: c.email ?? '', linkedinUrl: c.linkedinUrl ?? '', phone: c.phone ?? '', stage: c.stage ?? '', notes: c.notes ?? '' });
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAllActs, setShowAllActs] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);

  const isBiz = userStage === 'emprendedor' || userStage === 'freelancer' || userStage === 'empresa';
  const PIPELINE_STAGES = [
    { key: 'primer_contacto', label: 'Contactado', emoji: '👋' },
    { key: 'seguimiento', label: 'Seguimiento', emoji: '📩' },
    { key: 'respuesta_recibida', label: 'Respuesta', emoji: '💬' },
    { key: 'entrevista', label: isBiz ? 'Reunión' : 'Entrevista', emoji: '🎯' },
  ];
  const FINAL_STAGES = [
    { key: 'oferta', label: isBiz ? 'Propuesta' : 'Oferta', emoji: '🔥', color: 'bg-orange-500' },
    { key: 'nuevo_cliente', label: isBiz ? 'Cliente' : 'Contratado', emoji: isBiz ? '🤝' : '🎉', color: 'bg-[var(--color-pirai-500)]' },
    { key: 'descartado', label: 'No avanzó', emoji: '✗', color: 'bg-gray-400' },
  ];

  const handleUpdateStage = async (stage: string) => {
    if (updatingStage || stage === c.stage) return;
    setUpdatingStage(true);
    try {
      await fetch(`/api/crm/contacto`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, userId, stage }),
      });
      onUpdate({ ...c, stage });
    } catch {}
    finally { setUpdatingStage(false); }
  };

  // Message generator
  const [messageType, setMessageType] = useState('primer_contacto');
  const [userContext, setUserContext] = useState('');
  const [generatingMsg, setGeneratingMsg] = useState(false);
  const [generatedMsg, setGeneratedMsg] = useState('');
  const [msgCopied, setMsgCopied] = useState(false);

  // Gmail
  const [gmailConnected, setGmailConnected] = useState<boolean | null>(null);
  const [gmailMessages, setGmailMessages] = useState<Array<{ id: string; subject?: string; from?: string; date?: string; snippet?: string; body?: string; threadId?: string }>>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [showCompose, setShowCompose] = useState(false);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [replyToThread, setReplyToThread] = useState<string | undefined>(undefined);
  const [expandedMsg, setExpandedMsg] = useState<string | null>(null);

  const empresa = empresas.find(e => e.id === c.empresaId);
  const actividadesContacto = actividades
    .filter(a => a.contactoId === c.id)
    .sort((a, b) => (b.createdAt || b.fecha || '').localeCompare(a.createdAt || a.fecha || ''));

  // Check Gmail on mount
  useEffect(() => {
    if (!userId || !c.email) { setGmailConnected(false); return; }
    fetch(`/api/gmail-messages?userId=${encodeURIComponent(userId)}&maxResults=1`)
      .then(r => r.json())
      .then(res => {
        setGmailConnected(!res.error && !res.authRequired);
        if (!res.error && !res.authRequired && c.email) loadGmailMessages();
      })
      .catch(() => setGmailConnected(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.id]);

  const loadGmailMessages = async () => {
    if (!c.email) return;
    setGmailLoading(true);
    try {
      const res = await fetch(`/api/gmail-messages?userId=${encodeURIComponent(userId)}&contactEmail=${encodeURIComponent(c.email)}`).then(r => r.json());
      setGmailMessages(Array.isArray(res.messages) ? res.messages : Array.isArray(res) ? res : []);
    } catch { setGmailMessages([]); }
    finally { setGmailLoading(false); }
  };

  const handleGenerateMessage = async () => {
    setGeneratingMsg(true);
    setGeneratedMsg('');
    try {
      const contactActivities = actividades.filter(a => a.contactoId === c.id).slice(0, 5).map(a => ({ tipo: a.tipo, fecha: a.fecha, notas: a.notas, respuesta: a.respuesta }));
      const res = await fetch(`/api/generate-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId, contactName: c.name, contactTitle: c.title, contactStage: c.stage,
          empresaName: empresa?.name ?? c.empresaNombre, empresaIndustry: empresa?.industry,
          eventSource: c.eventSource, activities: contactActivities,
          messageType, userContext, senderName: userName,
        }),
      }).then(r => r.json());
      setGeneratedMsg(res.message ?? res.text ?? '');
      if (res.subject) setComposeSubject(res.subject);
    } catch { setGeneratedMsg(''); }
    finally { setGeneratingMsg(false); }
  };

  const handleCopyMessage = async () => {
    if (!generatedMsg) return;
    await navigator.clipboard.writeText(generatedMsg);
    setMsgCopied(true);
    setTimeout(() => setMsgCopied(false), 2000);
  };

  const handleLinkedInAction = async () => {
    if (generatedMsg) await navigator.clipboard.writeText(generatedMsg);
    if (c.linkedinUrl) window.open(c.linkedinUrl, '_blank');
    // register activity
    try {
      await fetch(`/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tipo: 'mensaje_linkedin', contactoId: c.id, empresaId: c.empresaId, fecha: new Date().toISOString().split('T')[0], notas: generatedMsg.slice(0, 200) }),
      });
    } catch {}
  };

  const handleSendEmail = async () => {
    if (!c.email) return;
    setSendingEmail(true);
    try {
      await fetch(`/api/gmail-send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, to: c.email, subject: composeSubject, body: composeBody, threadId: replyToThread }),
      });
      // register email activity
      await fetch(`/api/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tipo: 'email', contactoId: c.id, empresaId: c.empresaId, fecha: new Date().toISOString().split('T')[0], notas: `${composeSubject}: ${composeBody.slice(0, 100)}` }),
      });
      setShowCompose(false);
      setComposeSubject('');
      setComposeBody('');
      setReplyToThread(undefined);
      loadGmailMessages();
    } catch {}
    finally { setSendingEmail(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/crm/contacto`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, userId, ...editForm, linkedin_url: editForm.linkedinUrl }),
      });
      onUpdate({ ...c, ...editForm });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/crm/contacto`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, userId }),
      });
      onDelete(c.id);
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold text-[var(--color-brand-dark)]">Editar contacto</h2>
          <button onClick={() => setEditing(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        <EditField label="Nombre" value={editForm.name} onChange={v => setEditForm(f => ({ ...f, name: v }))} />
        <EditField label="Título / Cargo" value={editForm.title} onChange={v => setEditForm(f => ({ ...f, title: v }))} />
        <EditField label="Email" value={editForm.email} onChange={v => setEditForm(f => ({ ...f, email: v }))} />
        <EditField label="LinkedIn URL" value={editForm.linkedinUrl} onChange={v => setEditForm(f => ({ ...f, linkedinUrl: v }))} />
        <EditField label="Teléfono" value={editForm.phone} onChange={v => setEditForm(f => ({ ...f, phone: v }))} />
        <div>
          <label className="text-xs text-[var(--color-brand-muted)] mb-1 block">Etapa</label>
          <select value={editForm.stage} onChange={e => setEditForm(f => ({ ...f, stage: e.target.value }))} className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
            {Object.entries(STAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <EditField label="Notas" value={editForm.notes} onChange={v => setEditForm(f => ({ ...f, notes: v }))} textarea />
        <div className="flex gap-2 pt-2">
          <button onClick={() => setEditing(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold border border-[var(--color-brand-border)] text-gray-600 hover:bg-gray-50">Cancelar</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-pirai-400)] to-[var(--color-turquesa-500)] flex items-center justify-center text-white font-bold">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-[var(--color-brand-dark)]">{c.name}</h2>
            <p className="text-xs text-[var(--color-brand-muted)]">{[c.title, empresa?.name ?? c.empresaNombre].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      {/* Pipeline stepper */}
      {c.stage !== 'sin_contactar' && (() => {
        const isFinal = FINAL_STAGES.some(s => s.key === c.stage);
        const finalStage = FINAL_STAGES.find(s => s.key === c.stage);
        const hasFollowup = actividadesContacto.some(a => a.tipo === 'seguimiento');
        const hasResponse = actividadesContacto.some(a => a.respuesta);
        const hasEntrevista = actividadesContacto.some(a => a.tipo === 'entrevista');
        let computedStage = 'primer_contacto';
        if (hasFollowup) computedStage = 'seguimiento';
        if (hasResponse) computedStage = 'respuesta_recibida';
        if (hasEntrevista) computedStage = 'entrevista';
        const stageKeys = PIPELINE_STAGES.map(s => s.key);
        const computedIdx = stageKeys.indexOf(computedStage);
        const storedIdx = stageKeys.indexOf(c.stage ?? '');
        const activeIdx = isFinal ? PIPELINE_STAGES.length : Math.max(computedIdx, storedIdx);
        return (
          <div className="border border-[var(--color-brand-border)] rounded-xl p-3 bg-[var(--color-brand-gray)]">
            <div className="flex items-center">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isActive = idx === activeIdx;
                const isPast = idx < activeIdx || isFinal;
                return (
                  <div key={stage.key} className="flex items-center flex-1">
                    <button
                      onClick={() => handleUpdateStage(stage.key)}
                      disabled={updatingStage}
                      className="flex flex-col items-center gap-0.5 flex-shrink-0 group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                        isActive && !isFinal
                          ? 'bg-[var(--color-pirai-500)] text-white shadow-md scale-110'
                          : isPast
                          ? 'bg-[var(--color-pirai-200)] text-[var(--color-pirai-700)]'
                          : 'bg-white border border-gray-200 text-gray-400 group-hover:border-[var(--color-pirai-300)] group-hover:text-[var(--color-pirai-500)]'
                      }`}>
                        {isPast && !isActive ? '✓' : stage.emoji}
                      </div>
                      <span className={`text-[9px] leading-tight text-center max-w-[44px] ${
                        isActive && !isFinal ? 'font-bold text-[var(--color-pirai-700)]' :
                        isPast ? 'font-medium text-[var(--color-pirai-500)]' :
                        'text-gray-400'
                      }`}>{stage.label}</span>
                    </button>
                    {idx < PIPELINE_STAGES.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-3 rounded ${
                        idx < activeIdx || isFinal ? 'bg-[var(--color-pirai-300)]' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Final stage badge */}
            {isFinal && finalStage && (
              <div className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-white text-sm font-bold ${finalStage.color}`}>
                {finalStage.emoji} {finalStage.label}
              </div>
            )}
            {/* Final stage action buttons — show when at seguimiento or beyond */}
            {!isFinal && activeIdx >= 1 && (
              <div className="flex gap-2 mt-3 pt-2 border-t border-[var(--color-brand-border)]">
                <button onClick={() => handleUpdateStage('oferta')} disabled={updatingStage}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
                  🔥 {isBiz ? 'Propuesta' : 'Oferta'}
                </button>
                <button onClick={() => handleUpdateStage('nuevo_cliente')} disabled={updatingStage}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-[var(--color-pirai-500)] hover:bg-[var(--color-pirai-600)] transition-colors">
                  {isBiz ? '🤝 Cliente' : '🎉 Contratado'}
                </button>
                <button onClick={() => handleUpdateStage('descartado')} disabled={updatingStage}
                  className="flex-1 py-1.5 rounded-xl text-xs font-bold text-white bg-gray-400 hover:bg-gray-500 transition-colors">
                  ✗ No avanzó
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Contextual tips */}
      {(() => {
        const tips: string[] = [];
        if (!empresa) tips.push('Este contacto no está vinculado a una empresa. Conectalo para no perder contexto.');
        if (!actividadesContacto.length) tips.push('Todavía no registraste ninguna actividad. Tu siguiente paso es iniciar conversación.');
        else if (actividadesContacto.length === 1) tips.push('Solo hay una interacción registrada. Hacé seguimiento antes de que se enfríe.');
        else if (!actividadesContacto.some(a => a.respuesta)) tips.push('Todavía no hubo respuesta. Probá otro canal o reformulá el mensaje.');
        if ((c.stage === 'sin_contactar' || c.stage === 'primer_contacto') && actividadesContacto.length > 0) tips.push('Actualizá la etapa del contacto para que tu pipeline refleje la realidad.');
        if (!tips.length) return null;
        return (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-1.5">
            {tips.slice(0, 3).map((tip, i) => (
              <p key={i} className="text-xs text-amber-800 flex gap-1.5"><span className="shrink-0">💡</span>{tip}</p>
            ))}
          </div>
        );
      })()}

      {/* Contact links */}
      <div className="space-y-2">
        {c.email && (
          <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm text-[var(--color-pirai-600)] hover:underline">
            <Mail className="w-4 h-4" /> {c.email}
          </a>
        )}
        {c.linkedinUrl && (
          <a href={c.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <Link2 className="w-4 h-4" /> LinkedIn
          </a>
        )}
        {c.phone && (
          <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm text-[var(--color-brand-dark)] hover:underline">
            <Phone className="w-4 h-4" /> {c.phone}
          </a>
        )}
      </div>

      {/* Notes */}
      {c.notes && (
        <div>
          <p className="text-xs text-[var(--color-brand-muted)] mb-1">Notas</p>
          <p className="text-sm text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] rounded-xl p-3 leading-relaxed whitespace-pre-line">{c.notes}</p>
        </div>
      )}

      {/* Activities timeline */}
      {actividadesContacto.length > 0 && (
        <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-[var(--color-brand-gray)] border-b border-[var(--color-brand-border)] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[var(--color-turquesa-500)]" />
            <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Actividades ({actividadesContacto.length})</p>
          </div>
          <div className="divide-y divide-[var(--color-brand-border)]">
            {(showAllActs ? actividadesContacto : actividadesContacto.slice(0, 5)).map(a => (
              <div key={a.id} className="px-3 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-sm">{ACTIVITY_EMOJIS[a.tipo] ?? '📌'}</span>
                  <p className="text-xs font-medium text-[var(--color-brand-dark)] truncate">{ACTIVITY_LABELS[a.tipo] ?? a.tipo}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-gray-400">{a.fecha}</span>
                  {a.respuesta && <Badge className="bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)]">✓</Badge>}
                </div>
              </div>
            ))}
          </div>
          {!showAllActs && actividadesContacto.length > 5 && (
            <button onClick={() => setShowAllActs(true)} className="w-full py-2 text-xs font-semibold text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-50)] transition-colors">
              Ver más ({actividadesContacto.length - 5} más)
            </button>
          )}
        </div>
      )}

      {/* ── Message Generator ── */}
      <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden">
        <div className="px-3 py-2 bg-[var(--color-brand-gray)] border-b border-[var(--color-brand-border)] flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[var(--color-pirai-500)]" />
          <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Generador de mensaje</p>
        </div>
        <div className="p-3 space-y-2.5">
          <div>
            <label className="text-[10px] text-[var(--color-brand-muted)] mb-1 block">Tipo de mensaje</label>
            <select
              value={messageType}
              onChange={e => setMessageType(e.target.value)}
              className="w-full border border-[var(--color-brand-border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-white"
            >
              <option value="primer_contacto">Primer contacto</option>
              <option value="linkedin">LinkedIn</option>
              <option value="followup">Follow-up</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="agradecimiento">Agradecimiento</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-brand-muted)] mb-1 block">Contexto adicional (opcional)</label>
            <textarea
              value={userContext}
              onChange={e => setUserContext(e.target.value)}
              rows={2}
              placeholder="Ej: vi que publicaron sobre X, quiero mencionar Y..."
              className="w-full border border-[var(--color-brand-border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
            />
          </div>
          <button
            onClick={handleGenerateMessage}
            disabled={generatingMsg}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] disabled:opacity-60 transition-colors"
          >
            {generatingMsg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            {generatingMsg ? 'Generando...' : 'Generar mensaje'}
          </button>

          {generatedMsg && (
            <div className="space-y-2">
              <div className="bg-[var(--color-brand-gray)] rounded-lg p-3 text-xs text-[var(--color-brand-dark)] leading-relaxed whitespace-pre-wrap max-h-40 overflow-auto border border-[var(--color-brand-border)]">
                {generatedMsg}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                <button
                  onClick={handleCopyMessage}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-white border border-[var(--color-brand-border)] text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Copy className="w-3 h-3" /> {msgCopied ? 'Copiado!' : 'Copiar'}
                </button>
                {c.linkedinUrl && (
                  <button
                    onClick={handleLinkedInAction}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Link2 className="w-3 h-3" /> Enviar por LinkedIn
                  </button>
                )}
                {c.email && gmailConnected && (
                  <button
                    onClick={() => {
                      const defaultSubject = empresa?.name ? `Contacto - ${empresa.name}` : `Hola ${c.name.split(' ')[0]}`;
                      setComposeSubject(defaultSubject);
                      setComposeBody(generatedMsg);
                      setReplyToThread(undefined);
                      setShowCompose(true);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] text-[var(--color-pirai-700)] hover:bg-[var(--color-pirai-100)] transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Enviar por email
                  </button>
                )}
                {c.email && !gmailConnected && (
                  <a
                    href={`mailto:${c.email}?body=${encodeURIComponent(generatedMsg)}`}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] text-[var(--color-pirai-700)] hover:bg-[var(--color-pirai-100)] transition-colors"
                  >
                    <Mail className="w-3 h-3" /> Abrir email
                  </a>
                )}
                {c.phone && (
                  <a
                    href={`https://wa.me/${c.phone.replace(/[^\d+]/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(generatedMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      fetch(`/api/activities`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId, tipo: 'whatsapp', contactoId: c.id, empresaId: c.empresaId, fecha: new Date().toISOString().split('T')[0], notas: generatedMsg.slice(0, 200) }),
                      }).catch(() => {});
                    }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.873L.057 23.571a.75.75 0 00.921.921l5.698-1.489A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.704 9.704 0 01-4.93-1.342l-.353-.21-3.663.957.975-3.563-.23-.366A9.694 9.694 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg> WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Gmail Section ── */}
      {c.email && (
        <div className="border border-[var(--color-brand-border)] rounded-xl overflow-hidden">
          <div className="px-3 py-2 bg-[var(--color-brand-gray)] border-b border-[var(--color-brand-border)] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Inbox className="w-3.5 h-3.5 text-[var(--color-turquesa-500)]" />
              <p className="text-xs font-semibold text-[var(--color-brand-muted)]">Emails con {c.name.split(' ')[0]}</p>
            </div>
            {gmailConnected && (
              <button
                onClick={() => { setShowCompose(true); setComposeSubject(empresa?.name ? `Contacto - ${empresa.name}` : `Hola ${c.name.split(' ')[0]}`); setComposeBody(generatedMsg); setReplyToThread(undefined); }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] transition-colors"
              >
                <Plus className="w-3 h-3" /> Redactar
              </button>
            )}
          </div>

          {gmailConnected === null && (
            <div className="p-3 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
          )}

          {gmailConnected === false && (
            <div className="p-4 text-center space-y-2">
              <p className="text-xs text-gray-500">Conectá Gmail para ver y enviar emails directamente desde Piraí.</p>
              <a
                href={`${BASE}/api/google/gmail-connect?platform=web_app&userId=${encodeURIComponent(userId)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Conectar Gmail
              </a>
            </div>
          )}

          {gmailConnected === true && (
            <>
              {showCompose && (
                <div className="p-3 border-b border-[var(--color-brand-border)] space-y-2 bg-white">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-[var(--color-brand-dark)]">Nuevo email para {c.email}</p>
                    <button onClick={() => setShowCompose(false)} className="p-0.5 hover:bg-gray-100 rounded"><X className="w-3.5 h-3.5 text-gray-400" /></button>
                  </div>
                  <input
                    value={composeSubject}
                    onChange={e => setComposeSubject(e.target.value)}
                    placeholder="Asunto"
                    className="w-full border border-[var(--color-brand-border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
                  />
                  <textarea
                    value={composeBody}
                    onChange={e => setComposeBody(e.target.value)}
                    rows={5}
                    placeholder="Cuerpo del email..."
                    className="w-full border border-[var(--color-brand-border)] rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setShowCompose(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-[var(--color-brand-border)] text-gray-600 hover:bg-gray-50">Cancelar</button>
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail || !composeSubject || !composeBody}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)] disabled:opacity-60 flex items-center justify-center gap-1"
                    >
                      {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                      {sendingEmail ? 'Enviando...' : 'Enviar'}
                    </button>
                  </div>
                </div>
              )}

              {gmailLoading ? (
                <div className="p-3 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
              ) : gmailMessages.length === 0 ? (
                <p className="p-4 text-xs text-gray-400 text-center">Sin emails con {c.email} aún.</p>
              ) : (
                <div className="divide-y divide-[var(--color-brand-border)] max-h-56 overflow-auto">
                  {gmailMessages.map(msg => (
                    <div key={msg.id} className="px-3 py-2.5 cursor-pointer hover:bg-[var(--color-brand-gray)] transition-colors" onClick={() => setExpandedMsg(expandedMsg === msg.id ? null : msg.id)}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-[var(--color-brand-dark)] truncate">{msg.subject || '(sin asunto)'}</p>
                          <p className="text-[10px] text-gray-400 truncate">{msg.from}</p>
                        </div>
                        <span className="text-[10px] text-gray-400 shrink-0">{msg.date ? new Date(msg.date).toLocaleDateString('es') : ''}</span>
                      </div>
                      {expandedMsg === msg.id && msg.snippet && (
                        <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">{msg.snippet}</p>
                      )}
                      {expandedMsg === msg.id && (
                        <div className="mt-1.5 flex gap-1.5">
                          <button
                            onClick={e => { e.stopPropagation(); setComposeSubject(`Re: ${msg.subject ?? ''}`); setComposeBody(''); setReplyToThread(msg.threadId); setShowCompose(true); }}
                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-100)] transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> Responder
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Edit / Delete buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={() => {
            setEditForm({ name: c.name, title: c.title ?? '', email: c.email ?? '', linkedinUrl: c.linkedinUrl ?? '', phone: c.phone ?? '', stage: c.stage ?? '', notes: c.notes ?? '' });
            setEditing(true);
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)] transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Editar
        </button>
        <button
          onClick={() => setConfirmDel(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>

      {/* Delete confirm */}
      {confirmDel && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <p className="text-sm font-semibold text-red-800">¿Eliminar "{c.name}"?</p>
          <p className="text-xs text-red-600">Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-red-200 text-red-600 hover:bg-red-100">Cancelar</button>
            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-1">
              {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null} Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared small components ──────────────────────────────────────────────────

function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${className ?? ''}`}>{children}</span>;
}

function EditField({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  const cls = "w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]";
  return (
    <div>
      <label className="text-xs text-[var(--color-brand-muted)] mb-1 block">{label}</label>
      {textarea
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className={cls} />
        : <input value={value} onChange={e => onChange(e.target.value)} className={cls} />}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[var(--color-brand-muted)]">{label}</span>
      <span className="text-xs font-medium text-[var(--color-brand-dark)]">{value}</span>
    </div>
  );
}

function EmptyState({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-[var(--color-pirai-50)] flex items-center justify-center mb-4">
        <Building2 className="w-7 h-7 text-[var(--color-pirai-300)]" />
      </div>
      <p className="font-semibold text-[var(--color-brand-dark)] text-sm">{label}</p>
      <p className="text-xs text-[var(--color-brand-muted)] mt-1 max-w-xs">{sub}</p>
    </div>
  );
}
