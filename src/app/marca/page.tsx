'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect, useRef } from 'react';
import { getUserId } from '@/lib/auth';

const API = 'https://piraiapp.com';

interface MarcaData {
  name?: string;
  stage?: string;
  tagline?: string;
  passion?: string;
  impact?: string;
  ideal_day?: string;
  services_description?: string;
  photo_url?: string;
}

export default function MarcaPage() {
  const [tab, setTab] = useState<'perfil' | 'cv'>('perfil');
  const [cvSubTab, setCvSubTab] = useState<'cv' | 'carta'>('cv');
  const [marcaData, setMarcaData] = useState<MarcaData>({});
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState('');

  // CV form state
  const [cvRol, setCvRol] = useState('');
  const [cvEmpresa, setCvEmpresa] = useState('');
  const [cvIdioma, setCvIdioma] = useState('es');
  const [cvDescripcion, setCvDescripcion] = useState('');
  const [cvResult, setCvResult] = useState('');
  const [cvLoading, setCvLoading] = useState(false);
  const [cvCopied, setCvCopied] = useState(false);

  // Carta form state
  const [cartaRol, setCartaRol] = useState('');
  const [cartaEmpresa, setCartaEmpresa] = useState('');
  const [cartaIdioma, setCartaIdioma] = useState('es');
  const [cartaDescripcion, setCartaDescripcion] = useState('');
  const [cartaResult, setCartaResult] = useState('');
  const [cartaLoading, setCartaLoading] = useState(false);
  const [cartaCopied, setCartaCopied] = useState(false);

  // Upload CV
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');

  useEffect(() => {
    const userId = getUserId();
    if (!userId) { setLoading(false); return; }
    fetch(`${API}/api/marca-personal?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(data => {
        setMarcaData(data.profile || data || {});
      })
      .catch(() => {
        // Fallback to bootstrap
        return fetch(`${API}/api/bootstrap?userId=${encodeURIComponent(userId)}`)
          .then(r => r.json())
          .then(data => setMarcaData(data.profileData || {}));
      })
      .finally(() => setLoading(false));
  }, []);

  async function analyzeProfile() {
    const userId = getUserId();
    if (!userId) return;
    setAnalyzing(true);
    setAnalyzeResult('');
    try {
      const res = await fetch(`${API}/api/analyze-profile?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      setAnalyzeResult(data.analysis || data.result || data.text || JSON.stringify(data));
    } catch (e) {
      setAnalyzeResult('Error al analizar el perfil. Intentá de nuevo.');
    } finally {
      setAnalyzing(false);
    }
  }

  async function generateCV() {
    const userId = getUserId();
    if (!userId) return;
    setCvLoading(true);
    setCvResult('');
    try {
      const res = await fetch(`${API}/api/generate-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rol: cvRol, empresa: cvEmpresa, idioma: cvIdioma, descripcion: cvDescripcion, type: 'cv' }),
      });
      const data = await res.json();
      setCvResult(data.cv || data.text || data.result || '');
    } catch (e) {
      setCvResult('Error al generar el CV. Intentá de nuevo.');
    } finally {
      setCvLoading(false);
    }
  }

  async function generateCarta() {
    const userId = getUserId();
    if (!userId) return;
    setCartaLoading(true);
    setCartaResult('');
    try {
      const res = await fetch(`${API}/api/generate-cv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, rol: cartaRol, empresa: cartaEmpresa, idioma: cartaIdioma, descripcion: cartaDescripcion, type: 'carta' }),
      });
      const data = await res.json();
      setCartaResult(data.carta || data.text || data.result || '');
    } catch (e) {
      setCartaResult('Error al generar la carta. Intentá de nuevo.');
    } finally {
      setCartaLoading(false);
    }
  }

  async function uploadCV(file: File) {
    const userId = getUserId();
    if (!userId) return;
    setUploadLoading(true);
    setUploadMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      const res = await fetch(`${API}/api/upload-cv`, { method: 'POST', body: formData });
      const data = await res.json();
      setUploadMsg(data.message || 'CV subido correctamente');
    } catch (e) {
      setUploadMsg('Error al subir el CV.');
    } finally {
      setUploadLoading(false);
    }
  }

  function copyText(text: string, setCopied: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const stageLabel: Record<string, string> = {
    buscador: 'Buscador de empleo',
    emprendedor: 'Emprendedor',
    freelancer: 'Freelancer',
    empresa: 'Empresa',
    estudiante: 'Estudiante',
  };

  return (
    <AppShell>
      <div className="p-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark)]">Marca Personal</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[var(--color-brand-gray)] rounded-xl p-1 mb-6 w-fit">
          {([
            { key: 'perfil', label: 'Mi Perfil' },
            { key: 'cv', label: 'CV con IA' },
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
            {/* MI PERFIL TAB */}
            {tab === 'perfil' && (
              <div className="grid grid-cols-3 gap-6">
                {/* Left: profile card */}
                <div className="space-y-4">
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5 text-center">
                    <div className="w-20 h-20 rounded-full bg-[var(--color-pirai-100)] flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      {marcaData.photo_url ? (
                        <img src={marcaData.photo_url} alt="Foto de perfil" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">👤</span>
                      )}
                    </div>
                    <h2 className="font-bold text-[var(--color-brand-dark)] text-lg">{marcaData.name || 'Tu nombre'}</h2>
                    {marcaData.stage && (
                      <span className="inline-block mt-1 text-xs bg-[var(--color-pirai-100)] text-[var(--color-pirai-700)] px-2 py-0.5 rounded-full font-medium">
                        {stageLabel[marcaData.stage] || marcaData.stage}
                      </span>
                    )}
                    {marcaData.tagline && (
                      <p className="text-sm text-[var(--color-brand-muted)] mt-2 italic">&ldquo;{marcaData.tagline}&rdquo;</p>
                    )}
                  </div>

                  <button
                    onClick={analyzeProfile}
                    disabled={analyzing}
                    className="w-full py-3 bg-[var(--color-pirai-600)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                  >
                    {analyzing ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Analizando...</>
                    ) : (
                      <>✨ Analizar perfil</>
                    )}
                  </button>

                  {analyzeResult && (
                    <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-100)] rounded-xl p-4">
                      <p className="text-xs font-semibold text-[var(--color-pirai-700)] mb-2">Análisis de perfil</p>
                      <p className="text-sm text-[var(--color-brand-dark)] leading-relaxed whitespace-pre-wrap">{analyzeResult}</p>
                    </div>
                  )}
                </div>

                {/* Right: profile data */}
                <div className="col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                    <h3 className="font-semibold text-[var(--color-brand-dark)] mb-4">Lo que sabemos de vos</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'passion', label: 'Tu pasión', value: marcaData.passion },
                        { key: 'impact', label: 'Tu impacto', value: marcaData.impact },
                        { key: 'ideal_day', label: 'Tu día ideal', value: marcaData.ideal_day },
                        { key: 'services_description', label: 'Tus servicios / propuesta de valor', value: marcaData.services_description },
                      ].map(({ key, label, value }) => (
                        <div key={key}>
                          <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-1">{label}</p>
                          {value ? (
                            <p className="text-sm text-[var(--color-brand-dark)] leading-relaxed">{value}</p>
                          ) : (
                            <p className="text-sm text-[var(--color-brand-muted)] italic">Sin datos todavía — completá desde la app móvil</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--color-brand-surface)] rounded-xl border border-[var(--color-brand-border)] p-4">
                    <p className="text-xs text-[var(--color-brand-muted)]">
                      💡 Para editar tu perfil en detalle, usá la app móvil de Piraí. Los cambios se reflejarán aquí automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CV CON IA TAB */}
            {tab === 'cv' && (
              <div>
                {/* Sub-tabs */}
                <div className="flex gap-1 bg-[var(--color-brand-gray)] rounded-lg p-1 mb-6 w-fit">
                  {([
                    { key: 'cv', label: '📄 CV' },
                    { key: 'carta', label: '✉️ Carta de presentación' },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setCvSubTab(key)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        cvSubTab === key
                          ? 'bg-white text-[var(--color-brand-dark)] shadow-sm'
                          : 'text-[var(--color-brand-muted)] hover:text-[var(--color-brand-dark)]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {cvSubTab === 'cv' && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                        <h3 className="font-semibold text-[var(--color-brand-dark)] mb-4">Generá tu CV con IA</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Rol objetivo *</label>
                            <input
                              type="text"
                              value={cvRol}
                              onChange={e => setCvRol(e.target.value)}
                              placeholder="ej: Product Manager, Desarrollador Full Stack..."
                              className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Empresa destino</label>
                            <input
                              type="text"
                              value={cvEmpresa}
                              onChange={e => setCvEmpresa(e.target.value)}
                              placeholder="Nombre de la empresa..."
                              className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Idioma</label>
                            <select
                              value={cvIdioma}
                              onChange={e => setCvIdioma(e.target.value)}
                              className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)] bg-white"
                            >
                              <option value="es">Español</option>
                              <option value="en">English</option>
                              <option value="pt">Português</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Descripción del puesto</label>
                            <textarea
                              value={cvDescripcion}
                              onChange={e => setCvDescripcion(e.target.value)}
                              placeholder="Pegá la descripción del puesto para personalizar el CV..."
                              rows={4}
                              className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)] resize-none"
                            />
                          </div>
                          <button
                            onClick={generateCV}
                            disabled={cvLoading || !cvRol}
                            className="w-full py-3 bg-[var(--color-pirai-600)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                          >
                            {cvLoading ? (
                              <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generando...</>
                            ) : (
                              <>✨ Generar CV</>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Upload CV */}
                      <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-4">
                        <p className="text-xs font-semibold text-[var(--color-brand-muted)] mb-2">Subir CV existente</p>
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadCV(e.target.files[0]); }} />
                        <button
                          onClick={() => fileRef.current?.click()}
                          disabled={uploadLoading}
                          className="w-full py-2 border border-dashed border-[var(--color-brand-border)] rounded-lg text-sm text-[var(--color-brand-muted)] hover:border-[var(--color-pirai-400)] hover:text-[var(--color-pirai-600)] transition-colors"
                        >
                          {uploadLoading ? 'Subiendo...' : '📎 Subir PDF / DOC'}
                        </button>
                        {uploadMsg && <p className="text-xs text-green-600 mt-2">{uploadMsg}</p>}
                      </div>
                    </div>

                    {/* Result */}
                    <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--color-brand-dark)]">Tu CV generado</h3>
                        {cvResult && (
                          <button
                            onClick={() => copyText(cvResult, setCvCopied)}
                            className="text-xs font-medium text-[var(--color-pirai-600)] hover:underline"
                          >
                            {cvCopied ? '✓ Copiado' : 'Copiar'}
                          </button>
                        )}
                      </div>
                      {cvResult ? (
                        <pre className="text-sm text-[var(--color-brand-dark)] whitespace-pre-wrap leading-relaxed flex-1 overflow-auto font-sans">{cvResult}</pre>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--color-brand-muted)] text-sm text-center">
                          <div>
                            <p className="text-3xl mb-2">📄</p>
                            <p>Completá el formulario y hacé clic en &ldquo;Generar CV&rdquo;</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {cvSubTab === 'carta' && (
                  <div className="grid grid-cols-2 gap-6">
                    {/* Form */}
                    <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
                      <h3 className="font-semibold text-[var(--color-brand-dark)] mb-4">Generá tu carta de presentación</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Rol objetivo *</label>
                          <input
                            type="text"
                            value={cartaRol}
                            onChange={e => setCartaRol(e.target.value)}
                            placeholder="ej: UX Designer, Marketing Lead..."
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Empresa destino</label>
                          <input
                            type="text"
                            value={cartaEmpresa}
                            onChange={e => setCartaEmpresa(e.target.value)}
                            placeholder="Nombre de la empresa..."
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Idioma</label>
                          <select
                            value={cartaIdioma}
                            onChange={e => setCartaIdioma(e.target.value)}
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)] bg-white"
                          >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-brand-muted)] mb-1">Descripción del puesto</label>
                          <textarea
                            value={cartaDescripcion}
                            onChange={e => setCartaDescripcion(e.target.value)}
                            placeholder="Pegá la descripción del puesto..."
                            rows={4}
                            className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-400)] resize-none"
                          />
                        </div>
                        <button
                          onClick={generateCarta}
                          disabled={cartaLoading || !cartaRol}
                          className="w-full py-3 bg-[var(--color-pirai-600)] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-2"
                        >
                          {cartaLoading ? (
                            <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generando...</>
                          ) : (
                            <>✨ Generar carta</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[var(--color-brand-dark)]">Tu carta generada</h3>
                        {cartaResult && (
                          <button
                            onClick={() => copyText(cartaResult, setCartaCopied)}
                            className="text-xs font-medium text-[var(--color-pirai-600)] hover:underline"
                          >
                            {cartaCopied ? '✓ Copiado' : 'Copiar'}
                          </button>
                        )}
                      </div>
                      {cartaResult ? (
                        <pre className="text-sm text-[var(--color-brand-dark)] whitespace-pre-wrap leading-relaxed flex-1 overflow-auto font-sans">{cartaResult}</pre>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-[var(--color-brand-muted)] text-sm text-center">
                          <div>
                            <p className="text-3xl mb-2">✉️</p>
                            <p>Completá el formulario y hacé clic en &ldquo;Generar carta&rdquo;</p>
                          </div>
                        </div>
                      )}
                    </div>
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
