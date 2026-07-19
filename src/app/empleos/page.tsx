'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserId } from '@/lib/auth';
import { api } from '@/lib/api';
import { Loader2, Search, ExternalLink, MapPin, Building2, X, CheckCircle2, Plus } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description?: string;
  url: string;
  logo?: string;
  posted?: string;
  source: string;
}

interface Postulacion {
  id: string;
  empresaNombre: string;
  notas: string;
  fecha: string;
  respuesta: boolean;
  empresaId?: string;
}

interface Prospect {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  location?: string;
  website?: string;
  description?: string;
  size?: string;
  logo_url?: string;
}

const COUNTRIES = [
  { value: '', label: 'Todo el mundo' },
  { value: 'remote', label: 'Solo remoto' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'spain', label: 'España' },
  { value: 'mexico', label: 'México' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'chile', label: 'Chile' },
  { value: 'usa', label: 'Estados Unidos' },
];

const INDUSTRIES = [
  'Software Development', 'Marketing', 'Sales', 'Design', 'Data', 'Finance / Legal',
  'Human Resources', 'Customer Service', 'Product', 'DevOps / Sysadmin',
  'Business & Management', 'Writing', 'Otra',
];

export default function EmpleosPage() {
  const [isBizUser, setIsBizUser] = useState<boolean | null>(null);
  const userId = getUserId();

  useEffect(() => {
    if (!userId) { setIsBizUser(false); return; }

    const BIZ = ['emprendedor', 'freelancer', 'empresa'];

    const loadStage = () =>
      fetch(`/api/user-record?userId=${encodeURIComponent(userId)}`)
        .then(r => r.json())
        .then(d => {
          const fields = d?.record?.fields ?? {};
          let stage = fields.stage ?? '';
          if (!stage && fields.onboarding_answers) {
            try { stage = JSON.parse(fields.onboarding_answers).stage ?? ''; } catch { /* */ }
          }
          setIsBizUser(BIZ.includes(stage));
        })
        .catch(() => setIsBizUser(false));

    loadStage();

    // When user saves profile on /perfil, update view without reload
    const handler = (e: Event) => setIsBizUser(BIZ.includes((e as CustomEvent<string>).detail ?? ''));
    window.addEventListener('pirai:stage-changed', handler);
    return () => window.removeEventListener('pirai:stage-changed', handler);
  }, [userId]);

  if (isBizUser === null) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-full py-32">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pirai-500)]" />
        </div>
      </AppShell>
    );
  }

  return isBizUser
    ? <ProspectosView userId={userId} />
    : <EmpleosView userId={userId} />;
}

// ─── PROSPECTOS (emprendedores) ───────────────────────────────────────────────

function ProspectosView({ userId }: { userId: string | null }) {
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const search = async () => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch('/api/companies/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, industry, country }),
      }).then(r => r.json());
      if (res.error) throw new Error(res.error);
      setResults(res.companies || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const addToPipeline = async (p: Prospect) => {
    if (!userId) return;
    try {
      await fetch('/api/crm/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: p.name,
          status: 'investigando',
          priority: 'media',
          notes: p.description ?? '',
          country: p.country ?? p.location ?? '',
          industry: p.industry ?? '',
          website: p.website ?? '',
        }),
      });
      showToast(`✓ ${p.name} agregada al pipeline`);
    } catch {
      showToast('Error al agregar');
    }
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-screen">
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-[var(--color-brand-border)] p-6">
            <h1 className="text-xl font-bold text-[var(--color-brand-dark)] mb-1">Prospectos</h1>
            <p className="text-sm text-[var(--color-brand-muted)] mb-4">Encontrá empresas que pueden ser tus clientes</p>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && search()}
                    placeholder="Nombre de empresa..."
                    className="w-full pl-9 pr-4 py-2.5 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
                  />
                </div>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-white"
                >
                  <option value="">Todas las industrias</option>
                  {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <select
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  className="border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-white"
                >
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button
                  onClick={search}
                  disabled={loading}
                  className="bg-[var(--color-pirai-500)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-4">{error}</div>}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-[var(--color-brand-muted)]">
                <Loader2 className="w-6 h-6 animate-spin mb-3 text-[var(--color-pirai-500)]" />
                <p className="text-sm">Buscando prospectos...</p>
              </div>
            ) : searched && results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--color-brand-muted)]">
                <Building2 className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Sin resultados</p>
                <p className="text-xs mt-1">Probá con otros filtros.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-w-3xl">
                {results.map(p => (
                  <div key={p.id} className="bg-white border border-[var(--color-brand-border)] rounded-xl p-4 flex items-start gap-3">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-white border border-gray-100 shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center shrink-0 text-[var(--color-pirai-600)] font-bold text-sm">
                        {(p.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[var(--color-brand-dark)]">{p.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5">
                        {p.industry && <span className="text-xs bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] px-2 py-0.5 rounded-full">{p.industry}</span>}
                        {(p.country || p.location) && <span className="text-xs text-gray-400 flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.country || p.location}</span>}
                        {p.size && <span className="text-xs text-gray-400">{p.size} emp.</span>}
                      </div>
                      {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                      {p.website && <p className="text-xs text-[var(--color-pirai-600)] mt-0.5 truncate">{p.website}</p>}
                    </div>
                    <button
                      onClick={() => addToPipeline(p)}
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)] border border-[var(--color-pirai-200)] hover:bg-[var(--color-pirai-100)] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Pipeline
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-brand-dark)] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}
    </AppShell>
  );
}

