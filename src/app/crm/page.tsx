'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface Empresa {
  id: string;
  name: string;
  industry?: string;
  status?: string;
  priority?: string;
  numActividades?: number;
  numContactos?: number;
  ultimaActividad?: string;
  notes?: string;
  website?: string;
  country?: string;
}

interface Contacto {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  linkedinUrl?: string;
  stage?: string;
  empresaId?: string;
  country?: string;
  language?: string;
  notes?: string;
}

interface Evento {
  id: string;
  name: string;
  date?: string;
  time?: string;
  type?: string;
  country?: string;
  city?: string;
  details?: string;
}

const STATUS_COLORS: Record<string, string> = {
  investigando: 'bg-[var(--color-turquesa-100)] text-turquesa-700',
  contactado: 'bg-turquesa-100 text-turquesa-700',
  'en conversación': 'bg-pirai-100 text-pirai-700',
  'sin respuesta': 'bg-[var(--color-brand-gray)] text-gray-600',
  descartado: 'bg-red-100 text-red-500',
  entrevista: 'bg-pirai-100 text-pirai-700',
  oferta: 'bg-orange-100 text-orange-700',
  cliente: 'bg-pirai-100 text-pirai-700',
};

const STAGE_LABELS: Record<string, string> = {
  sin_contactar: 'Sin contactar',
  primer_contacto: 'Primer contacto',
  seguimiento: 'Seguimiento',
  respuesta_recibida: 'Respuesta recibida',
  entrevista: 'Entrevista',
  oferta: 'Oferta recibida',
  nuevo_cliente: 'Nuevo cliente',
  descartado: 'No avanzó',
};

