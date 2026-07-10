'use client';

import AppShell from '@/components/layout/AppShell';
import { useState, useEffect } from 'react';
import { getUserId } from '@/lib/auth';
import { Loader2, Sparkles, FileText, Copy, CheckCircle, RefreshCw, Pencil, User, Upload, Camera, X, Mail, Send, Award, Plus } from 'lucide-react';
import { generateCvPDF, cropImageToCircle } from '@/lib/pdf';


type Tab = 'perfil' | 'cv';

interface ProfileData {
  stage?: string;
  fullName?: string;
  age_range?: string;
  passion?: string;
  impact?: string;
  services_description?: string;
  skills?: string;
}

interface ProfileAnalysis {
  chances_pct: number;
  chances_explanation?: string;
  top_strength?: string;
  biggest_gap?: string;
  lo_que_sabemos?: string;
  hard_skills?: string[];
  soft_skills?: string[];
  stats?: Array<{ icon: string; label: string }>;
  course_recommendations?: Array<{ title: string; platform: string; reason: string }>;
  analyzed_at?: string;
}

interface CuratedCourse {
  id: string;
  title: string;
  platform: string;
  url: string;
  description: string;
  tags: string[];
  language: string;
  free: boolean;
}

interface CompletedCourse {
  id: string;
  course_title: string;
  platform: string;
  url: string;
  description: string;
  tags: string;
  completed_at: string;
}

