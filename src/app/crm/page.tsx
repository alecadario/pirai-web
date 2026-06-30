'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback } from 'react';
import { getUserId } from '@/lib/auth';
import { api } from '@/lib/api';
import {
  Loader2, Building2, Users, Calendar, Plus, Search,
  ChevronRight, ExternalLink, Mail, Link2, X,
} from 'lucide-react';

interface Empresa {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  country?: string;
  logo_url?: string;
  website?: string;
  notes?: string;
}

interface Contacto {
  id: string;
  name: string;
  title?: string;
  email?: string;
  linkedinUrl?: string;
  empresaNombre?: string;
  stage?: string;
}

interface Evento {
  id: string;
  name: string;
  date?: string;
  type?: string;
  city?: string;
  country?: string;
}

type Tab = 'empresas' | 'contactos' | 'networking';

const STATUS_COLORS: Record<string, string> = {
  investigando: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  'en conversación': 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]',
  'sin respuesta': 'bg-gray-100 text-gray-500',
  descartado: 'bg-red-100 text-red-500',
  entrevista: 'bg-purple-100 text-purple-700',
  oferta: 'bg-orange-100 text-orange-700',
};

export default function CRMPage() {
  const [tab, setTab] = useState<Tab>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Empresa | Contacto | null>(null);
  const userId = getUserId();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await api.get<{
        companies: Empresa[];
        contacts: Contacto[];
        events?: Evento[];
      }>(`/api/bootstrap?userId=${userId}`);
      setEmpresas(res.companies ?? []);
      setContactos(res.contacts ?? []);
      setEventos(res.events ?? []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const TABS = [
    { id: 'empresas' as Tab, label: 'Empresas', icon: Building2, count: empresas.length },
    { id: 'contactos' as Tab, label: 'Contactos', icon: Users, count: contactos.length },
    { id: 'networking' as Tab, label: 'Networking', icon: Calendar, count: eventos.length },
  ];

  const filteredEmpresas = empresas.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase()) || e.industry?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredContactos = contactos.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.empresaNombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppShell>
      <div className="flex h-full min-h-screen">
        {/* Left panel */}
        <div className="flex-1 flex flex-col border-r border-[var(--color-brand-border)]">
          {/* Header */}
          <div className="bg-white border-b border-[var(--color-brand-border)] px-6 pt-6 pb-0">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">CRM</h1>
              <button className="flex items-center gap-2 bg-[var(--color-pirai-500)] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[var(--color-pirai-600)] transition-colors">
                <Plus className="w-4 h-4" /> Nuevo
              </button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-4 py-2 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-[var(--color-brand-gray)]"
              />
              {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {TABS.map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => { setTab(id); setSelected(null); setSearch(''); }}
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
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 animate-spin text-[var(--color-pirai-500)]" /></div>
            ) : tab === 'empresas' ? (
              filteredEmpresas.length === 0 ? (
                <EmptyState label="Sin empresas aún" sub="Agregá la primera empresa a tu pipeline." />
              ) : filteredEmpresas.map(emp => (
                <EmpresaRow key={emp.id} emp={emp} active={(selected as Empresa)?.id === emp.id} onClick={() => setSelected(emp)} />
              ))
            ) : tab === 'contactos' ? (
              filteredContactos.length === 0 ? (
                <EmptyState label="Sin contactos aún" sub="Agregá contactos para hacer seguimiento." />
              ) : filteredContactos.map(c => (
                <ContactoRow key={c.id} c={c} active={(selected as Contacto)?.id === c.id} onClick={() => setSelected(c)} />
              ))
            ) : (
              eventos.length === 0 ? (
                <EmptyState label="Sin eventos aún" sub="Registrá eventos de networking para hacer seguimiento." />
              ) : eventos.map(ev => (
                <EventoRow key={ev.id} ev={ev} onClick={() => setSelected(ev as unknown as Empresa)} />
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="w-96 bg-white overflow-auto">
          {selected ? (
            tab === 'empresas' ? (
              <EmpresaDetail emp={selected as Empresa} onClose={() => setSelected(null)} />
            ) : (
              <ContactoDetail c={selected as Contacto} onClose={() => setSelected(null)} />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-[var(--color-brand-muted)] text-sm p-8 text-center">
              Seleccioná un elemento para ver sus detalles
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

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
      </div>
      {emp.status && (
        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 ${STATUS_COLORS[emp.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {emp.status}
        </span>
      )}
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
      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
    </button>
  );
}

function EventoRow({ ev, onClick }: { ev: Evento; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-3 rounded-xl text-left bg-white border border-transparent hover:border-[var(--color-brand-border)] hover:shadow-sm transition-all">
      <div className="w-10 h-10 rounded-xl bg-[var(--color-turquesa-50)] flex items-center justify-center shrink-0">
        <Calendar className="w-5 h-5 text-[var(--color-turquesa-500)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{ev.name}</p>
        <p className="text-xs text-[var(--color-brand-muted)]">{[ev.date, ev.city, ev.country].filter(Boolean).join(' · ')}</p>
      </div>
    </button>
  );
}

function EmpresaDetail({ emp, onClose }: { emp: Empresa; onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
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
            <p className="text-xs text-[var(--color-brand-muted)]">{emp.industry}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      {emp.status && (
        <div className="mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[emp.status] ?? 'bg-gray-100 text-gray-500'}`}>{emp.status}</span>
        </div>
      )}

      <div className="space-y-3 text-sm">
        {emp.country && <InfoRow label="País" value={emp.country} />}
        {emp.website && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-brand-muted)] text-xs">Web</span>
            <a href={emp.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[var(--color-pirai-600)] text-xs hover:underline">
              {emp.website} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
        {emp.notes && (
          <div>
            <p className="text-xs text-[var(--color-brand-muted)] mb-1">Notas</p>
            <p className="text-sm text-[var(--color-brand-dark)] bg-[var(--color-brand-gray)] rounded-xl p-3 leading-relaxed">{emp.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ContactoDetail({ c, onClose }: { c: Contacto; onClose: () => void }) {
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--color-pirai-400)] to-[var(--color-turquesa-500)] flex items-center justify-center text-white font-bold">
            {c.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-[var(--color-brand-dark)]">{c.name}</h2>
            <p className="text-xs text-[var(--color-brand-muted)]">{[c.title, c.empresaNombre].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
      </div>

      <div className="space-y-3">
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
        {c.stage && (
          <div className="mt-3">
            <span className="text-xs text-[var(--color-brand-muted)]">Etapa: </span>
            <span className="text-xs font-semibold text-[var(--color-brand-dark)]">{c.stage}</span>
          </div>
        )}
      </div>
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
