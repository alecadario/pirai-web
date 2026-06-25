'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId, getUserEmail, getUserName } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface ProfileData {
  stage?: string;
  accountType?: string;
  passion?: string;
  impact?: string;
  ideal_day?: string;
  services_description?: string;
  fullName?: string;
  phone?: string;
  linkedin_url?: string;
  city?: string;
  country?: string;
  age_range?: string;
}

const STAGE_LABELS: Record<string, string> = {
  buscando_trabajo: 'Buscando trabajo',
  en_transicion: 'En transición profesional',
  creciendo: 'Creciendo en mi carrera',
  emprendedor: 'Emprendedor',
  freelancer: 'Freelancer',
  empresa: 'Empresa',
};

export default function PerfilPage() {
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cvText, setCvText] = useState<string | null>(null);
  const [profileAnalysis, setProfileAnalysis] = useState<{ chances_pct?: number; lo_que_sabemos?: string } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const userEmail = getUserEmail();
  const userName = getUserName();

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.profileData) {
          setProfileData(data.profileData);
          setFormData(data.profileData);
        }
        if (data.cvText) setCvText(data.cvText);
        if (data.profileAnalysis) setProfileAnalysis(data.profileAnalysis);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) return;
    setSaving(true);
    try {
      await fetch(`${API}/api/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });
      setProfileData(formData);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleAnalyze = async () => {
    const userId = getUserId();
    if (!userId) return;
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/api/analyze-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.analysis) setProfileAnalysis(data.analysis);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const completeness = [
    !!profileData.passion,
    !!profileData.impact,
    !!profileData.stage,
    !!cvText,
    !!profileData.services_description,
  ].filter(Boolean).length;
  const completenessPct = Math.round((completeness / 5) * 100);

  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">Mi Perfil</h1>
            <p className="text-[var(--color-brand-muted)] text-sm mt-1">Tu información profesional y marca personal</p>
          </div>
          {saved && <span className="text-sm text-pirai-600 font-medium">✓ Guardado</span>}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-pirai-200 border-t-pirai-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {/* Left — profile info */}
            <div className="col-span-2 space-y-5">
              {/* Basic info card */}
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-[var(--color-brand-dark)]">Información básica</h2>
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-sm text-pirai-600 font-medium hover:text-pirai-700"
                    >
                      ✏️ Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditing(false); setFormData(profileData); }}
                        className="text-sm text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="text-sm bg-pirai-600 text-white px-3 py-1 rounded-lg hover:bg-pirai-700 disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Nombre</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.fullName || userName || ''}
                          onChange={e => setFormData(f => ({ ...f, fullName: e.target.value }))}
                          className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                        />
                      ) : (
                        <p className="text-sm text-[var(--color-brand-dark)]">{profileData.fullName || userName || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Email</label>
                      <p className="text-sm text-[var(--color-brand-dark)]">{userEmail || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Ciudad</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.city || ''}
                          onChange={e => setFormData(f => ({ ...f, city: e.target.value }))}
                          className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                        />
                      ) : (
                        <p className="text-sm text-[var(--color-brand-dark)]">{profileData.city || '—'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">País</label>
                      {editing ? (
                        <input
                          type="text"
                          value={formData.country || ''}
                          onChange={e => setFormData(f => ({ ...f, country: e.target.value }))}
                          className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                        />
                      ) : (
                        <p className="text-sm text-[var(--color-brand-dark)]">{profileData.country || '—'}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">LinkedIn</label>
                    {editing ? (
                      <input
                        type="url"
                        value={formData.linkedin_url || ''}
                        onChange={e => setFormData(f => ({ ...f, linkedin_url: e.target.value }))}
                        placeholder="linkedin.com/in/..."
                        className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                      />
                    ) : profileData.linkedin_url ? (
                      <a href={profileData.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-pirai-600 hover:underline">{profileData.linkedin_url}</a>
                    ) : (
                      <p className="text-sm text-[var(--color-brand-muted)]">—</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Etapa profesional</label>
                    <p className="text-sm text-[var(--color-brand-dark)]">{STAGE_LABELS[profileData.stage || ''] || profileData.stage || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Marca personal */}
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Marca personal</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">¿Qué te apasiona?</label>
                    {editing ? (
                      <textarea
                        value={formData.passion || ''}
                        onChange={e => setFormData(f => ({ ...f, passion: e.target.value }))}
                        rows={2}
                        className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-[var(--color-brand-dark)]">{profileData.passion || '—'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">¿Qué impacto querés generar?</label>
                    {editing ? (
                      <textarea
                        value={formData.impact || ''}
                        onChange={e => setFormData(f => ({ ...f, impact: e.target.value }))}
                        rows={2}
                        className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 resize-none"
                      />
                    ) : (
                      <p className="text-sm text-[var(--color-brand-dark)]">{profileData.impact || '—'}</p>
                    )}
                  </div>
                  {(profileData.services_description || editing) && (
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Descripción de servicios / contexto profesional</label>
                      {editing ? (
                        <textarea
                          value={formData.services_description || ''}
                          onChange={e => setFormData(f => ({ ...f, services_description: e.target.value }))}
                          rows={3}
                          className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 resize-none"
                        />
                      ) : (
                        <p className="text-sm text-[var(--color-brand-dark)]">{profileData.services_description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CV status */}
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">CV</h2>
                {cvText ? (
                  <div className="bg-pirai-50 rounded-lg p-3 flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-pirai-700">CV cargado ✓</p>
                      <p className="text-xs text-pirai-600">{cvText.length} caracteres · Actualizado desde la app móvil</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                    <p className="text-sm text-amber-800">No hay CV cargado.</p>
                    <p className="text-xs text-amber-700 mt-1">Subí tu CV desde la app móvil de Piraí para mejores resultados.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              {/* Completeness */}
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">Completitud del perfil</h2>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-2 bg-[var(--color-brand-gray)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pirai-600 rounded-full transition-all duration-500"
                      style={{ width: `${completenessPct}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-pirai-600">{completenessPct}%</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Pasión', done: !!profileData.passion },
                    { label: 'Impacto', done: !!profileData.impact },
                    { label: 'Etapa', done: !!profileData.stage },
                    { label: 'CV cargado', done: !!cvText },
                    { label: 'Servicios / contexto', done: !!profileData.services_description },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-2 text-xs">
                      <span className={done ? 'text-pirai-600' : 'text-gray-300'}>{done ? '✓' : '○'}</span>
                      <span className={done ? 'text-[var(--color-brand-dark)]' : 'text-[var(--color-brand-muted)]'}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile analysis */}
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">Análisis de perfil</h2>
                {profileAnalysis ? (
                  <div className="space-y-3">
                    {profileAnalysis.chances_pct !== undefined && (
                      <div className="text-center">
                        <p className="text-3xl font-bold text-pirai-600">{profileAnalysis.chances_pct}%</p>
                        <p className="text-xs text-[var(--color-brand-muted)]">Score de posicionamiento</p>
                      </div>
                    )}
                    {profileAnalysis.lo_que_sabemos && (
                      <p className="text-xs text-[var(--color-brand-muted)] leading-relaxed">{profileAnalysis.lo_que_sabemos}</p>
                    )}
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing}
                      className="w-full text-xs text-pirai-600 font-medium hover:text-pirai-700 flex items-center justify-center gap-1"
                    >
                      {analyzing ? 'Analizando...' : '🔄 Regenerar análisis'}
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-3xl mb-2">✨</p>
                    <p className="text-xs text-[var(--color-brand-muted)] mb-3">Generá un análisis de tu perfil para ver tu score</p>
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing || completenessPct < 60}
                      className="w-full bg-pirai-600 text-white py-2 rounded-lg text-xs font-semibold hover:bg-pirai-700 disabled:opacity-50 transition-colors"
                    >
                      {analyzing ? 'Analizando...' : 'Generar análisis'}
                    </button>
                    {completenessPct < 60 && (
                      <p className="text-xs text-[var(--color-brand-muted)] mt-2">Completá más tu perfil primero</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
