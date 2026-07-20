'use client';

import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/auth';
import { ArrowLeft, Loader2, Sparkles, CheckCircle, Upload } from 'lucide-react';

interface ProfileData {
  stage?: string;
  age_range?: string;
  genero?: string;
  country?: string;
  city?: string;
  target_countries?: string[];
  passion?: string;
  impact?: string;
  ideal_day?: string;
}

const STEPS = [
  {
    id: 'stage',
    title: '¿En qué etapa estás?',
    subtitle: 'Esto nos ayuda a entender desde dónde arrancás.',
    type: 'single' as const,
    options: [
      { value: 'primer_empleo', label: 'Buscando mi primer empleo' },
      { value: 'cambio_carrera', label: 'Quiero cambiar de carrera' },
      { value: 'reinsertandome', label: 'Me estoy reinsertando al mercado' },
      { value: 'crecer', label: 'Quiero crecer donde estoy' },
      { value: 'emprendedor', label: 'Soy emprendedor/a, busco clientes' },
      { value: 'explorando', label: 'Estoy explorando opciones' },
    ],
  },
  {
    id: 'age_range',
    title: '¿Cuál es tu rango de edad?',
    subtitle: 'No para juzgarte — para calibrar mejor las recomendaciones.',
    type: 'single' as const,
    options: [
      { value: '18-25', label: '18 – 25 años' },
      { value: '26-35', label: '26 – 35 años' },
      { value: '36-45', label: '36 – 45 años' },
      { value: '46+', label: '46+ años' },
    ],
  },
  {
    id: 'genero',
    title: 'Género',
    subtitle: 'Lo usamos para redactar tu CV y portafolio correctamente.',
    type: 'single' as const,
    options: [
      { value: 'femenino', label: 'Mujer' },
      { value: 'masculino', label: 'Hombre' },
    ],
  },
  {
    id: 'location',
    title: '¿Dónde estás?',
    subtitle: 'Para darte recomendaciones que tengan sentido con tu mercado.',
    type: 'location' as const,
  },
  {
    id: 'target_countries',
    title: '¿En qué países buscás oportunidades?',
    subtitle: 'Podés elegir varios. Incluí donde vivís si también buscás ahí.',
    type: 'multi_select' as const,
    options: [
      { value: 'Argentina', label: 'Argentina' },
      { value: 'México', label: 'México' },
      { value: 'Colombia', label: 'Colombia' },
      { value: 'Chile', label: 'Chile' },
      { value: 'Perú', label: 'Perú' },
      { value: 'Bolivia', label: 'Bolivia' },
      { value: 'Ecuador', label: 'Ecuador' },
      { value: 'Uruguay', label: 'Uruguay' },
      { value: 'Paraguay', label: 'Paraguay' },
      { value: 'Venezuela', label: 'Venezuela' },
      { value: 'Costa Rica', label: 'Costa Rica' },
      { value: 'Panamá', label: 'Panamá' },
      { value: 'España', label: 'España' },
      { value: 'Estados Unidos', label: 'Estados Unidos' },
      { value: 'Brasil', label: 'Brasil' },
      { value: 'Otro', label: 'Otro' },
    ],
  },
  {
    id: 'passion',
    title: '¿Qué te apasiona?',
    subtitle: 'No pienses en lo "correcto". ¿Qué te mueve de verdad?',
    type: 'text' as const,
    placeholder: 'Ej: Me apasiona conectar personas, resolver problemas complejos, crear cosas desde cero...',
  },
  {
    id: 'impact',
    title: '¿Qué impacto querés generar?',
    subtitle: 'Más allá del sueldo — ¿qué querés lograr?',
    type: 'text' as const,
    placeholder: 'Ej: Quiero ayudar a empresas a crecer, liderar equipos, transformar industrias...',
  },
  {
    id: 'ideal_day',
    title: '¿Cómo imaginás tu día ideal de trabajo?',
    subtitle: 'Cerrá los ojos un segundo y describilo.',
    type: 'text' as const,
    placeholder: 'Ej: Arranco temprano con café, trabajo remoto, tengo reuniones con clientes, resuelvo desafíos creativos...',
  },
  {
    id: 'cv',
    title: 'Subí tu CV',
    subtitle: 'Esto nos permite darte recomendaciones mucho más personalizadas. Solo PDF.',
    type: 'cv' as const,
  },
];

