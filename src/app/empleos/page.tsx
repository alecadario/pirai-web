'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect, useRef } from 'react';
import { getUserId } from '@/lib/auth';

const API = 'https://piraiapp.com';

const LATAM_COUNTRIES = ['Argentina', 'México', 'Colombia', 'Chile', 'Perú', 'Uruguay', 'Ecuador', 'Bolivia', 'Paraguay', 'Venezuela', 'Brasil', 'España', 'Estados Unidos'];
const INDUSTRIES = ['Tecnología', 'Marketing', 'Finanzas', 'Salud', 'Educación', 'Construcción', 'Retail', 'Consultoría', 'Energía', 'Medios', 'Otro'];

interface Job {
  id: string;
  title?: string;
  company?: string;
  location?: string;
  logo?: string;
  description?: string;
  url?: string;
  applyUrl?: string;
  salary?: string;
  modality?: string;
  industry?: string;
}

interface ProspectResult {
  id: string;
  name: string;
  industry?: string;
  country?: string;
  logo_url?: string;
  website?: string;
  description?: string;
  size?: string;
}

export default function EmpleosPage() {
  const [isBiz, setIsBiz] = useState(false);
  const [loading, setLoading] = useState(true);

  // Jobs state
  const [jobsQuery, setJobsQuery] = useState('');
  const [jobsCountry, setJobsCountry] = useState('');
  const [jobsResults, setJobsResults] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState('');
  const [jobsSearched, setJobsSearched] = useState(false);
  const [jobsHasMore, setJobsHasMore] = useState(false);
  const [jobsOffset, setJobsOffset] = useState(0);
  const [jobsToast, setJobsToast] = useState('');
  const searchingRef = useRef(false);

  // Prospect state
  const [prospectName, setProspectName] = useState('');
  const [prospectIndustry, setProspectIndustry] = useState('');
  const [prospectCountry, setProspectCountry] = useState('');
  const [prospectResults, setProspectResults] = useState<ProspectResult[]>([]);
  const [prospectLoading, setProspectLoading] = useState(false);
  const [prospectSearched, setProspectSearched] = useState(false);
  const [prospectError, setProspectError] = useState('');

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        const stage = data.profileData?.stage;
        setIsBiz(['emprendedor', 'freelancer', 'empresa'].includes(stage || ''));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg: string) => {
    setJobsToast(msg);
    setTimeout(() => setJobsToast(''), 3500);
  };

  const searchJobs = async (loadMore = false) => {
    if (searchingRef.current) return;
    searchingRef.current = true;
    const offset = loadMore ? jobsOffset : 0;
    setJobsLoading(true);
    setJobsError('');
    if (!loadMore) setJobsResults([]);
    try {
      const res = await fetch(`${API}/api/jobs/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: jobsQuery, country: jobsCountry, mode: 'jobs', offset }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al buscar');
      const results = data.results || [];
      setJobsResults(prev => loadMore ? [...prev, ...results] : results);
      setJobsHasMore(data.hasMore || false);
      setJobsOffset(offset + results.length);
      setJobsSearched(true);
    } catch (err) {
      setJobsError(err instanceof Error ? err.message : 'Error');
    } finally {
      setJobsLoading(false);
      searchingRef.current = false;
    }
  };

  const searchProspects = async () => {
    setProspectLoading(true);
    setProspectSearched(true);
    setProspectResults([]);
    setProspectError('');
    try {
      const res = await fetch(`${API}/api/companies/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: prospectName, industry: prospectIndustry, country: prospectCountry }),
      });
      const data = await res.json();
      if (data.error) { setProspectError(data.error); return; }
      setProspectResults(data.companies || []);
    } catch (e) {
      setProspectError(e instanceof Error ? e.message : 'Error');
    } finally {
      setProspectLoading(false);
    }
  };

  if (loading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center h-40">
          <div className="w-6 h-6 border-2 border-pirai-200 border-t-pirai-600 rounded-full animate-spin" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        {jobsToast && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-2xl shadow-xl">
            {jobsToast}
          </div>
        )}

        {isBiz ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">Prospectos</h1>
              <p className="text-[var(--color-brand-muted)] text-sm mt-1">Encontrá empresas que pueden ser tus clientes</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                value={prospectName}
                onChange={e => setProspectName(e.target.value)}
                placeholder="Nombre de empresa..."
                className="border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
              />
              <select
                value={prospectIndustry}
                onChange={e => setProspectIndustry(e.target.value)}
                className="border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 bg-white"
              >
                <option value="">Todas las industrias</option>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
              <select
                value={prospectCountry}
                onChange={e => setProspectCountry(e.target.value)}
                className="border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 bg-white"
              >
                <option value="">Todos los países</option>
                {LATAM_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={searchProspects}
              disabled={prospectLoading}
              className="bg-pirai-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-pirai-700 disabled:opacity-50 transition-colors mb-6"
            >
              {prospectLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Buscando...</>
              ) : (
                <>🔍 Buscar prospectos</>
              )}
            </button>

            {prospectError && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{prospectError}</div>
            )}

            {prospectSearched && !prospectLoading && (
              prospectResults.length === 0 ? (
                <div className="text-center py-12 text-[var(--color-brand-muted)] text-sm">
                  No se encontraron empresas. Probá con otros filtros.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {prospectResults.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-[var(--color-brand-border)] p-4">
                      <div className="flex items-start gap-3">
                        {p.logo_url ? (
                          <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded-xl object-contain bg-white border border-[var(--color-brand-border)] flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-pirai-100 flex items-center justify-center flex-shrink-0 text-pirai-700 font-bold text-sm">
                            {p.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--color-brand-dark)] text-sm">{p.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {p.industry && <span className="text-xs bg-pirai-50 text-pirai-700 px-2 py-0.5 rounded-full">{p.industry}</span>}
                            {p.country && <span className="text-xs text-[var(--color-brand-muted)]">📍 {p.country}</span>}
                          </div>
                          {p.description && <p className="text-xs text-[var(--color-brand-muted)] mt-1 line-clamp-2">{p.description}</p>}
                        </div>
                      </div>
                      <button
                        onClick={() => showToast(`${p.name} — agregá desde la app móvil`)}
                        className="mt-3 w-full bg-pirai-50 text-pirai-700 py-2 rounded-xl text-xs font-semibold hover:bg-pirai-100 transition-colors border border-pirai-200"
                      >
                        + Agregar al pipeline
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">Empleos</h1>
              <p className="text-[var(--color-brand-muted)] text-sm mt-1">Buscá por palabras clave</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={jobsQuery}
                onChange={e => setJobsQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchJobs()}
                placeholder="ej. marketing, ventas, remoto LATAM"
                className="border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
              />
              <select
                value={jobsCountry}
                onChange={e => setJobsCountry(e.target.value)}
                className="border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 bg-white"
              >
                <option value="">Todos los países</option>
                <option value="remote">🌐 Remoto</option>
                <option disabled>──────────</option>
                {LATAM_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <button
              onClick={() => searchJobs()}
              disabled={jobsLoading}
              className="bg-pirai-600 text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-pirai-700 disabled:opacity-50 transition-colors mb-6"
            >
              {jobsLoading ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Buscando...</>
              ) : (
                <>💼 Buscar empleos</>
              )}
            </button>

            {jobsError && (
              <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm mb-4">{jobsError}</div>
            )}

            {jobsSearched && !jobsLoading && jobsResults.length === 0 && (
              <div className="text-center py-12 text-[var(--color-brand-muted)] text-sm">
                No encontramos resultados. Probá con otra búsqueda.
              </div>
            )}

            {jobsResults.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider">Empleos remotos ({jobsResults.length})</p>
                {jobsResults.map(job => (
                  <div key={job.id} className="bg-white rounded-xl border border-[var(--color-brand-border)] p-4 flex gap-4 items-start">
                    {job.logo ? (
                      <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-xl object-contain bg-white border border-[var(--color-brand-border)] flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-pirai-50 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl">💼</span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-brand-dark)]">{job.title}</p>
                      <p className="text-pirai-600 text-sm font-medium mt-0.5">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {job.location && <span className="text-xs text-[var(--color-brand-muted)]">📍 {job.location}</span>}
                        {job.salary && <span className="text-xs text-[var(--color-brand-muted)]">💰 {job.salary}</span>}
                        <span className="text-xs bg-turquesa-50 text-turquesa-600 px-2 py-0.5 rounded-full">Remotive</span>
                      </div>
                      {job.description && <p className="text-xs text-[var(--color-brand-muted)] mt-2 line-clamp-2">{job.description}</p>}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {(job.url || job.applyUrl) && (
                        <a
                          href={job.applyUrl || job.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-pirai-600 text-white rounded-lg text-xs font-semibold hover:bg-pirai-700 transition-colors text-center"
                        >
                          Aplicar ↗
                        </a>
                      )}
                      <button
                        onClick={() => showToast(`"${job.company}" — agregá desde la app`)}
                        className="px-3 py-2 border border-pirai-200 text-pirai-700 rounded-lg text-xs font-semibold hover:bg-pirai-50 transition-colors"
                      >
                        + Pipeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {jobsHasMore && (
              <button
                onClick={() => searchJobs(true)}
                disabled={jobsLoading}
                className="w-full mt-4 py-3 rounded-xl border border-pirai-200 text-pirai-600 font-semibold text-sm hover:bg-pirai-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {jobsLoading ? <div className="w-4 h-4 border-2 border-pirai-200 border-t-pirai-600 rounded-full animate-spin" /> : 'Ver más empleos'}
              </button>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