export default function CRMPage() {
  const [tab, setTab] = useState<'empresas' | 'contactos' | 'networking'>('empresas');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [empresaFilter, setEmpresaFilter] = useState('todas');
  const [empresaSearch, setEmpresaSearch] = useState('');
  const [contactoSearch, setContactoSearch] = useState('');
  const [profileData, setProfileData] = useState<{ stage?: string }>({});

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    async function loadData() {
      try {
        const res = await fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId!)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.empresas) setEmpresas(data.empresas);
        if (data.contactos) setContactos(data.contactos);
        if (data.events) setEventos(data.events);
        if (data.profileData) setProfileData(data.profileData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const isBiz = ['emprendedor', 'freelancer', 'empresa'].includes(profileData?.stage || '');

  const filteredEmpresas = empresas.filter(e => {
    const matchSearch = !empresaSearch || e.name.toLowerCase().includes(empresaSearch.toLowerCase());
    const matchFilter =
      empresaFilter === 'todas' ? true :
      empresaFilter === 'activas' ? ['contactado', 'en conversación', 'entrevista', 'oferta'].includes(e.status || '') :
      empresaFilter === 'clientes' ? e.status === 'cliente' :
      empresaFilter === 'investigando' ? e.status === 'investigando' : true;
    return matchSearch && matchFilter;
  });

  const filteredContactos = contactos.filter(c =>
    !contactoSearch || c.name.toLowerCase().includes(contactoSearch.toLowerCase())
  );

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">CRM</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-brand-gray)] rounded-xl p-1 mb-6 w-fit">
          {([
            { key: 'empresas', label: isBiz ? 'Clientes potenciales' : 'Empresas' },
            { key: 'contactos', label: 'Contactos' },
            { key: 'networking', label: 'Networking & Eventos' },
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
            <div className="w-6 h-6 border-2 border-pirai-200 border-t-pirai-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* EMPRESAS TAB */}
            {tab === 'empresas' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={empresaSearch}
                    onChange={e => setEmpresaSearch(e.target.value)}
                    placeholder="Buscar empresa..."
                    className="border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 w-64"
                  />
                  <div className="flex gap-1">
                    {['todas', 'activas', 'clientes', 'investigando'].map(f => (
                      <button
                        key={f}
                        onClick={() => setEmpresaFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                          empresaFilter === f
                            ? 'bg-pirai-600 text-white'
                            : 'bg-[var(--color-brand-gray)] text-[var(--color-brand-muted)] hover:bg-gray-200'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-[var(--color-brand-muted)] ml-auto">{filteredEmpresas.length} empresas</span>
                </div>

                <div className="bg-white rounded-xl border border-[var(--color-brand-border)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Empresa</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Industria</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Estado</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Prioridad</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Actividades</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Última</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-brand-border)]">
                      {filteredEmpresas.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-brand-muted)] text-sm">
                            No hay empresas en este filtro
                          </td>
                        </tr>
                      ) : (
                        filteredEmpresas.map(e => (
                          <tr key={e.id} className="hover:bg-[var(--color-brand-surface)] transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-[var(--color-brand-dark)]">{e.name}</p>
                              {e.country && <p className="text-xs text-[var(--color-brand-muted)]">{e.country}</p>}
                            </td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{e.industry || '—'}</td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[e.status || ''] || 'bg-[var(--color-brand-gray)] text-gray-600'}`}>
                                {e.status || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                e.priority === 'alta' ? 'bg-red-100 text-red-700' :
                                e.priority === 'media' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-[var(--color-brand-gray)] text-gray-600'
                              }`}>
                                {e.priority || 'media'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{e.numActividades ?? 0}</td>
                            <td className="px-4 py-3 text-[var(--color-brand-muted)]">{e.ultimaActividad || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CONTACTOS TAB */}
            {tab === 'contactos' && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="text"
                    value={contactoSearch}
                    onChange={e => setContactoSearch(e.target.value)}
                    placeholder="Buscar contacto..."
                    className="border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 w-64"
                  />
                  <span className="text-xs text-[var(--color-brand-muted)] ml-auto">{filteredContactos.length} contactos</span>
                </div>

                <div className="bg-white rounded-xl border border-[var(--color-brand-border)] overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]">
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Nombre</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Cargo</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Etapa</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">País</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-brand-border)]">
                      {filteredContactos.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-brand-muted)] text-sm">
                            No hay contactos todavía
                          </td>
                        </tr>
                      ) : (
                        filteredContactos.map(c => {
                          const empresa = empresas.find(e => e.id === c.empresaId);
                          return (
                            <tr key={c.id} className="hover:bg-[var(--color-brand-surface)] transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-medium text-[var(--color-brand-dark)]">{c.name}</p>
                                {empresa && <p className="text-xs text-[var(--color-brand-muted)]">{empresa.name}</p>}
                              </td>
                              <td className="px-4 py-3 text-[var(--color-brand-muted)]">{c.title || '—'}</td>
                              <td className="px-4 py-3 text-[var(--color-brand-muted)]">{c.email || '—'}</td>
                              <td className="px-4 py-3">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-turquesa-100 text-turquesa-700">
                                  {STAGE_LABELS[c.stage || ''] || c.stage || '—'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-[var(--color-brand-muted)]">{c.country || '—'}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* NETWORKING TAB */}
            {tab === 'networking' && (
              <div>
                <div className="mb-4">
                  <h2 className="font-semibold text-[var(--color-brand-dark)]">Eventos de networking</h2>
                  <p className="text-sm text-[var(--color-brand-muted)] mt-0.5">Registrá eventos y hacé seguimiento de los contactos que conociste</p>
                </div>

                {eventos.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-12 text-center">
                    <p className="text-4xl mb-3">📅</p>
                    <p className="font-semibold text-[var(--color-brand-dark)]">No hay eventos todavía</p>
                    <p className="text-sm text-[var(--color-brand-muted)] mt-1">Usá la app móvil para agregar eventos de networking</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {eventos.map(ev => (
                      <div key={ev.id} className="bg-white rounded-xl border border-[var(--color-brand-border)] p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-[var(--color-brand-dark)]">{ev.name}</h3>
                          {ev.type && (
                            <span className="text-xs bg-pirai-100 text-pirai-700 px-2 py-0.5 rounded-full font-medium capitalize">
                              {ev.type}
                            </span>
                          )}
                        </div>
                        {ev.date && <p className="text-sm text-[var(--color-brand-muted)]">📅 {ev.date}{ev.time ? ` a las ${ev.time}` : ''}</p>}
                        {(ev.city || ev.country) && (
                          <p className="text-sm text-[var(--color-brand-muted)]">📍 {[ev.city, ev.country].filter(Boolean).join(', ')}</p>
                        )}
                        {ev.details && <p className="text-sm text-[var(--color-brand-muted)] mt-2 line-clamp-2">{ev.details}</p>}
                      </div>
                    ))}
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
