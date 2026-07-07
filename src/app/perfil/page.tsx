'use client';

import AppShell from '@/components/layout/AppShell';
import { useEffect, useState, useCallback } from 'react';
import { getUserId, getUserEmail, getUserName } from '@/lib/auth';
import { Loader2, User, Save, CheckCircle } from 'lucide-react';

interface ProfileData {
  stage: string | null;
  age_range: string | null;
  passion: string;
  impact: string;
  ideal_day: string;
  services_description: string;
  fullName?: string;
}

export default function PerfilPage() {
  const [profile, setProfile] = useState<ProfileData>({ stage: null, age_range: null, passion: '', impact: '', ideal_day: '', services_description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const userId = getUserId();
  const email = getUserEmail();
  const name = getUserName();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/user/profile?userId=${userId}`);
      const p = await res.json();
      setProfile(p);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...profile }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <AppShell>
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pirai-500)]" />
      </div>
    </AppShell>
  );

  const isBiz = profile.stage === 'emprendedor' || profile.stage === 'freelancer';

  return (
    <AppShell>
      <div className="p-8 max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-pirai-400)] to-[var(--color-turquesa-500)] flex items-center justify-center text-white font-bold text-xl">
              {(name ?? email ?? 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-brand-dark)]">{name || 'Tu perfil'}</h1>
              <p className="text-sm text-[var(--color-brand-muted)]">{email}</p>
            </div>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 bg-[var(--color-pirai-500)] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? 'Guardado' : 'Guardar cambios'}
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6 space-y-5">
          <h2 className="font-semibold text-[var(--color-brand-dark)]">Información de perfil</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Etapa profesional">
              <select
                value={profile.stage ?? ''}
                onChange={e => setProfile(p => ({ ...p, stage: e.target.value }))}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
              >
                <option value="">Sin definir</option>
                <option value="buscando">Buscando empleo</option>
                <option value="job_seeker">Buscando empleo</option>
                <option value="emprendedor">Emprendedor/a</option>
                <option value="freelancer">Freelancer</option>
                <option value="transicion">En transición</option>
                <option value="empresa">Empresa</option>
                {profile.stage && !['', 'buscando', 'job_seeker', 'emprendedor', 'freelancer', 'transicion', 'empresa'].includes(profile.stage) && (
                  <option value={profile.stage}>{profile.stage}</option>
                )}
              </select>
            </Field>

            <Field label="Rango de edad">
              <select
                value={profile.age_range ?? ''}
                onChange={e => setProfile(p => ({ ...p, age_range: e.target.value }))}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
              >
                <option value="">Sin definir</option>
                <option value="18-24">18-24</option>
                <option value="25-34">25-34</option>
                <option value="35-44">35-44</option>
                <option value="45+">45+</option>
              </select>
            </Field>
          </div>

          <Field label="¿Qué te apasiona?">
            <textarea
              value={profile.passion}
              onChange={e => setProfile(p => ({ ...p, passion: e.target.value }))}
              placeholder="Ej: La tecnología, el diseño, crear productos que impacten..."
              rows={3}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
            />
          </Field>

          <Field label="¿Qué impacto querés generar?">
            <textarea
              value={profile.impact}
              onChange={e => setProfile(p => ({ ...p, impact: e.target.value }))}
              placeholder="Ej: Ayudar a pymes a crecer, democratizar el acceso a educación..."
              rows={3}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
            />
          </Field>

          <Field label={isBiz ? '¿Qué servicios o productos ofrecés?' : '¿A qué te dedicás?'}>
            <textarea
              value={profile.services_description}
              onChange={e => setProfile(p => ({ ...p, services_description: e.target.value }))}
              placeholder={isBiz
                ? 'Ej: Diseño web para pymes, consultoría en marketing digital...'
                : 'Ej: Soy analista de datos con 3 años de experiencia en retail...'
              }
              rows={4}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
            />
          </Field>

          <Field label={isBiz ? '¿Cómo es tu día ideal de trabajo?' : '¿Cómo es tu día ideal de trabajo?'}>
            <textarea
              value={profile.ideal_day}
              onChange={e => setProfile(p => ({ ...p, ideal_day: e.target.value }))}
              placeholder="Ej: Trabajo remoto, horario flexible, enfocado en proyectos creativos..."
              rows={3}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none"
            />
          </Field>
        </div>

        {/* Account info */}
        <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] p-6">
          <h2 className="font-semibold text-[var(--color-brand-dark)] mb-4">Cuenta</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-brand-muted)]">Email</span>
              <span className="text-[var(--color-brand-dark)] font-medium">{email ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-brand-muted)]">Login</span>
              <span className="text-[var(--color-brand-dark)] font-medium">Google</span>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
