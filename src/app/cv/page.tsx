'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface CVGenForm {
  rol: string;
  empresa: string;
  idioma: string;
  genero: string;
  contexto: string;
  jobDescription: string;
  wantsCoverLetter: boolean;
  contactName: string;
  isGeneric: boolean;
  colorTheme: string;
}

interface CVGenResult {
  cv?: { resumen?: string; experiencia?: Array<{ empresa?: string; rol?: string; descripcion?: string; desde?: string; hasta?: string }>; habilidades?: string[]; educacion?: Array<{ institucion?: string; titulo?: string; desde?: string; hasta?: string }> };
  coverLetter?: string;
  userName?: string;
  userEmail?: string;
}

export default function CVPage() {
  const [form, setForm] = useState<CVGenForm>({
    rol: '',
    empresa: '',
    idioma: 'es',
    genero: 'femenino',
    contexto: '',
    jobDescription: '',
    wantsCoverLetter: false,
    contactName: '',
    isGeneric: true,
    colorTheme: 'esmeralda',
  });
  const [result, setResult] = useState<CVGenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resultTab, setResultTab] = useState<'cv' | 'carta'>('cv');
  const [copied, setCopied] = useState(false);
  const [hasCvText, setHasCvText] = useState(false);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;
    fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        if (data.cvText) setHasCvText(true);
      })
      .catch(console.error);
  }, []);

  const handleGenerate = async () => {
    const userId = getUserId();
    if (!userId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API}/api/generate-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error generando CV');
      setResult(data);
      setResultTab('cv');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const cvText = result?.cv ? [
    result.cv.resumen,
    ...(result.cv.experiencia || []).map(e => `${e.rol || ''} @ ${e.empresa || ''}\n${e.descripcion || ''}`),
    (result.cv.habilidades || []).join(', '),
  ].filter(Boolean).join('\n\n') : '';

  return (
    <AppShell>
      <div className="p-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">CV con IA</h1>
          <p className="text-[var(--color-brand-muted)] text-sm mt-1">Generá un CV y carta de presentación personalizados</p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5 space-y-4">
              <h2 className="font-semibold text-[var(--color-brand-dark)]">Configuración</h2>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!form.isGeneric}
                  onChange={e => setForm(f => ({ ...f, isGeneric: !e.target.checked }))}
                  className="w-4 h-4 text-pirai-600 rounded"
                />
                <span className="text-sm text-[var(--color-brand-dark)]">Personalizar para una empresa específica</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Rol / Puesto</label>
                <input
                  type="text"
                  value={form.rol}
                  onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  placeholder="ej. Desarrollador Full Stack"
                  className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                />
              </div>

              {!form.isGeneric && (
                <div>
                  <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Empresa destino</label>
                  <input
                    type="text"
                    value={form.empresa}
                    onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                    placeholder="ej. Mercado Libre"
                    className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Idioma</label>
                  <select
                    value={form.idioma}
                    onChange={e => setForm(f => ({ ...f, idioma: e.target.value }))}
                    className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 bg-white"
                  >
                    <option value="es">Español</option>
                    <option value="en">Inglés</option>
                    <option value="pt">Portugués</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Género</label>
                  <select
                    value={form.genero}
                    onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}
                    className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 bg-white"
                  >
                    <option value="femenino">Femenino</option>
                    <option value="masculino">Masculino</option>
                    <option value="neutro">Neutro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Contexto adicional (opcional)</label>
                <textarea
                  value={form.contexto}
                  onChange={e => setForm(f => ({ ...f, contexto: e.target.value }))}
                  placeholder="Información adicional, logros especiales, qué querés destacar..."
                  rows={3}
                  className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-brand-dark)] mb-1">Descripción del puesto (opcional)</label>
                <textarea
                  value={form.jobDescription}
                  onChange={e => setForm(f => ({ ...f, jobDescription: e.target.value }))}
                  placeholder="Pegá aquí la descripción del trabajo para personalizar mejor el CV..."
                  rows={3}
                  className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pirai-400 resize-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.wantsCoverLetter}
                  onChange={e => setForm(f => ({ ...f, wantsCoverLetter: e.target.checked }))}
                  className="w-4 h-4 text-pirai-600 rounded"
                />
                <span className="text-sm text-[var(--color-brand-dark)]">Generar carta de presentación también</span>
              </label>

              {!hasCvText && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-700">
                    💡 Subí tu CV desde la app móvil para mejores resultados. Sin CV, generaremos uno basado en tu perfil.
                  </p>
                </div>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                onClick={handleGenerate}
                disabled={loading || !form.rol}
                className="w-full bg-pirai-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-pirai-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generando...</>
                ) : (
                  <>✨ Generar CV con IA</>
                )}
              </button>
            </div>
          </div>

          {/* Result */}
          <div>
            {!result && !loading && (
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-12 text-center h-full flex flex-col items-center justify-center">
                <p className="text-4xl mb-3">📄</p>
                <p className="font-semibold text-[var(--color-brand-dark)]">Tu CV aparecerá aquí</p>
                <p className="text-sm text-[var(--color-brand-muted)] mt-1">Completá el formulario y hacé clic en Generar</p>
              </div>
            )}

            {loading && (
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-pirai-200 border-t-pirai-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-[var(--color-brand-muted)]">Generando tu CV con IA...</p>
                <p className="text-xs text-[var(--color-brand-muted)] mt-1">Esto puede tardar unos segundos</p>
              </div>
            )}

            {result && (
              <div className="bg-white rounded-xl border border-[var(--color-brand-border)] overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-[var(--color-brand-border)]">
                  <button
                    onClick={() => setResultTab('cv')}
                    className={`flex-1 py-3 text-sm font-medium transition-colors ${
                      resultTab === 'cv'
                        ? 'text-pirai-600 border-b-2 border-pirai-600'
                        : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                    }`}
                  >
                    CV
                  </button>
                  {result.coverLetter && (
                    <button
                      onClick={() => setResultTab('carta')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        resultTab === 'carta'
                          ? 'text-pirai-600 border-b-2 border-pirai-600'
                          : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                      }`}
                    >
                      Carta de presentación
                    </button>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-end mb-3">
                    <button
                      onClick={() => {
                        const text = resultTab === 'cv' ? cvText : (result.coverLetter || '');
                        navigator.clipboard.writeText(text).then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      className="text-xs text-pirai-600 font-semibold hover:text-pirai-700 flex items-center gap-1"
                    >
                      {copied ? '✓ Copiado' : '📋 Copiar'}
                    </button>
                  </div>

                  {resultTab === 'cv' && result.cv && (
                    <div className="space-y-4 text-sm">
                      {result.cv.resumen && (
                        <div>
                          <h3 className="font-bold text-[var(--color-brand-dark)] mb-1">Resumen</h3>
                          <p className="text-[var(--color-brand-muted)] leading-relaxed">{result.cv.resumen}</p>
                        </div>
                      )}
                      {result.cv.experiencia && result.cv.experiencia.length > 0 && (
                        <div>
                          <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Experiencia</h3>
                          <div className="space-y-3">
                            {result.cv.experiencia.map((exp, i) => (
                              <div key={i} className="border-l-2 border-pirai-200 pl-3">
                                <p className="font-semibold text-[var(--color-brand-dark)]">{exp.rol}</p>
                                <p className="text-pirai-600 text-xs">{exp.empresa} · {exp.desde} — {exp.hasta}</p>
                                {exp.descripcion && <p className="text-[var(--color-brand-muted)] text-xs mt-1 leading-relaxed">{exp.descripcion}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result.cv.habilidades && result.cv.habilidades.length > 0 && (
                        <div>
                          <h3 className="font-bold text-[var(--color-brand-dark)] mb-2">Habilidades</h3>
                          <div className="flex flex-wrap gap-2">
                            {result.cv.habilidades.map((h, i) => (
                              <span key={i} className="bg-pirai-50 text-pirai-700 px-2 py-1 rounded-lg text-xs">{h}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {resultTab === 'carta' && result.coverLetter && (
                    <div className="text-sm text-[var(--color-brand-dark)] leading-relaxed whitespace-pre-wrap">{result.coverLetter}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