const STAGE_LABEL: Record<string, string> = {
  primer_empleo: 'Buscando primer empleo',
  cambio_carrera: 'Cambio de carrera',
  reinsertandome: 'Reinsertándose al mercado',
  crecer: 'Creciendo profesionalmente',
  emprendedor: 'Emprendedor/a buscando clientes',
  explorando: 'Explorando opciones',
};

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const userId = getUserId();
  const [step, setStep] = useState(0); // 0 = welcome
  const [data, setData] = useState<ProfileData>({});
  const [cvText, setCvText] = useState('');
  const [cvUploading, setCvUploading] = useState(false);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [cvError, setCvError] = useState('');
  const [titular, setTitular] = useState('');
  const [titularLoading, setTitularLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const totalSteps = STEPS.length; // steps 1..totalSteps, then summary

  const currentStep = step > 0 && step <= totalSteps ? STEPS[step - 1] : null;
  const isSummary = step === totalSteps + 1;

  const canContinue = () => {
    if (!currentStep) return true;
    if (currentStep.type === 'location') return !!(data.country?.trim() && data.city?.trim());
    if (currentStep.type === 'multi_select') return Array.isArray(data[currentStep.id as keyof ProfileData]) && (data[currentStep.id as keyof ProfileData] as string[]).length > 0;
    if (currentStep.type === 'text') return ((data[currentStep.id as keyof ProfileData] as string) || '').trim().length > 0;
    if (currentStep.type === 'cv') return true; // always skippable
    return !!(data[currentStep.id as keyof ProfileData]);
  };

  const setValue = (key: keyof ProfileData, value: string) => {
    setData(p => ({ ...p, [key]: value }));
    // Auto-advance on single select
    if (currentStep?.type === 'single') {
      setTimeout(() => setStep(s => s + 1), 150);
    }
  };

  const toggleMulti = (key: keyof ProfileData, value: string) => {
    setData(p => {
      const current = Array.isArray(p[key]) ? (p[key] as string[]) : [];
      const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      return { ...p, [key]: next };
    });
  };

  const handleCvUpload = async (file: File) => {
    if (!userId || !file) return;
    setCvUploading(true);
    setCvError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);
      const res = await fetch('/api/upload-cv', { method: 'POST', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Error subiendo CV');
      setCvText(result.cvText || '');
      setCvUploaded(true);
    } catch (e) {
      setCvError(e instanceof Error ? e.message : 'Error subiendo CV');
    } finally {
      setCvUploading(false);
    }
  };

  const goToSummary = async () => {
    // Generate titular with AI
    setStep(totalSteps + 1);
    setTitularLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com'}/api/generate-titular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: data.stage,
          age_range: data.age_range,
          passion: data.passion,
          impact: data.impact,
          ideal_day: data.ideal_day,
          cvText: cvText || null,
        }),
      });
      const d = await res.json();
      setTitular(d.titular || 'Tu próximo capítulo profesional empieza hoy.');
    } catch {
      setTitular('Tu próximo capítulo profesional empieza hoy.');
    } finally {
      setTitularLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...data,
          cv_text: cvText,
          onboarding_completed: true,
          onboarding_answers: JSON.stringify({ ...data, cv_text: cvText, titular }),
          titular,
        }),
      });
    } catch { /* ignore — still proceed */ }
    setSaving(false);
    onComplete();
  };

  // ── Welcome screen ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <img src="/logo-pirai.png" alt="Piraí" className="h-12 w-auto mx-auto mb-6" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <h1 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-2">Tu sistema para crear oportunidades</h1>
          <p className="text-[var(--color-brand-muted)] text-sm mb-10">
            Dejá de improvisar. Prospectá con método, seguí con intención, generá resultados.
          </p>
          <button
            onClick={() => setStep(1)}
            className="w-full bg-[var(--color-pirai-500)] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[var(--color-pirai-600)] transition-colors"
          >
            Empezar →
          </button>
        </div>
      </div>
    );
  }

  // ── Summary / finish screen ─────────────────────────────────────────────────
  if (isSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--color-pirai-500)] to-[var(--color-pirai-600)] flex items-center justify-center p-6">
        <div className="max-w-sm w-full">
          <div className="text-center text-white mb-8">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Ya te conozco!</h2>
            <p className="text-white/70 text-sm">Esto es lo que preparé para vos:</p>
          </div>

          <div className="bg-white rounded-2xl p-6 mb-6">
            {titularLoading ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 className="w-6 h-6 text-[var(--color-pirai-500)] animate-spin mb-3" />
                <p className="text-sm text-gray-500">Generando tu mensaje personalizado...</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold text-[var(--color-pirai-500)] uppercase mb-3">Tu titular motivador</p>
                <p className="text-lg font-bold text-[var(--color-brand-dark)] leading-relaxed">{titular}</p>
                <div className="border-t mt-4 pt-4 space-y-1">
                  <p className="text-xs text-gray-400">
                    <span className="font-semibold">{STAGE_LABEL[data.stage ?? ''] || data.stage}</span>
                    {data.age_range ? ` · ${data.age_range}` : ''}
                    {data.country ? ` · ${data.city ? `${data.city}, ` : ''}${data.country}` : ''}
                  </p>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleComplete}
            disabled={titularLoading || saving}
            className="w-full bg-white text-[var(--color-pirai-600)] py-4 rounded-2xl font-bold text-lg hover:bg-white/90 transition-colors disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Ir a mi Dashboard →'}
          </button>
        </div>
      </div>
    );
  }

  if (!currentStep) return null;

  const stepValue = data[currentStep.id as keyof ProfileData];

  // ── Step screens ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full">
        {/* Progress bar */}
        <div className="flex items-center gap-3 mb-8">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4 text-gray-500" />
            </button>
          )}
          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-[var(--color-pirai-500)] h-1.5 rounded-full transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-400">{step}/{totalSteps}</span>
        </div>

        <h2 className="text-xl font-bold text-[var(--color-brand-dark)] mb-1">{currentStep.title}</h2>
        {'subtitle' in currentStep && <p className="text-sm text-gray-500 mb-6">{currentStep.subtitle}</p>}

        {/* Single select */}
        {currentStep.type === 'single' && (
          <div className="space-y-2 mb-8">
            {'options' in currentStep && currentStep.options!.map(opt => (
              <button
                key={opt.value}
                onClick={() => setValue(currentStep.id as keyof ProfileData, opt.value)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium ${
                  stepValue === opt.value
                    ? 'border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Multi select */}
        {currentStep.type === 'multi_select' && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {'options' in currentStep && currentStep.options!.map(opt => {
                const sel = Array.isArray(stepValue) && (stepValue as string[]).includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleMulti(currentStep.id as keyof ProfileData, opt.value)}
                    className={`px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      sel
                        ? 'border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)] text-[var(--color-pirai-700)]'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {Array.isArray(stepValue) && (stepValue as string[]).length > 0 && (
              <p className="text-xs text-[var(--color-pirai-500)] mt-3">{(stepValue as string[]).length} seleccionados</p>
            )}
          </div>
        )}

        {/* Location */}
        {currentStep.type === 'location' && (
          <div className="space-y-3 mb-8">
            <input
              value={data.country || ''}
              onChange={e => setData(p => ({ ...p, country: e.target.value }))}
              placeholder="País (ej. Argentina)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-[var(--color-pirai-500)] focus:outline-none transition-colors"
            />
            <input
              value={data.city || ''}
              onChange={e => setData(p => ({ ...p, city: e.target.value }))}
              placeholder="Ciudad (ej. Buenos Aires)"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-[var(--color-pirai-500)] focus:outline-none transition-colors"
            />
          </div>
        )}

        {/* Text */}
        {currentStep.type === 'text' && (
          <div className="mb-8">
            <textarea
              value={(stepValue as string) || ''}
              onChange={e => setData(p => ({ ...p, [currentStep.id]: e.target.value }))}
              placeholder={'placeholder' in currentStep ? currentStep.placeholder : ''}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:border-[var(--color-pirai-500)] focus:outline-none resize-none transition-colors"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">{((stepValue as string) || '').length} / 500</p>
          </div>
        )}

        {/* CV upload */}
        {currentStep.type === 'cv' && (
          <div className="mb-8">
            {!cvUploaded ? (
              <div className="space-y-4">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${
                  cvUploading ? 'border-[var(--color-pirai-400)] bg-[var(--color-pirai-50)]' : 'border-gray-300 bg-white hover:border-[var(--color-pirai-300)]'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {cvUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 text-[var(--color-pirai-500)] animate-spin mb-2" />
                        <p className="text-sm text-[var(--color-pirai-600)]">Procesando CV...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600"><span className="font-semibold text-[var(--color-pirai-600)]">Hacé clic</span> para elegir tu CV</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, máximo 5MB</p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleCvUpload(f); }}
                    disabled={cvUploading}
                  />
                </label>
                {cvError && <p className="text-sm text-red-600">{cvError}</p>}
              </div>
            ) : (
              <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] rounded-2xl p-5 text-center">
                <CheckCircle className="w-10 h-10 text-[var(--color-pirai-500)] mx-auto mb-3" />
                <p className="font-semibold text-[var(--color-pirai-800)]">¡CV cargado!</p>
                <p className="text-sm text-[var(--color-pirai-600)] mt-1">Vamos a usarlo para darte recomendaciones más personalizadas.</p>
              </div>
            )}
          </div>
        )}

        {/* Continue / skip button */}
        {currentStep.type !== 'single' && (
          <button
            onClick={() => {
              if (step === totalSteps) {
                goToSummary();
              } else {
                setStep(s => s + 1);
              }
            }}
            disabled={!canContinue() && currentStep.type !== 'cv'}
            className={`w-full py-3.5 rounded-xl font-bold transition-colors ${
              canContinue()
                ? 'bg-[var(--color-pirai-500)] text-white hover:bg-[var(--color-pirai-600)]'
                : currentStep.type === 'cv'
                  ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep.type === 'cv' && !cvUploaded
              ? 'Saltar este paso →'
              : step === totalSteps
                ? 'Ver mi perfil →'
                : 'Continuar →'}
          </button>
        )}
      </div>
    </div>
  );
}