// ─── EMPLEOS (buscadores de trabajo) ─────────────────────────────────────────

function EmpleosView({ userId }: { userId: string | null }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [results, setResults] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Job | null>(null);
  const [toast, setToast] = useState('');
  const [tab, setTab] = useState<'buscar' | 'postulaciones'>('buscar');
  const [postulaciones, setPostulaciones] = useState<Postulacion[]>([]);
  const [loadingPostulaciones, setLoadingPostulaciones] = useState(false);
  const [piraiPostings, setPiraiPostings] = useState<Job[]>([]);
  const searchRef = useRef(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const search = useCallback(async (loadMore = false) => {
    if (searchRef.current) return;
    searchRef.current = true;
    const currentOffset = loadMore ? offset : 0;
    setLoading(true);
    setError('');
    if (!loadMore) setResults([]);
    try {
      const res = await api.post<{ results: Job[]; hasMore: boolean }>('/api/jobs/search', {
        keywords: query,
        country,
        mode: 'jobs',
        offset: currentOffset,
        userId,
      });
      setResults(prev => loadMore ? [...prev, ...(res.results ?? [])] : (res.results ?? []));
      setHasMore(res.hasMore ?? false);
      setOffset(currentOffset + (res.results?.length ?? 0));
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error en la búsqueda');
    } finally {
      setLoading(false);
      searchRef.current = false;
    }
  }, [query, country, offset, userId]);

  const loadPostulaciones = useCallback(async () => {
    if (!userId) return;
    setLoadingPostulaciones(true);
    try {
      const res = await fetch(`/api/bootstrap?userId=${encodeURIComponent(userId)}&diagnosis=&stage=`).then(r => r.json());
      const acts: Array<{ id: string; tipo: string; notas?: string; fecha?: string; respuesta?: boolean; empresaId?: string; empresaNombre?: string }> = res.activities ?? [];
      setPostulaciones(acts.filter(a => a.tipo === 'postulacion').map(a => ({
        id: a.id,
        empresaNombre: a.empresaNombre ?? '',
        notas: a.notas ?? '',
        fecha: a.fecha ?? '',
        respuesta: a.respuesta ?? false,
        empresaId: a.empresaId,
      })));
    } catch { /* */ }
    finally { setLoadingPostulaciones(false); }
  }, [userId]);

  useEffect(() => {
    fetch('/api/job-postings')
      .then(r => r.json())
      .then(d => {
        setPiraiPostings((d.results || []).map((p: { id: string; title: string; company: string; location: string; description?: string; applyUrl: string; logo?: string; createdAt?: string }) => ({
          id: `pirai_${p.id}`,
          title: p.title,
          company: p.company,
          location: p.location,
          description: p.description,
          url: p.applyUrl,
          logo: p.logo,
          posted: p.createdAt,
          source: 'pirai',
        })));
      })
      .catch(() => {});
  }, []);

  useEffect(() => { search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (tab === 'postulaciones') loadPostulaciones(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async (job: Job) => {
    window.open(job.url, '_blank', 'noopener,noreferrer');
    if (!userId) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      const empresaRes = await fetch('/api/crm/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: job.company, status: 'investigando', priority: 'media', notes: `${job.title}\n${job.url}`, country: job.location }),
      }).then(r => r.json());
      await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, tipo: 'postulacion', empresaId: empresaRes.id ?? empresaRes.empresa?.id ?? null, fecha: today, notas: `Apliqué a: ${job.title}` }),
      });
      showToast(`✓ Postulación a ${job.company} registrada en tu CRM`);
    } catch {
      showToast('✓ Abriendo postulación...');
    }
  };

  return (
    <AppShell>
      <div className="flex h-full min-h-screen">
        <div className="flex-1 flex flex-col border-r border-[var(--color-brand-border)]">
          <div className="bg-white border-b border-[var(--color-brand-border)] p-6">
            <h1 className="text-xl font-bold text-[var(--color-brand-dark)] mb-4">Empleos remotos</h1>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setTab('buscar')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === 'buscar' ? 'bg-[var(--color-pirai-500)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Buscar</button>
              <button onClick={() => setTab('postulaciones')} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === 'postulaciones' ? 'bg-[var(--color-pirai-500)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                Mis postulaciones {postulaciones.length > 0 ? `(${postulaciones.length})` : ''}
              </button>
            </div>
            {tab === 'buscar' && (
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} placeholder="Rol, empresa, tecnología..." className="w-full pl-9 pr-4 py-2.5 border border-[var(--color-brand-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
                  {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
                </div>
                <select value={country} onChange={e => setCountry(e.target.value)} className="border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] bg-white">
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <button onClick={() => search()} disabled={loading} className="bg-[var(--color-pirai-500)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-60 transition-colors flex items-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {tab === 'buscar' ? (
              <>
                {error && <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-4">{error}</div>}
                {loading && results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-[var(--color-brand-muted)]">
                    <Loader2 className="w-6 h-6 animate-spin mb-3 text-[var(--color-pirai-500)]" />
                    <p className="text-sm">Buscando empleos...</p>
                  </div>
                ) : searched && results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--color-brand-muted)]">
                    <Search className="w-10 h-10 mb-3 opacity-30" />
                    <p className="text-sm font-medium">Sin resultados</p>
                    <p className="text-xs mt-1">Probá con otras palabras clave o cambiá el país.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const terms = query.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
                      const filtered = piraiPostings.filter(p => {
                        const hay = `${p.title} ${p.company} ${p.description} ${p.location}`.toLowerCase();
                        const keyMatch = !terms.length || terms.every(t => hay.includes(t));
                        const countryMatch = !country || country === 'remote' ? true : (p.location || '').toLowerCase().includes(country.toLowerCase());
                        return keyMatch && countryMatch;
                      });
                      return [...filtered, ...results];
                    })().map(job => (
                      <JobRow key={job.id} job={job} active={selected?.id === job.id} onClick={() => setSelected(job)} />
                    ))}
                    {hasMore && (
                      <button onClick={() => search(true)} disabled={loading} className="w-full py-3 text-sm font-semibold text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-50)] rounded-xl transition-colors disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cargar más resultados'}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              loadingPostulaciones ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-5 h-5 animate-spin text-[var(--color-pirai-500)]" /></div>
              ) : postulaciones.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-[var(--color-brand-muted)]">
                  <CheckCircle2 className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Todavía no aplicaste a ningún empleo</p>
                  <p className="text-xs mt-1">Cuando hagas clic en &quot;Postularme&quot;, se guarda acá automáticamente.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {postulaciones.map(p => (
                    <div key={p.id} className="bg-white border border-[var(--color-brand-border)] rounded-xl p-3 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-[var(--color-pirai-400)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{p.empresaNombre}</p>
                        <p className="text-xs text-[var(--color-brand-muted)] truncate">{p.notas}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{p.fecha}</p>
                      </div>
                      {p.respuesta && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 shrink-0">Respondió</span>}
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        <div className="w-[480px] bg-white overflow-auto">
          {selected ? (
            <JobDetail job={selected} onClose={() => setSelected(null)} onApply={handleApply} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-brand-muted)] p-8 text-center">
              <Briefcase className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm">Seleccioná un empleo para ver los detalles</p>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--color-brand-dark)] text-white px-5 py-3 rounded-2xl text-sm font-semibold shadow-xl z-50 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}
    </AppShell>
  );
}

function JobRow({ job, active, onClick }: { job: Job; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${active ? 'bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)]' : 'bg-white border border-transparent hover:border-[var(--color-brand-border)] hover:shadow-sm'}`}>
      {job.logo ? (
        <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-xl object-contain border border-gray-100 bg-white shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5 text-[var(--color-pirai-300)]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-[var(--color-brand-dark)] truncate">{job.title}</p>
          {job.source === 'pirai' && (
            <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] border border-[var(--color-pirai-200)]">Piraí</span>
          )}
        </div>
        <p className="text-xs text-[var(--color-brand-muted)] truncate">{job.company}</p>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] text-gray-400 truncate">{job.location}</span>
        </div>
      </div>
    </button>
  );
}

function JobDetail({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply: (job: Job) => void }) {
  const [applying, setApplying] = useState(false);
  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          {job.logo ? (
            <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-contain border border-gray-100" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-[var(--color-pirai-50)] flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[var(--color-pirai-300)]" />
            </div>
          )}
          <div>
            <h2 className="font-bold text-[var(--color-brand-dark)] leading-tight">{job.title}</h2>
            <p className="text-sm text-[var(--color-brand-muted)]">{job.company}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg shrink-0"><X className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="flex items-center gap-2 mb-5">
        <MapPin className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-[var(--color-brand-muted)]">{job.location}</span>
        {job.posted && <><span className="text-gray-300">·</span><span className="text-xs text-gray-400">{new Date(job.posted).toLocaleDateString('es')}</span></>}
      </div>
      <button
        onClick={async () => { setApplying(true); await onApply(job); setApplying(false); }}
        disabled={applying}
        className="w-full mb-6 flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] transition-colors disabled:opacity-60"
      >
        {applying ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
        Postularme
      </button>
      {job.description && (
        <div>
          <h3 className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-3">Descripción</h3>
          <div className="text-sm text-[var(--color-brand-dark)] leading-relaxed prose prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1 [&_h2]:font-bold [&_h2]:text-base [&_h2]:mt-4 [&_h3]:font-semibold [&_h3]:mt-3 [&_p]:mb-2 [&_strong]:font-semibold" dangerouslySetInnerHTML={{ __html: job.description }} />
        </div>
      )}
    </div>
  );
}

function Briefcase({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" /></svg>;
}