export default function MarcaPage() {
  const [tab, setTab] = useState<Tab>('perfil');
  const userId = getUserId();
  const [sharedProfile, setSharedProfile] = useState<ProfileData>({});
  const [sharedCvText, setSharedCvText] = useState('');
  const [sharedPhoto, setSharedPhoto] = useState<string | null>(null);
  const [curatedCourses, setCuratedCourses] = useState<CuratedCourse[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
  const [clickedCourseTitles, setClickedCourseTitles] = useState<Set<string>>(new Set());
  const [certifications, setCertifications] = useState<Array<{ id: number; name: string; institution: string; date: string; description: string }>>([]);
  const [certModal, setCertModal] = useState(false);
  const [certForm, setCertForm] = useState({ name: '', institution: '', date: '', description: '' });
  const [certSaving, setCertSaving] = useState(false);

  useEffect(() => {
    fetch('/api/courses').then(r => r.json()).then(d => {
      if (d.courses) setCuratedCourses(d.courses);
    }).catch(() => {});
    if (userId) {
      fetch(`/api/course-progress?userId=${userId}`).then(r => r.json()).then(d => {
        const all = d.courses || [];
        const done = all.filter((c: CompletedCourse & { status: string }) => c.status === 'completed');
        setCompletedCourses(done);
        setClickedCourseTitles(new Set(all.map((c: { course_title: string }) => c.course_title.toLowerCase())));
      }).catch(() => {});
      fetch(`/api/user/profile?userId=${userId}`).then(r => r.json()).then(p => {
        if (p.certifications) {
          try { setCertifications(JSON.parse(p.certifications)); } catch {}
        }
      }).catch(() => {});
    }
  }, [userId]);

  const saveCertification = async () => {
    if (!certForm.name.trim() || !userId) return;
    setCertSaving(true);
    const newCert = { name: certForm.name.trim(), institution: certForm.institution.trim(), date: certForm.date, description: certForm.description.trim(), id: Date.now() };
    const updated = [...certifications, newCert];
    setCertifications(updated);
    setCertModal(false);
    setCertForm({ name: '', institution: '', date: '', description: '' });
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, certifications: JSON.stringify(updated) }),
      });
    } catch {}
    setCertSaving(false);
  };

  const TABS = [
    { id: 'perfil' as Tab, label: 'Mi Perfil', icon: User },
    { id: 'cv' as Tab, label: 'CV con IA ✨', icon: FileText },
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
        <div className="flex-1 p-8 overflow-auto">
          {tab === 'perfil' && (
            <PerfilTab
              userId={userId}
              sharedProfile={sharedProfile}
              setSharedProfile={setSharedProfile}
              sharedCvText={sharedCvText}
              setSharedCvText={setSharedCvText}
              sharedPhoto={sharedPhoto}
              setSharedPhoto={setSharedPhoto}
              curatedCourses={curatedCourses}
              completedCourses={completedCourses}
              clickedCourseTitles={clickedCourseTitles}
              onCourseClicked={(title) => setClickedCourseTitles(prev => new Set([...prev, title.toLowerCase()]))}
              certifications={certifications}
              onAddCert={() => setCertModal(true)}
            />
          )}
          {tab === 'cv' && (
            <CVGenerator
              userId={userId}
              sharedProfile={sharedProfile}
              sharedPhoto={sharedPhoto}
              setSharedPhoto={setSharedPhoto}
            />
          )}
        </div>
      </div>

      {/* Modal certificación externa */}
      {certModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[var(--color-brand-dark)]">Agregar certificación</h3>
              <button onClick={() => setCertModal(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3 mb-5">
              <input type="text" placeholder="Nombre del curso o certificación *" value={certForm.name}
                onChange={e => setCertForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <input type="text" placeholder="Institución / plataforma" value={certForm.institution}
                onChange={e => setCertForm(f => ({ ...f, institution: e.target.value }))}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <input type="text" placeholder="Fecha (ej: Mar 2025)" value={certForm.date}
                onChange={e => setCertForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
              <textarea placeholder="¿Qué temas o habilidades cubrió? (opcional, ayuda a la IA)" value={certForm.description}
                onChange={e => setCertForm(f => ({ ...f, description: e.target.value }))}
                rows={3}
                className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCertModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-brand-gray)] text-[var(--color-brand-muted)]">Cancelar</button>
              <button disabled={!certForm.name.trim() || certSaving} onClick={saveCertification}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[var(--color-pirai-500)] text-white disabled:opacity-40">
                {certSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function getPlatformSearchUrl(title: string, platform: string): string {
  const q = encodeURIComponent(title);
  const p = platform.toLowerCase();
  if (p.includes('youtube')) return `https://www.youtube.com/results?search_query=${q}`;
  if (p.includes('coursera')) return `https://www.coursera.org/search?query=${q}`;
  if (p.includes('udemy')) return `https://www.udemy.com/courses/search/?q=${q}`;
  if (p.includes('edx')) return `https://www.edx.org/search?q=${q}`;
  if (p.includes('linkedin')) return `https://www.linkedin.com/learning/search?keywords=${q}`;
  if (p.includes('platzi')) return `https://platzi.com/buscar/?q=${q}`;
  if (p.includes('domestika')) return `https://www.domestika.org/es/search?query=${q}`;
  if (p.includes('hubspot')) return `https://academy.hubspot.com/search#q=${q}`;
  if (p.includes('google')) return `https://skillshop.withgoogle.com/catalog?q=${q}`;
  return `https://www.google.com/search?q=${q}+${encodeURIComponent(platform)}+curso`;
}

function matchCuratedCourse(title: string, platform: string, curated: CuratedCourse[]): CuratedCourse | null {
  if (!curated.length) return null;
  const tLow = title.toLowerCase();
  const pLow = platform.toLowerCase();
  // Exact or close title match on same platform
  const exact = curated.find(c =>
    c.title.toLowerCase() === tLow && c.platform.toLowerCase().includes(pLow.split(' ')[0])
  );
  if (exact) return exact;
  // Partial title match (>= 60% words overlap)
  const words = tLow.split(/\s+/).filter(w => w.length > 3);
  const best = curated.find(c => {
    const cWords = c.title.toLowerCase();
    const matches = words.filter(w => cWords.includes(w)).length;
    return matches >= Math.ceil(words.length * 0.6);
  });
  return best || null;
}

function PerfilTab({ userId, sharedProfile, setSharedProfile, sharedCvText, setSharedCvText, sharedPhoto, setSharedPhoto, curatedCourses, completedCourses, clickedCourseTitles, onCourseClicked, certifications, onAddCert }: {
  userId: string | null;
  sharedProfile: ProfileData;
  setSharedProfile: React.Dispatch<React.SetStateAction<ProfileData>>;
  sharedCvText: string;
  setSharedCvText: React.Dispatch<React.SetStateAction<string>>;
  sharedPhoto: string | null;
  setSharedPhoto: React.Dispatch<React.SetStateAction<string | null>>;
  curatedCourses: CuratedCourse[];
  completedCourses: CompletedCourse[];
  clickedCourseTitles: Set<string>;
  onCourseClicked: (title: string) => void;
  certifications: Array<{ id: number; name: string; institution: string; date: string; description: string }>;
  onAddCert: () => void;
}) {
  const profileData = sharedProfile;
  const setProfileData = setSharedProfile;
  const cvText = sharedCvText;
  const setCvText = setSharedCvText;
  const profilePhoto = sharedPhoto;
  const setProfilePhoto = setSharedPhoto;
  const [profileAnalysis, setProfileAnalysis] = useState<ProfileAnalysis | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [servicesUploading, setServicesUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isBiz = profileData.stage === 'emprendedor' || profileData.stage === 'freelancer' || profileData.stage === 'empresa';

  useEffect(() => {
    if (!userId) return;
    // If shared state already populated, skip fetching again
    if (sharedProfile.fullName) { setLoading(false); return; }
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/user-record?userId=${userId}`);
        const data = await res.json();
        const f = data.record?.fields || {};
        const answers = f.onboarding_answers ? JSON.parse(f.onboarding_answers) : {};

        setProfileData({
          stage: f.stage || answers.stage,
          fullName: f.name || f.fullName || answers.fullName,
          age_range: f.age_range || answers.age_range,
          passion: f.passion || answers.passion,
          impact: f.impact || answers.impact,
          services_description: f.services_description || answers.services_description,
          skills: f.skills || '',
        });

        if (f.cv_text) setCvText(f.cv_text);

        // Load profile photo
        const photo = f.profile_photo || localStorage.getItem('pirai_profile_photo');
        if (photo) setProfilePhoto(photo);

        if (f.profile_analysis) {
          try {
            const parsed = JSON.parse(f.profile_analysis);
            setProfileAnalysis({
              ...parsed,
              analyzed_at: f.profile_analysis_date || parsed.analyzed_at,
            });
          } catch {}
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const cropped = await cropImageToCircle(dataUrl);
      const photo = cropped || dataUrl;
      setProfilePhoto(photo);
      localStorage.setItem('pirai_profile_photo', photo);
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile_photo: photo }),
      });
    } catch (err) {
      console.error('Error uploading photo', err);
    }
    e.target.value = '';
  };

  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('pirai_email') === 'ale@alecadario.com';

  const canReanalyze = () => {
    if (isAdmin) return true;
    if (!profileAnalysis?.analyzed_at) return true;
    const days = (Date.now() - new Date(profileAnalysis.analyzed_at).getTime()) / (1000 * 60 * 60 * 24);
    return days >= 7;
  };

  const handleAnalyze = async () => {
    if (!userId) return;
    setAnalyzing(true);
    setError('');
    try {
      const res = await fetch('/api/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          cvText,
          stage: profileData.stage,
          age_range: profileData.age_range,
          passion: profileData.passion,
          impact: profileData.impact,
          services_description: profileData.services_description,
        }),
      });
      const data = await res.json();
      if (data.chances_pct !== undefined) {
        setProfileAnalysis({ ...data, analyzed_at: new Date().toISOString() });
      }
    } catch (e) {
      setError('Error al analizar el perfil');
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...formData }),
      });
      setProfileData(p => ({ ...p, ...formData }));
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadCV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setCvUploading(true);
    try {
      const fileBase64 = await toBase64(file);
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo CV');
      setCvText(data.cvText);
      // Persist to Airtable
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, cv_text: data.cvText }),
      });
    } catch (err) {
      alert('Error subiendo CV: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setCvUploading(false);
      e.target.value = '';
    }
  };

  const handleUploadServices = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setServicesUploading(true);
    try {
      const fileBase64 = await toBase64(file);
      const res = await fetch('/api/upload-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error subiendo archivo');
      const prev = profileData.services_description || '';
      const newDesc = prev
        ? `${prev}\n\n--- Extraído del archivo ---\n${data.cvText}`
        : data.cvText;
      setProfileData(p => ({ ...p, services_description: newDesc }));
      // Persist
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, services_description: newDesc }),
      });
    } catch (err) {
      alert('Error subiendo archivo: ' + (err instanceof Error ? err.message : 'Error'));
    } finally {
      setServicesUploading(false);
      e.target.value = '';
    }
  };

  const hasBasicInfo = !!(profileData.passion && profileData.impact);
  const hasContext = !!(profileData.services_description || cvText);
  const canAnalyze = hasBasicInfo && hasContext;

  const missing: string[] = [];
  if (!profileData.passion) missing.push('qué te apasiona');
  if (!profileData.impact) missing.push('qué impacto querés generar');
  if (!profileData.services_description && !cvText) missing.push(isBiz ? 'tus servicios/productos o tu CV' : 'tu contexto profesional o tu CV');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-pirai-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-[var(--color-brand-border)] overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-[var(--color-pirai-500)] to-[var(--color-pirai-600)]" />
        <div className="px-5 pb-5 -mt-10">
          <div className="flex items-end gap-4">
            <div className="relative">
              <label className="cursor-pointer group block">
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden relative">
                  {profilePhoto
                    ? <img src={profilePhoto} alt="Foto" className="w-full h-full object-cover" />
                    : <User className="w-8 h-8 text-gray-300" />
                  }
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
              <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                isBiz ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-teal-100 text-teal-700 border border-teal-200'
              }`}>
                {profileData.stage === 'emprendedor' ? 'Emprendedor/a' : profileData.stage === 'freelancer' ? 'Freelancer' : 'Buscando trabajo'}
              </span>
            </div>
            <div className="flex-1 pb-1">
              <p className="font-bold text-[var(--color-brand-dark)] text-lg leading-tight">{profileData.fullName || 'Tu nombre'}</p>
              {profileData.age_range && <p className="text-xs text-gray-500">{profileData.age_range} años</p>}
            </div>
            <button
              onClick={() => { setEditing(true); setFormData({ ...profileData }); }}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] px-3 py-2 rounded-lg hover:bg-[var(--color-pirai-100)] mb-1"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar
            </button>
          </div>
        </div>
      </div>

      {/* Skills acumuladas de cursos */}
      {profileData.skills && (
        <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[var(--color-pirai-500)]" />
            <p className="text-sm font-semibold text-[var(--color-brand-dark)]">Skills adquiridas</p>
            <span className="text-[10px] bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] px-2 py-0.5 rounded-full font-semibold ml-auto">De cursos completados</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {profileData.skills.split(',').filter(s => s.trim()).map((skill, i) => (
              <span key={i} className="text-xs bg-[var(--color-pirai-100)] text-[var(--color-pirai-700)] px-2.5 py-1 rounded-full font-medium">{skill.trim()}</span>
            ))}
          </div>
        </div>
      )}

      {/* Cursos y certificaciones */}
      {(completedCourses.length > 0 || certifications.length > 0) && (
        <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-[var(--color-pirai-500)]" />
            <p className="text-sm font-semibold text-[var(--color-brand-dark)]">Formación y certificaciones</p>
            <span className="text-[10px] bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] px-2 py-0.5 rounded-full font-semibold ml-auto">Suma al CV con IA ✨</span>
          </div>
          <div className="space-y-3">
            {completedCourses.map(course => (
              <div key={course.id} className="border border-[var(--color-brand-border)] rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-brand-dark)]">{course.course_title}</p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">{course.platform}{course.completed_at ? ` · ${new Date(course.completed_at).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}` : ''}</p>
                  </div>
                  {course.url && (
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-[var(--color-pirai-600)] hover:underline shrink-0">Ver curso →</a>
                  )}
                </div>
                {course.description && (
                  <p className="text-xs text-[var(--color-brand-muted)] mt-1.5 leading-relaxed">{course.description}</p>
                )}
                {course.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {course.tags.split(',').filter(t => t.trim()).map(tag => (
                      <span key={tag} className="text-[9px] bg-[var(--color-pirai-100)] text-[var(--color-pirai-600)] px-1.5 py-0.5 rounded-full">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {certifications.map(cert => (
              <div key={cert.id} className="border border-[var(--color-brand-border)] rounded-xl p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-brand-dark)]">{cert.name}</p>
                    <p className="text-xs text-[var(--color-brand-muted)] mt-0.5">{[cert.institution, cert.date].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                {cert.description && (
                  <p className="text-xs text-[var(--color-brand-muted)] mt-1.5 leading-relaxed">{cert.description}</p>
                )}
              </div>
            ))}
          </div>
          <button onClick={onAddCert}
            className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-pirai-600)] border border-dashed border-[var(--color-pirai-300)] rounded-xl py-2 hover:bg-[var(--color-pirai-50)] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar certificación externa
          </button>
        </div>
      )}
      {completedCourses.length === 0 && certifications.length === 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-[var(--color-pirai-500)]" />
            <p className="text-sm font-semibold text-[var(--color-brand-dark)]">Formación y certificaciones</p>
          </div>
          <p className="text-xs text-[var(--color-brand-muted)] mb-3">Completá cursos de Pirai o agregá certificaciones externas para que la IA las incluya en tu CV.</p>
          <button onClick={onAddCert}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--color-pirai-600)] border border-dashed border-[var(--color-pirai-300)] rounded-xl py-2 hover:bg-[var(--color-pirai-50)] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Agregar certificación externa
          </button>
        </div>
      )}

      {/* Lo que sabemos */}
      {profileAnalysis?.lo_que_sabemos && (
        <div className="bg-gradient-to-r from-[var(--color-pirai-50)] to-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] rounded-2xl p-4">
          <p className="text-xs font-semibold text-[var(--color-pirai-600)] uppercase tracking-wider mb-2">Lo que sabemos de vos</p>
          <p className="text-sm text-[var(--color-pirai-800)] leading-relaxed">{profileAnalysis.lo_que_sabemos}</p>
        </div>
      )}

      {/* Chances Score */}
      {profileAnalysis ? (
        <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[var(--color-brand-dark)]">
              Tus chances de {isBiz ? 'conseguir clientes' : 'conseguir empleo'}
            </p>
            <span className={`text-xl font-bold ${
              profileAnalysis.chances_pct >= 70 ? 'text-[var(--color-pirai-600)]' : profileAnalysis.chances_pct >= 40 ? 'text-amber-600' : 'text-red-500'
            }`}>
              {profileAnalysis.chances_pct}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                profileAnalysis.chances_pct >= 70 ? 'bg-[var(--color-pirai-500)]' : profileAnalysis.chances_pct >= 40 ? 'bg-amber-500' : 'bg-red-400'
              }`}
              style={{ width: `${profileAnalysis.chances_pct}%` }}
            />
          </div>
          {profileAnalysis.chances_explanation && (
            <p className="text-xs text-gray-500">{profileAnalysis.chances_explanation}</p>
          )}

          <div className="flex gap-3">
            {profileAnalysis.top_strength && (
              <div className="flex-1 bg-[var(--color-pirai-50)] rounded-xl p-3">
                <p className="text-[10px] font-semibold text-[var(--color-pirai-600)] uppercase mb-1">Tu fortaleza</p>
                <p className="text-xs text-[var(--color-pirai-800)]">{profileAnalysis.top_strength}</p>
              </div>
            )}
            {profileAnalysis.biggest_gap && (
              <div className="flex-1 bg-amber-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-amber-600 uppercase mb-1">Oportunidad de mejora</p>
                <p className="text-xs text-amber-800">{profileAnalysis.biggest_gap}</p>
              </div>
            )}
          </div>

          {(profileAnalysis.hard_skills?.length || profileAnalysis.soft_skills?.length) ? (
            <div className="flex gap-3">
              {profileAnalysis.hard_skills && profileAnalysis.hard_skills.length > 0 && (
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Hard skills</p>
                  <div className="flex flex-wrap gap-1">
                    {profileAnalysis.hard_skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-[var(--color-pirai-100)] text-[var(--color-pirai-700)] px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {profileAnalysis.soft_skills && profileAnalysis.soft_skills.length > 0 && (
                <div className="flex-1 bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Soft skills</p>
                  <div className="flex flex-wrap gap-1">
                    {profileAnalysis.soft_skills.map((s, i) => (
                      <span key={i} className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Stats — Tu perfil en números */}
          {profileAnalysis.stats && profileAnalysis.stats.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Tus puntos clave</p>
              <div className="grid grid-cols-2 gap-2">
                {profileAnalysis.stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                    <span className="text-base">{s.icon}</span>
                    <span className="text-xs text-[var(--color-brand-dark)]">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Course recommendations */}
          {profileAnalysis.course_recommendations && profileAnalysis.course_recommendations.length > 0 && (() => {
            const visible = profileAnalysis.course_recommendations.filter(c => {
              const curated = matchCuratedCourse(c.title, c.platform, curatedCourses);
              const title = (curated?.title || c.title).toLowerCase();
              return !clickedCourseTitles.has(title);
            });
            if (visible.length === 0) return null;
            return (
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-2">Recomendaciones para crecer</p>
              <div className="space-y-2">
                {visible.map((c, i) => {
                  const curated = matchCuratedCourse(c.title, c.platform, curatedCourses);
                  const href = curated?.url || getPlatformSearchUrl(c.title, c.platform);
                  const isCurated = !!curated?.url;
                  const courseTitle = curated?.title || c.title;
                  return (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                      onClick={async (e) => {
                        if (!userId) return;
                        e.preventDefault();
                        onCourseClicked(courseTitle);
                        try {
                          await fetch('/api/course-progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              userId,
                              course_title: courseTitle,
                              platform: c.platform,
                              url: href,
                              tags: curated?.tags?.join(', ') || '',
                            }),
                          });
                        } catch { /* silent */ }
                        window.open(href, '_blank', 'noopener,noreferrer');
                      }}
                      className="block bg-[var(--color-pirai-50)] border border-[var(--color-pirai-100)] rounded-xl px-3 py-2.5 hover:bg-[var(--color-pirai-100)] transition-colors group">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-[var(--color-pirai-800)] group-hover:underline">
                          {curated?.title || c.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {curated?.free && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Gratis</span>}
                          {isCurated && <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">✓ Curado</span>}
                          <span className="text-[10px] font-bold bg-[var(--color-pirai-100)] text-[var(--color-pirai-600)] px-2 py-0.5 rounded-full">{c.platform}</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-[var(--color-pirai-600)] mt-0.5">{curated?.description || c.reason}</p>
                      {(curated?.tags?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {curated?.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[9px] bg-white text-[var(--color-pirai-500)] border border-[var(--color-pirai-200)] px-1.5 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
            );
          })()}

          {/* Re-analyze */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !canReanalyze()}
            className={`w-full text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-colors ${
              canReanalyze() ? 'text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)]' : 'text-gray-400 bg-gray-100'
            }`}
          >
            {analyzing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Re-analizando...</> : <><RefreshCw className="w-3.5 h-3.5" /> Re-analizar perfil</>}
          </button>
          {!canReanalyze() && (
            <p className="text-[10px] text-gray-400 text-center">El análisis se puede regenerar 1 vez por semana</p>
          )}
        </div>
      ) : canAnalyze ? (
        <button
          onClick={handleAnalyze}
          disabled={analyzing}
          className="w-full bg-gradient-to-r from-[var(--color-pirai-600)] to-[var(--color-pirai-600)] text-white px-4 py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 shadow-sm"
        >
          {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analizando tu perfil...</> : <><Sparkles className="w-4 h-4" /> Analizar mi perfil</>}
        </button>
      ) : (
        <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-200)] rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-[var(--color-pirai-100)] rounded-xl flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[var(--color-pirai-500)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-pirai-900)] text-sm mb-1">Completá tu perfil para desbloquear el análisis</p>
              <p className="text-xs text-[var(--color-pirai-700)] leading-relaxed mb-3">
                Para que la IA pueda darte un análisis útil y personalizado, necesitamos saber un poco más de vos.
              </p>
              <div className="space-y-1.5 mb-3">
                {missing.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--color-pirai-300)] shrink-0" />
                    <span className="text-xs text-[var(--color-pirai-600)]">Falta: {item}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => { setEditing(true); setFormData({ ...profileData }); }}
                className="text-xs font-semibold text-[var(--color-pirai-700)] bg-[var(--color-pirai-100)] px-3 py-2 rounded-lg hover:bg-[var(--color-pirai-200)] transition-colors inline-flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" /> Completar ahora
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Documentos / CV */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--color-brand-dark)] text-sm">Documentos</h3>
          <label className={`cursor-pointer text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${cvUploading ? 'bg-gray-100 text-gray-400' : 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-100)]'}`}>
            {cvUploading
              ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />Subiendo...</>
              : <><Upload className="w-3 h-3 inline mr-1" />{cvText ? 'Actualizar CV' : 'Subir CV'}</>}
            <input type="file" accept=".pdf" onChange={handleUploadCV} className="hidden" disabled={cvUploading} />
          </label>
        </div>
        {cvText ? (
          <div className="flex items-center gap-3 bg-[var(--color-pirai-50)] rounded-xl p-3">
            <CheckCircle className="w-5 h-5 text-[var(--color-pirai-500)] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[var(--color-pirai-700)]">CV cargado</p>
              <p className="text-xs text-[var(--color-pirai-600)]">{cvText.length} caracteres extraídos</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400">Subí tu CV en PDF para un análisis más preciso.</p>
          </div>
        )}
      </div>

      {/* Context / Services */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--color-brand-border)] shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[var(--color-brand-dark)] text-sm">
            {isBiz ? 'Tus servicios / productos' : 'Tu contexto profesional'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditing(true); setFormData({ ...profileData }); }}
              className="text-xs font-semibold text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] px-2.5 py-1.5 rounded-lg hover:bg-[var(--color-pirai-100)]"
            >
              <Pencil className="w-3 h-3 inline mr-1" />{profileData.services_description ? 'Editar' : 'Agregar'}
            </button>
            <label className={`cursor-pointer text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${servicesUploading ? 'bg-gray-100 text-gray-400' : 'bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-100)]'}`}>
              {servicesUploading ? <><Loader2 className="w-3 h-3 animate-spin inline mr-1" />Subiendo...</> : <><Upload className="w-3 h-3 inline mr-1" />Subir PDF</>}
              <input type="file" accept=".pdf" onChange={handleUploadServices} className="hidden" disabled={servicesUploading} />
            </label>
          </div>
        </div>
        {profileData.services_description ? (
          <div className="bg-[var(--color-pirai-50)] rounded-xl p-3">
            <p className="text-sm text-[var(--color-pirai-800)] leading-relaxed">{profileData.services_description}</p>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
            <p className="text-xs text-amber-700">
              {isBiz
                ? '📋 Escribí tus servicios/productos. Esto le da contexto a la IA para ayudarte mejor.'
                : '📋 Escribí tu info profesional. Así la IA entiende tu situación y te da mejores recomendaciones.'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Panel */}
      {editing && (
        <div className="bg-white rounded-2xl p-5 border-2 border-[var(--color-pirai-200)] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[var(--color-brand-dark)]">Editar perfil</h3>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={saving} className="text-xs font-semibold text-white bg-[var(--color-pirai-600)] px-3 py-1.5 rounded-lg hover:bg-[var(--color-pirai-700)] disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
              <button onClick={() => setEditing(false)} className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                Cancelar
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Etapa</label>
              <select
                value={formData.stage || ''}
                onChange={e => setFormData(p => ({ ...p, stage: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-pirai-500)] outline-none"
              >
                <option value="job_seeker">Buscando empleo</option>
                <option value="emprendedor">Emprendedor/a</option>
                <option value="freelancer">Freelancer</option>
                <option value="transicion">En transición</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">¿Qué te apasiona?</label>
              <textarea
                value={formData.passion || ''}
                onChange={e => setFormData(p => ({ ...p, passion: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-pirai-500)] outline-none resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">¿Qué impacto querés generar?</label>
              <textarea
                value={formData.impact || ''}
                onChange={e => setFormData(p => ({ ...p, impact: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-pirai-500)] outline-none resize-none"
                rows={2}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {formData.stage === 'emprendedor' || formData.stage === 'freelancer'
                  ? '¿Qué servicios o productos ofrecés?'
                  : '¿A qué te dedicás? Contanos más de tu perfil profesional'}
              </label>
              <textarea
                value={formData.services_description || ''}
                onChange={e => setFormData(p => ({ ...p, services_description: e.target.value }))}
                placeholder={
                  formData.stage === 'emprendedor' || formData.stage === 'freelancer'
                    ? 'Ej: Diseño web para pymes, consultoría en marketing digital...'
                    : 'Ej: Soy analista de datos con 3 años de experiencia en retail...'
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-pirai-500)] outline-none resize-none"
                rows={4}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CVContent({ cv, rName, rEmail, rLinkedin, idioma, improving, onImprove }: {
  cv: Record<string, unknown>; rName: string; rEmail: string; rLinkedin: string;
  idioma: string; improving: string | null; onImprove: (section: string, index: number | null) => void;
}) {
  return (
    <div className="space-y-5 text-sm">
      {(rName || rEmail) ? (
        <div className="pb-3 border-b border-gray-100">
          {rName ? <p className="font-bold text-[var(--color-brand-dark)] text-base">{rName}</p> : null}
          {rEmail ? <p className="text-xs text-gray-500">{rEmail}{rLinkedin ? ' · ' + rLinkedin : ''}</p> : null}
        </div>
      ) : null}

      {cv.resumen ? (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider">{LANG_LABELS.resumen[idioma]}</p>
            <button onClick={() => onImprove('resumen', null)} disabled={improving === 'resumen'}
              className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-100)] disabled:opacity-50 transition-colors">
              {improving === 'resumen' ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} Mejorar
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed">{String(cv.resumen)}</p>
        </div>
      ) : null}

      {(cv.experiencia as unknown[])?.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider mb-2">{LANG_LABELS.experiencia[idioma]}</p>
          <div className="space-y-3">
            {(cv.experiencia as Record<string,unknown>[]).map((exp, i) => (
              <div key={i}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-[var(--color-brand-dark)]">{String(exp.cargo)}</p>
                    <p className="text-[11px] text-[var(--color-pirai-600)]">{[exp.empresa, exp.periodo, exp.ubicacion].filter(Boolean).join(' · ')}</p>
                  </div>
                  <button onClick={() => onImprove('experiencia', i)} disabled={improving === `exp-${i}`}
                    className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[var(--color-pirai-50)] text-[var(--color-pirai-600)] hover:bg-[var(--color-pirai-100)] disabled:opacity-50 shrink-0 transition-colors">
                    {improving === `exp-${i}` ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Sparkles className="w-2.5 h-2.5" />} Mejorar
                  </button>
                </div>
                <ul className="mt-1.5 space-y-1 pl-2">
                  {((exp.logros as string[]) || []).map((l, j) => (
                    <li key={j} className="flex items-start gap-1.5 text-xs text-gray-600">
                      <span className="text-[var(--color-pirai-400)] shrink-0">•</span>{l}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {(cv.logros_clave as unknown[])?.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider mb-1.5">{LANG_LABELS.logros[idioma]}</p>
          <ul className="space-y-1 pl-2">
            {(cv.logros_clave as string[]).map((l, i) => <li key={i} className="text-xs text-gray-600">• {l}</li>)}
          </ul>
        </div>
      ) : null}

      {(cv.educacion as unknown[])?.length > 0 ? (
        <div>
          <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider mb-1.5">{LANG_LABELS.educacion[idioma]}</p>
          <div className="space-y-1.5">
            {(cv.educacion as Record<string,unknown>[]).map((e, i) => (
              <div key={i}>
                <p className="font-semibold text-[var(--color-brand-dark)] text-xs">{String(e.titulo)}</p>
                <p className="text-[11px] text-[var(--color-pirai-600)]">{[e.institucion, e.anio].filter(Boolean).join(' · ')}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {((cv.habilidades as unknown[])?.length || (cv.herramientas as unknown[])?.length || (cv.idiomas as unknown[])?.length) ? (
        <div>
          <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider mb-1.5">{LANG_LABELS.habilidades[idioma]}</p>
          {(cv.habilidades as string[])?.length > 0 ? <p className="text-xs text-gray-600">{(cv.habilidades as string[]).join(' · ')}</p> : null}
          {(cv.herramientas as string[])?.length > 0 ? <p className="text-[11px] text-gray-500 mt-0.5">{(cv.herramientas as string[]).join(' · ')}</p> : null}
          {(cv.idiomas as string[])?.length > 0 ? <p className="text-[11px] text-gray-500 mt-0.5">{(cv.idiomas as string[]).join(' · ')}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

const CV_COLORS = [
  { key: 'esmeralda', color: '#00A86B', label: 'Verde Esmeralda' },
  { key: 'turquesa',  color: '#1BCDD1', label: 'Turquesa'        },
  { key: 'oscuro',    color: '#2D3748', label: 'Azul Oscuro'     },
  { key: 'blanco',    color: '#F2F4F7', label: 'Gris Claro'      },
];

const LANG_LABELS: Record<string, Record<string, string>> = {
  resumen: { es: 'Perfil Profesional', en: 'Professional Profile', pt: 'Perfil Profissional' },
  experiencia: { es: 'Experiencia', en: 'Experience', pt: 'Experiência' },
  educacion: { es: 'Educación', en: 'Education', pt: 'Educação' },
  habilidades: { es: 'Habilidades & Herramientas', en: 'Skills & Tools', pt: 'Habilidades & Ferramentas' },
  logros: { es: 'Logros Clave', en: 'Key Achievements', pt: 'Conquistas-Chave' },
};

type PipelineCompany = { id: string; name: string };
type PipelineContact = { id: string; name: string; email?: string; empresaId: string | null; empresaNombre: string };

function EmpresaPicker({ empresas, empresaId, empresa, onChange }: {
  empresas: PipelineCompany[];
  empresaId: string | null;
  empresa: string;
  onChange: (empresa: string, empresaId: string | null) => void;
}) {
  const [manual, setManual] = useState(false);

  const selectValue = empresaId ? empresaId : manual ? '__manual__' : '__none__';

  return (
    <div>
      <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa (opcional)</label>
      {empresas.length > 0 ? (
        <>
          <select
            value={selectValue}
            onChange={e => {
              const val = e.target.value;
              if (val === '__none__') { setManual(false); onChange('', null); }
              else if (val === '__manual__') { setManual(true); onChange('', null); }
              else {
                const em = empresas.find(x => x.id === val);
                setManual(false);
                onChange(em?.name || '', val);
              }
            }}
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
          >
            <option value="__none__">Sin empresa específica</option>
            <optgroup label="Mis empresas">
              {empresas.map(em => <option key={em.id} value={em.id}>{em.name}</option>)}
            </optgroup>
            <option value="__manual__">✏️ Escribir manualmente</option>
          </select>
          {manual && (
            <input
              value={empresa}
              onChange={e => onChange(e.target.value, null)}
              placeholder="ej. Mercado Libre"
              className="mt-2 w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
              autoFocus
            />
          )}
        </>
      ) : (
        <input
          value={empresa}
          onChange={e => onChange(e.target.value, null)}
          placeholder="ej. Mercado Libre"
          className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
        />
      )}
    </div>
  );
}

function CVGenerator({ userId, sharedProfile, sharedPhoto, setSharedPhoto }: {
  userId: string | null;
  sharedProfile: ProfileData;
  sharedPhoto: string | null;
  setSharedPhoto: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [form, setForm] = useState({
    rol: '', empresa: '', empresaId: null as string | null,
    idioma: 'es', genero: (sharedProfile as Record<string, unknown>)?.genero as string || 'femenino',
    jobDescription: '', contexto: '', wantsCoverLetter: false,
    contactName: '', isGeneric: true, colorTheme: 'esmeralda',
  });
  type CvResult = {
    cv?: Record<string, unknown>;
    coverLetter?: string;
    userName?: string | null;
    userEmail?: string | null;
    userPhone?: string | null;
    userLinkedin?: string | null;
    portafolio?: Record<string, unknown>;
  };
  const [result, setResult] = useState<CvResult | null>(null);
  const [resultTab, setResultTab] = useState<'cv' | 'cover'>('cv');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [improving, setImproving] = useState<string | null>(null);
  const cvPhoto = sharedPhoto;
  const setCvPhoto = setSharedPhoto;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [empresas, setEmpresas] = useState<PipelineCompany[]>([]);
  const [contactos, setContactos] = useState<PipelineContact[]>([]);
  const [gmailConnected, setGmailConnected] = useState(false);
  type ComposeData = {
    to: string; subject: string; body: string; attachments: Array<{ filename: string; base64: string; mimeType: string }>;
  };
  const [compose, setCompose] = useState<ComposeData | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/pipeline-data?userId=${userId}`)
      .then(r => r.json())
      .then(d => { setEmpresas(d.companies || []); setContactos(d.contacts || []); })
      .catch(() => {});
    fetch(`/api/gmail-check?userId=${userId}`)
      .then(r => r.json())
      .then(d => setGmailConnected(!!d.connected))
      .catch(() => {});
    // Photo is managed via sharedPhoto from MarcaPage (loaded in PerfilTab)
    if (!cvPhoto) {
      const local = localStorage.getItem('pirai_profile_photo');
      if (local) setCvPhoto(local);
    }
  }, [userId]);

  const filteredContacts = form.empresaId
    ? contactos.filter(c => c.empresaId === form.empresaId)
    : contactos;

  const generate = async () => {
    if (!userId || !form.rol) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form, senderName: '' }),
      });
      const data = await res.json();
      if (res.status === 429 || data.error === 'limit_reached') {
        setError('Llegaste al límite de generaciones de CV de tu plan esta semana.');
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Error generando CV');
      setResult(data);
      setResultTab('cv');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando el CV');
    } finally {
      setLoading(false);
    }
  };

  const improveSection = async (section: string, index: number | null) => {
    if (!result?.cv) return;
    const cv = result.cv as Record<string, unknown>;
    const key = index !== null ? `exp-${index}` : section;
    setImproving(key);
    try {
      const body: Record<string, unknown> = { section, rol: form.rol, rolEmpresa: form.empresa, jobDescription: form.jobDescription, idioma: form.idioma, genero: form.genero };
      if (section === 'resumen') body.resumen = cv.resumen;
      if (section === 'experiencia' && index !== null) {
        const exp = (cv.experiencia as Record<string, unknown>[])[index];
        body.cargo = exp.cargo; body.empresa = exp.empresa; body.logros = exp.logros;
      }
      const res = await fetch('/api/improve-cv-section', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (section === 'resumen' && data.resumen) {
        setResult(p => p ? { ...p, cv: { ...p.cv, resumen: data.resumen } } : p);
      } else if (section === 'experiencia' && index !== null && data.logros) {
        setResult(p => {
          if (!p?.cv) return p;
          const newExp = [...(p.cv.experiencia as Record<string, unknown>[])];
          newExp[index] = { ...newExp[index], logros: data.logros };
          return { ...p, cv: { ...p.cv, experiencia: newExp } };
        });
      }
    } catch {}
    setImproving(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const cropped = await cropImageToCircle(url);
    URL.revokeObjectURL(url);
    if (cropped) {
      setCvPhoto(cropped);
      localStorage.setItem('pirai_profile_photo', cropped);
      if (userId) {
        fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, profile_photo: cropped }),
        }).catch(() => {});
      }
    }
    e.target.value = '';
  };

  const removePhoto = () => {
    setCvPhoto(null);
    localStorage.removeItem('pirai_profile_photo');
    if (userId) {
      fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, profile_photo: '' }),
      }).catch(() => {});
    }
  };

  const downloadPDF = async (isCV: boolean) => {
    if (!result) return;
    setPdfLoading(true);
    try {
      await generateCvPDF({ cvGenResult: result, cvGenForm: form, isCV, cvPhoto });
    } catch (e) {
      console.error(e);
    } finally {
      setPdfLoading(false);
    }
  };

  const openCompose = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const hasCoverLetter = !!result.coverLetter;
      const b64 = await generateCvPDF({ cvGenResult: result, cvGenForm: form, isCV: true, cvPhoto, returnBase64: true, combined: hasCoverLetter });
      if (!b64 || typeof b64 !== 'string') { alert('No se pudo generar el PDF'); return; }
      const fname = hasCoverLetter
        ? `CV_CoverLetter_${(result.userName || '').replace(/\s/g, '_')}.pdf`
        : `CV_${(result.userName || '').replace(/\s/g, '_')}.pdf`;
      const contacto = contactos.find(c => c.name === form.contactName);
      const to = contacto?.email || '';
      const subject = `${form.rol}${form.empresa ? ` - ${form.empresa}` : ''}`;
      const bodies: Record<string, string> = {
        es: `Buen día,\n\nLe hago llegar adjunto mi CV${hasCoverLetter ? ' y carta de presentación' : ''} para la posición de ${form.rol}${form.empresa ? ` en ${form.empresa}` : ''}.\n\nQuedo a su disposición para ampliar información o coordinar una entrevista.\n\nMuchas gracias,\n${result.userName || ''}`,
        en: `Hello,\n\nPlease find attached my CV${hasCoverLetter ? ' and cover letter' : ''} for the ${form.rol} position${form.empresa ? ` at ${form.empresa}` : ''}.\n\nI would love to connect and discuss how I can contribute.\n\nBest regards,\n${result.userName || ''}`,
        pt: `Olá,\n\nSegue em anexo meu CV${hasCoverLetter ? ' e carta de apresentação' : ''} para a vaga de ${form.rol}${form.empresa ? ` na ${form.empresa}` : ''}.\n\nFico à disposição para conversarmos.\n\nAtenciosamente,\n${result.userName || ''}`,
      };
      setCompose({ to, subject, body: bodies[form.idioma] || bodies.es, attachments: [{ filename: fname, base64: b64, mimeType: 'application/pdf' }] });
      setEmailSent(false);
    } catch (e) {
      alert('Error preparando el email: ' + (e instanceof Error ? e.message : 'Error'));
    } finally {
      setPdfLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!compose || !userId) return;
    setSendingEmail(true);
    try {
      const res = await fetch('/api/gmail-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, to: compose.to, subject: compose.subject, body: compose.body, attachments: compose.attachments }),
      });
      if (!res.ok) throw new Error('Error enviando');
      setEmailSent(true);
      setTimeout(() => { setCompose(null); setEmailSent(false); }, 2000);
    } catch {
      alert('Error enviando el email. Verificá que Gmail esté conectado.');
    } finally {
      setSendingEmail(false);
    }
  };

  const getCopyText = () => {
    if (resultTab === 'cover') return result?.coverLetter || '';
    const cv = result?.cv as Record<string, unknown> | undefined;
    if (!cv) return '';
    return [cv.resumen, ...((cv.experiencia as Record<string,unknown>[]) || []).map(e => `${e.cargo} — ${e.empresa}\n${((e.logros as string[]) || []).join('\n')}`)].join('\n\n');
  };

  const cv = result?.cv as Record<string, unknown> | undefined;
  const rName = String(result?.userName || '');
  const rEmail = String(result?.userEmail || '');
  const rLinkedin = String(result?.userLinkedin || '');

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-[400px_1fr] gap-8">
      {/* Form */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-0.5">Generador de CV con IA</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Adaptado al rol, en tu idioma, listo para enviar.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol al que te postulás *</label>
          <input value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))}
            placeholder="ej. Product Manager en startup tech"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>

        <EmpresaPicker
          empresas={empresas}
          empresaId={form.empresaId}
          empresa={form.empresa}
          onChange={(empresa, empresaId) => setForm(p => ({ ...p, empresa, empresaId, contactName: '' }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Idioma</label>
            <select value={form.idioma} onChange={e => setForm(p => ({ ...p, idioma: e.target.value }))}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="es">Español</option><option value="en">Inglés</option><option value="pt">Portugués</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Descripción del puesto (opcional)</label>
          <textarea rows={3} value={form.jobDescription} onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
            placeholder="Pegá acá la descripción del puesto para usar sus palabras clave..."
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Algo que quieras destacar (opcional)</label>
          <textarea rows={2} value={form.contexto} onChange={e => setForm(p => ({ ...p, contexto: e.target.value }))}
            placeholder="Logros recientes, proyectos, habilidades específicas..."
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
        </div>

        <div className="bg-gray-50 rounded-xl p-3 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.wantsCoverLetter}
              onChange={e => setForm(p => ({ ...p, wantsCoverLetter: e.target.checked }))}
              className="rounded accent-[var(--color-pirai-600)]" />
            <span className="text-sm font-medium text-gray-700">Generar cover letter también</span>
          </label>
          {form.wantsCoverLetter && (
            <div>
              <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">
                Dirigida a (opcional)
              </label>
              {filteredContacts.length > 0 ? (
                <select
                  value={form.contactName}
                  onChange={e => setForm(p => ({ ...p, contactName: e.target.value, isGeneric: !e.target.value }))}
                  className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
                >
                  <option value="">Equipo de {form.empresa || 'la empresa'} (genérica)</option>
                  {filteredContacts.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name}{c.empresaNombre ? ` · ${c.empresaNombre}` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.contactName}
                  onChange={e => setForm(p => ({ ...p, contactName: e.target.value, isGeneric: !e.target.value }))}
                  placeholder="Nombre del contacto (opcional)"
                  className="w-full border border-[var(--color-brand-border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]"
                />
              )}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--color-brand-muted)] mb-2">Foto de perfil (opcional)</p>
          <div className="flex items-center gap-3">
            {cvPhoto && (
              <div className="relative w-12 h-12 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cvPhoto} alt="foto" className="w-12 h-12 rounded-full object-cover border-2 border-[var(--color-pirai-200)]" />
                <button
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                >
                  <X className="w-2.5 h-2.5 text-white" />
                </button>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)] px-3 py-1.5 rounded-lg transition-colors">
              <Camera className="w-3.5 h-3.5" />
              {cvPhoto ? 'Cambiar foto' : 'Subir foto'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-2">Color del PDF</label>
          <div className="flex gap-2">
            {CV_COLORS.map(t => (
              <button key={t.key} title={t.label} onClick={() => setForm(p => ({ ...p, colorTheme: t.key }))}
                style={{ backgroundColor: t.color }}
                className={`w-8 h-8 rounded-full border-2 transition-all ${form.colorTheme === t.key ? 'border-[var(--color-pirai-600)] scale-110 shadow-md' : 'border-gray-200'}`} />
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button onClick={generate} disabled={loading || !form.rol}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generando...' : 'Generar CV con IA'}
        </button>
      </div>

      {/* Result panel */}
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] flex flex-col min-h-[500px] overflow-hidden">
        {result ? (
          <>
            {/* Tabs */}
            <div className="flex items-center justify-between px-5 pt-4 pb-0 border-b border-[var(--color-brand-border)]">
              <div className="flex gap-1">
                <button onClick={() => setResultTab('cv')}
                  className={`text-xs font-semibold px-4 py-2 rounded-t-lg border-b-2 transition-colors ${resultTab === 'cv' ? 'text-[var(--color-pirai-600)] border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)]' : 'text-gray-400 border-transparent'}`}>
                  CV
                </button>
                {result.coverLetter && (
                  <button onClick={() => setResultTab('cover')}
                    className={`text-xs font-semibold px-4 py-2 rounded-t-lg border-b-2 transition-colors ${resultTab === 'cover' ? 'text-[var(--color-pirai-600)] border-[var(--color-pirai-500)] bg-[var(--color-pirai-50)]' : 'text-gray-400 border-transparent'}`}>
                    Cover Letter
                  </button>
                )}
              </div>
              <div className="flex gap-2 pb-2">
                <button onClick={() => { navigator.clipboard.writeText(getCopyText()); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-[var(--color-pirai-500)]" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                {resultTab === 'cv' && (
                  <button onClick={() => downloadPDF(true)} disabled={pdfLoading}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)] px-2.5 py-1.5 rounded-lg border border-[var(--color-pirai-200)] transition-colors disabled:opacity-50">
                    {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} PDF
                  </button>
                )}
                {resultTab === 'cover' && result?.coverLetter && (
                  <button onClick={() => downloadPDF(false)} disabled={pdfLoading}
                    className="flex items-center gap-1.5 text-xs text-[var(--color-pirai-600)] bg-[var(--color-pirai-50)] hover:bg-[var(--color-pirai-100)] px-2.5 py-1.5 rounded-lg border border-[var(--color-pirai-200)] transition-colors disabled:opacity-50">
                    {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />} PDF
                  </button>
                )}
                {gmailConnected && (
                  <button onClick={openCompose} disabled={pdfLoading}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg border border-teal-200 transition-colors disabled:opacity-50">
                    {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />} Enviar por Gmail
                  </button>
                )}
                <button onClick={() => { setResult(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  ← Nuevo
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-5">
              {resultTab === 'cover' ? (
                <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--color-brand-dark)] leading-relaxed">{result.coverLetter}</pre>
              ) : cv ? (
                <CVContent cv={cv} rName={rName} rEmail={rEmail} rLinkedin={rLinkedin} idioma={form.idioma} improving={improving} onImprove={improveSection} />
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)] p-8">
            <FileText className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Completá el formulario y hacé clic en &quot;Generar CV con IA&quot; para ver el resultado acá.</p>
          </div>
        )}
      </div>

      {/* Compose modal */}
      {compose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-500" />
                <h3 className="font-bold text-[var(--color-brand-dark)]">Enviar por Gmail</h3>
              </div>
              <button onClick={() => setCompose(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Para</label>
                <input
                  value={compose.to}
                  onChange={e => setCompose(p => p ? { ...p, to: e.target.value } : p)}
                  placeholder="email@empresa.com"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Asunto</label>
                <input
                  value={compose.subject}
                  onChange={e => setCompose(p => p ? { ...p, subject: e.target.value } : p)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Mensaje</label>
                <textarea
                  value={compose.body}
                  onChange={e => setCompose(p => p ? { ...p, body: e.target.value } : p)}
                  rows={7}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="text-xs text-teal-700 font-medium">{compose.attachments[0]?.filename}</span>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={() => setCompose(null)} className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100">Cancelar</button>
              <button
                onClick={sendEmail}
                disabled={sendingEmail || !compose.to || emailSent}
                className="flex items-center gap-2 text-sm font-semibold text-white bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                {emailSent ? <><CheckCircle className="w-4 h-4" /> Enviado</> : sendingEmail ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartaGenerator({ userId }: { userId: string | null }) {
  const [form, setForm] = useState({ rol: '', empresa: '', idioma: 'es', genero: 'femenino', jobDescription: '', contexto: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!userId || !form.rol) return;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetch('/api/generate-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form, wantsCoverLetter: true, isGeneric: true, senderName: '' }),
      });
      const data = await res.json();
      if (res.status === 429 || data.error === 'limit_reached') { setError('Límite de generaciones alcanzado en tu plan.'); return; }
      if (!res.ok) throw new Error(data.error || 'Error generando la carta');
      setResult(data.coverLetter || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la carta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-[400px_1fr] gap-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-0.5">Carta de presentación</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Personalizada para cada empresa, en tu tono.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol *</label>
          <input value={form.rol} onChange={e => setForm(p => ({ ...p, rol: e.target.value }))} placeholder="ej. Diseñadora UX"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa (opcional)</label>
          <input value={form.empresa} onChange={e => setForm(p => ({ ...p, empresa: e.target.value }))} placeholder="ej. Spotify"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Idioma</label>
            <select value={form.idioma} onChange={e => setForm(p => ({ ...p, idioma: e.target.value }))}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="es">Español</option><option value="en">Inglés</option><option value="pt">Portugués</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Género</label>
            <select value={form.genero} onChange={e => setForm(p => ({ ...p, genero: e.target.value }))}
              className="w-full border border-[var(--color-brand-border)] rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]">
              <option value="femenino">Femenino</option><option value="masculino">Masculino</option><option value="no_binario">No binario</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Descripción del puesto (opcional)</label>
          <textarea rows={3} value={form.jobDescription} onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
            placeholder="Pegá la descripción del puesto para personalizar la carta..."
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Algo que quieras destacar (opcional)</label>
          <textarea rows={2} value={form.contexto} onChange={e => setForm(p => ({ ...p, contexto: e.target.value }))}
            placeholder="Motivación especial, proyectos relevantes, por qué esta empresa..."
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button onClick={generate} disabled={loading || !form.rol}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generando...' : 'Generar carta'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] flex flex-col min-h-[500px]">
        {result ? (
          <>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--color-brand-border)]">
              <h3 className="font-semibold text-sm text-[var(--color-brand-dark)]">Tu carta de presentación</h3>
              <div className="flex gap-2">
                <button onClick={() => { navigator.clipboard.writeText(result); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1.5 text-xs text-gray-600 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
                  {copied ? <CheckCircle className="w-3.5 h-3.5 text-[var(--color-pirai-500)]" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copiado' : 'Copiar'}
                </button>
                <button onClick={() => setResult('')} className="text-xs text-gray-400 hover:text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">← Nueva</button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-5">
              <pre className="whitespace-pre-wrap font-sans text-sm text-[var(--color-brand-dark)] leading-relaxed">{result}</pre>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)] p-8">
            <Sparkles className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Completá el formulario para generar tu carta de presentación.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PrepGenerator({ userId }: { userId: string | null }) {
  const [form, setForm] = useState({ companyName: '', role: '', jobDescription: '' });
  type PrepResult = { intel?: string[]; tips?: Array<{ title: string; action: string }>; resumen?: string };
  const [result, setResult] = useState<PrepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generate = async () => {
    if (!userId || !form.role) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/interview-prep', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...form, pastReviews: [] }),
      });
      const data = await res.json();
      if (res.status === 429 || data.error === 'limit_reached') { setError('Límite de preparaciones alcanzado en tu plan esta semana.'); return; }
      if (!res.ok) throw new Error(data.error || 'Error generando la prep');
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generando la prep');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-[400px_1fr] gap-8">
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-brand-dark)] mb-0.5">Prep de entrevista</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Intel de la empresa y tips personalizados para el rol.</p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Rol *</label>
          <input value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} placeholder="ej. Data Analyst"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Empresa (opcional)</label>
          <input value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} placeholder="ej. Rappi"
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-brand-muted)] block mb-1.5">Descripción del puesto (opcional)</label>
          <textarea rows={4} value={form.jobDescription} onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
            placeholder="Pegá la descripción del puesto para una prep más específica..."
            className="w-full border border-[var(--color-brand-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pirai-500)] resize-none" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button onClick={generate} disabled={loading || !form.role}
          className="w-full flex items-center justify-center gap-2 bg-[var(--color-pirai-500)] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[var(--color-pirai-600)] disabled:opacity-50 transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {loading ? 'Preparando...' : 'Preparar entrevista'}
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--color-brand-border)] flex flex-col min-h-[500px]">
        {result ? (
          <div className="flex-1 overflow-auto p-5 space-y-5">
            {result.resumen && (
              <div className="bg-[var(--color-pirai-50)] border border-[var(--color-pirai-100)] rounded-xl p-4">
                <p className="text-[10px] font-bold text-[var(--color-pirai-600)] uppercase tracking-wider mb-2">En qué enfocarse</p>
                <p className="text-sm text-[var(--color-pirai-800)] leading-relaxed">{result.resumen}</p>
              </div>
            )}
            {result.intel && result.intel.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Intel de la empresa</p>
                <ul className="space-y-2">
                  {result.intel.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--color-brand-dark)]">
                      <span className="w-5 h-5 rounded-full bg-[var(--color-pirai-100)] text-[var(--color-pirai-600)] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.tips && result.tips.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tips para la entrevista</p>
                <div className="space-y-3">
                  {result.tips.map((tip, i) => (
                    <div key={i} className="border border-[var(--color-brand-border)] rounded-xl p-3.5">
                      <p className="font-semibold text-sm text-[var(--color-brand-dark)] mb-1">{tip.title}</p>
                      <p className="text-xs text-gray-600 leading-relaxed">{tip.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600">← Nueva prep</button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[var(--color-brand-muted)] p-8">
            <CheckCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm text-center">Ingresá el rol y la empresa para recibir intel y tips personalizados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
