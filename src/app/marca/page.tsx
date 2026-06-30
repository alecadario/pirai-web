'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useCallback } from 'react';
import { getUserId } from '@/lib/auth';
import { api } from '@/lib/api';
import { Loader2, Sparkles, FileText, Copy, Download, CheckCircle } from 'lucide-react';

type Tab = 'cv' | 'carta' | 'prep';

export default function MarcaPage() {
  const [tab, setTab] = useState<Tab>('cv');
  const userId = getUserId();

  const TABS = [
    { id: 'cv' as Tab, label: 'Generador de CV', icon: FileText },
    { id: 'carta' as Tab, label: 'Carta de presentación', icon: Sparkles },
    { id: 'prep' as Tab, label: 'Prep de entrevista', icon: CheckCircle },
  ];

  return (
    <AppShell>
      <div className="flex flex-col h-full min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[var(--color-brand-border)] px-8 pt-6 pb-0">
          <h1 className="text-xl font-bold text-[var(--color-brand-dark)] mb-4">Marca Personal</h1>
          <div className="flex gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-t-xl border-b-2 transition-colors ${
                  tab === id
                    ? 'text-[var(--color-pirai-600)] border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)]'
                    : 'text-gray-400 border-transparent hover:text-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {tab === 'cv' && <CVGenerator userId={userId} />}
          {tab === 'carta' && <CartaGenerator userId={userId} />}
          {tab === 'prep' && <PrepGenerator userId={userId} />}
        </div>
      </div>
    </AppShell>
  );
}

function CVGenerator({ userId }: { userId: string | null }) {
  const [form, setForm] = useState({ rol: '', empresa: '', idioma: 'es', genero: 'femenino' });
  const [result, setResult] = useState<{ cv?: Record<string, unknown>; letter?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!userId || !form.rol) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post<{ cv: Record<string, unknown>; letter: string }>('/api/cv/generate', {
        userId,
        ...form,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando el CV');
    } finally {
      setLoading(false);
    }
  }, [userId, form]);

  const copyText = () => {
    const text = result?.letter ?? JSON.stringify(result?.cv, null, 2);
    navigator.clipboard.writeText(text ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-1">Generador de CV con IA</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Adaptado al rol, en tu idioma, listo para enviar.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol al que te postulás *</label>
          <input
            value={form.rol}
            onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
            placeholder="ej. Product Manager en startup tech"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa (opcional)</label>
          <input
            value={form.empresa}
            onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))}
            placeholder="ej. Mercado Libre"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Idioma</label>
            <select value={form.idioma} onChange={e => setForm(p => ({ ...p, idioma: e.target.value }))}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="es">Español</option>
              <option value="en">Inglés</option>
              <option value="pt">Portugués</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Género</label>
            <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="femenino">Femenino</option>
              <option value="masculino">Masculino</option>
              <option value="no_binario">No binario</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          onClick={generate}
          disabled={loading || !form.rol}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generando...' : 'Generar CV con IA'}
        </button>
      </div>

      {/* Result */}
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-5 min-h-[400px] flex flex-col">
        {result ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[var(--color-brand-dark)]">Tu CV generado</h3>
              <div className="flex gap-2">
                <button onClick={copyText} className="flex items-center gap-1.5 text-xs text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-50)] px-2 py-1 rounded-lg transition-colors">
                  {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto text-sm text-[var(--color-brand-dark)] whitespace-pre-line leading-relaxed">
              {result.letter ?? JSON.stringify(result.cv, null, 2)}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)]">
            <FileText className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Completá el formulario y hacé clic en &quot;Generar CV&quot; para ver el resultado acá.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CartaGenerator({ userId }: { userId: string | null }) {
  const [form, setForm] = useState({ rol: '', empresa: '', idioma: 'es', genero: 'femenino' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    if (!userId || !form.rol) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await api.post<{ letter: string }>('/api/cover-letter/generate', { userId, ...form });
      setResult(res.letter ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la carta');
    } finally {
      setLoading(false);
    }
  }, [userId, form]);

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-1">Carta de presentación</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Personalizada para cada empresa, en tu tono.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol *</label>
          <input value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))} placeholder="ej. Diseñadora UX" className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa</label>
          <input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="ej. Spotify" className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Idioma</label>
            <select value={form.idioma} onChange={e => setForm(p => ({ ...p, idioma: e.target.value }))} className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="es">Español</option><option value="en">Inglés</option><option value="pt">Portugués</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Género</label>
            <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))} className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="no_binario">No binario</option>
            </select>
          </div>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button onClick={generate} disabled={loading || !form.rol} className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generando...' : 'Generar carta'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-5 min-h-[400px] flex flex-col">
        {result ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm text-[var(--color-brand-dark)]">Tu carta</h3>
              <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1.5 text-xs text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-50)] px-2 py-1 rounded-lg">
                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="flex-1 text-sm text-[var(--color-brand-dark)] whitespace-pre-line leading-relaxed overflow-auto">{result}</p>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)]">
            <Sparkles className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Completá el formulario para generar tu carta.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PrepGenerator({ userId }: { userId: string | null }) {
  const [empresa, setEmpresa] = useState('');
  const [rol, setRol] = useState('');
  const [result, setResult] = useState<{ tips: string[]; resumen: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = useCallback(async () => {
    if (!userId || !rol) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post<{ tips: string[]; resumen: string }>('/api/interview/prep', { userId, empresa, rol });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la prep');
    } finally {
      setLoading(false);
    }
  }, [userId, empresa, rol]);

  return (
    <div className="max-w-3xl mx-auto grid grid-cols-2 gap-8">
      <div className="space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-1">Preparación de entrevista</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Tips personalizados para tu próxima entrevista.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol *</label>
          <input value={rol} onChange={e => setRol(e.target.value)} placeholder="ej. Data Analyst" className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa</label>
          <input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="ej. Rappi" className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button onClick={generate} disabled={loading || !rol} className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {loading ? 'Preparando...' : 'Generar prep'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-5 min-h-[400px] flex flex-col">
        {result ? (
          <div className="space-y-4 overflow-auto">
            {result.resumen && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-2">Resumen</p>
                <p className="text-sm text-[var(--color-brand-dark)] leading-relaxed">{result.resumen}</p>
              </div>
            )}
            {result.tips?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[var(--color-brand-muted)] uppercase tracking-wider mb-2">Tips para la entrevista</p>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--color-brand-dark)]">
                      <span className="text-[var(--color-pirai-500)] font-bold shrink-0">{i + 1}.</span>
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)]">
            <CheckCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Ingresá el rol y la empresa para generar tu prep.</p>
          </div>
        )}
      </div>
    </div>
  );
}
