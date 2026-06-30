'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserId } from './auth';
import { api } from './api';

export interface ProfileData {
  stage: string | null;
  age_range: string | null;
  passion: string;
  impact: string;
  ideal_day: string;
  services_description: string;
  fullName?: string;
}

export interface Empresa {
  id: string;
  name: string;
  industry: string;
  status: string;
  website?: string;
  country?: string;
  logo_url?: string;
  linkedin_url?: string;
  description?: string;
  notes?: string;
}

export interface Contacto {
  id: string;
  name: string;
  role?: string;
  email?: string;
  linkedin?: string;
  company_name?: string;
  company_id?: string;
  stage?: string;
  notes?: string;
}

export interface Actividad {
  id: string;
  tipo: string;
  fecha: string;
  empresa?: string;
  empresa_id?: string;
  contacto?: string;
  contacto_id?: string;
  estado?: string;
  prioridad?: string;
  respuesta?: boolean;
  notes?: string;
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
      const [profileRes, crmRes, quotaRes] = await Promise.allSettled([
        api.get<{ profile: ProfileData }>(`/api/user/profile?userId=${userId}`),
        api.get<{ companies: Empresa[]; contacts: Contacto[]; activities: Actividad[] }>(`/api/bootstrap?userId=${userId}`),
        api.get<SearchQuota>(`/api/user/search-quota?userId=${userId}`),
      ]);

      if (profileRes.status === 'fulfilled') setProfileData(profileRes.value.profile ?? profileRes.value as unknown as ProfileData);
      if (crmRes.status === 'fulfilled') {
        setEmpresas(crmRes.value.companies ?? []);
        setContactos(crmRes.value.contacts ?? []);
        setActividades(crmRes.value.activities ?? []);
      }
      if (quotaRes.status === 'fulfilled') setSearchQuota(quotaRes.value);
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
