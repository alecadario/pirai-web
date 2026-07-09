'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserId } from './auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export interface ProfileData {
  stage: string | null;
  age_range: string | null;
  passion: string;
  impact: string;
  ideal_day: string;
  services_description: string;
  fullName?: string;
  diagnosis?: string;
}

export interface Empresa {
  id: string;
  name: string;
  industry: string;
  status: string;
  website?: string;
  country?: string;
  logo_url?: string;
  notes?: string;
  objetivo?: string;
  numContactos?: number;
  numActividades?: number;
  ultimaActividad?: string;
}

export interface Contacto {
  id: string;
  name: string;
  title?: string;
  email?: string;
  linkedinUrl?: string;
  phone?: string;
  empresaNombre?: string;
  empresaId?: string;
  stage?: string;
  notes?: string;
  country?: string;
}

export interface Actividad {
  id: string;
  tipo: string;
  fecha: string;
  empresaId?: string;
  empresaNombre?: string;
  contactoId?: string;
  contactoNombre?: string;
  respuesta?: boolean;
  notas?: string;
  createdAt?: string;
}

export interface SearchQuota {
  plan: string;
  remaining: number;
  totalQuota: number;
  used: number;
  teamId?: string;
}

export function useAppData() {
  const [profileData, setProfileData] = useState<ProfileData>({
    stage: null, age_range: null, passion: '', impact: '', ideal_day: '', services_description: '',
  });
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [searchQuota, setSearchQuota] = useState<SearchQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = getUserId();

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      // Step 1: get user record to obtain diagnosis + stage (same as mobile app)
      let diagnosis = '';
      let stage = '';
      try {
        const userRecord = await apiFetch<{ record?: { fields?: Record<string, unknown> } }>(
          `/api/user-record?userId=${encodeURIComponent(userId)}`
        );
        const fields = userRecord?.record?.fields ?? {};
        if (fields.onboarding_answers) {
          try {
            const answers = JSON.parse(fields.onboarding_answers as string);
            // Columna propia tiene prioridad (puede ser más reciente que el JSON)
            if (fields.genero) answers.genero = fields.genero as string;
            setProfileData(answers);
            diagnosis = answers.diagnosis ?? '';
            stage = answers.stage ?? '';
          } catch {}
        } else if (fields.genero) {
          setProfileData(prev => ({ ...prev, genero: fields.genero as string }));
        }
        if (fields.diagnosis) diagnosis = fields.diagnosis as string;
        if (fields.stage) stage = fields.stage as string;
      } catch {}

      // Step 2: bootstrap with diagnosis + stage (same as mobile app)
      const data = await apiFetch<{
        companies: Empresa[];
        contacts: Contacto[];
        activities: Actividad[];
      }>(`/api/bootstrap?userId=${encodeURIComponent(userId)}&diagnosis=${encodeURIComponent(diagnosis)}&stage=${encodeURIComponent(stage)}`);

      setEmpresas(data.companies ?? []);
      setContactos(data.contacts ?? []);
      setActividades((data.activities ?? []).sort((a, b) => {
        const ca = a.createdAt ?? a.fecha ?? '';
        const cb = b.createdAt ?? b.fecha ?? '';
        return cb.localeCompare(ca);
      }));

      // Step 3: search quota
      try {
        const quota = await apiFetch<SearchQuota>(`/api/user/search-quota?userId=${encodeURIComponent(userId)}`);
        setSearchQuota(quota);
      } catch {}

    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const isBizUser = ['emprendedor', 'freelancer', 'empresa'].includes(profileData?.stage ?? '');

  return { profileData, setProfileData, empresas, setEmpresas, contactos, setContactos, actividades, setActividades, searchQuota, loading, error, reload: load, isBizUser, userId };
}
