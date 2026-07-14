'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Calendar, Clock, User, ChevronRight, X, Loader2, CheckCircle, Play, Tag, ExternalLink, CalendarPlus, Download } from 'lucide-react';

interface Webinar {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  speaker: string;
  speaker_bio: string;
  speaker_linkedin: string;
  google_calendar_url: string;
  link_zoom: string;
  grabacion_url: string;
  tags: string;
}

const PLACEHOLDER_WEBINARS: Webinar[] = [
  {
    id: 'demo-1',
    titulo: 'Cómo negociar tu salario sin miedo',
    descripcion: 'Estrategias reales para negociar con confianza, evitar errores comunes y conseguir el salario que merecés. Con ejemplos concretos y role-play en vivo.',
    fecha: '2026-08-15',
    hora: '19:00',
    speaker: 'Ale Cadario',
    speaker_bio: 'CEO de Piraí, ex-reclutadora y especialista en carreras.',
    speaker_linkedin: '',
    google_calendar_url: '',
    link_zoom: '',
    grabacion_url: '',
    tags: 'negociación,salario',
  },
  {
    id: 'demo-2',
    titulo: 'LinkedIn que convierte: de perfil muerto a imán de oportunidades',
    descripcion: 'Qué cambia realmente en un perfil de LinkedIn que atrae recruiters. Revisamos perfiles en vivo y damos feedback directo.',
    fecha: '2026-09-05',
    hora: '18:30',
    speaker: 'Piraí Team',
    speaker_bio: 'El equipo de Piraí con años de experiencia en selección y búsqueda laboral.',
    speaker_linkedin: '',
    google_calendar_url: '',
    link_zoom: '',
    grabacion_url: '',
    tags: 'linkedin,marca personal',
  },
  {
    id: 'demo-3',
    titulo: 'Cómo sobrevivir (y brillar) en una entrevista técnica',
    descripcion: 'Preparación mental, estructura de respuestas y qué buscan realmente los entrevistadores del lado tech.',
    fecha: '2026-09-20',
    hora: '19:00',
    speaker: 'Invitado especial',
    speaker_bio: 'Tech lead con 10+ años de experiencia haciendo entrevistas en empresas top.',
    speaker_linkedin: '',
    google_calendar_url: '',
    link_zoom: '',
    grabacion_url: '',
    tags: 'entrevistas,tech',
  },
];

function formatFecha(fecha: string) {
  if (!fecha) return '';
  const d = new Date(fecha + 'T00:00:00');
  return d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function isPast(fecha: string) {
  return new Date(fecha + 'T23:59:59') < new Date();
}

function webinarTimes(w: Webinar) {
  const start = new Date(`${w.fecha}T${w.hora || '19:00'}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return { start, end };
}

function icsDate(d: Date) {
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function googleCalendarUrl(w: Webinar) {
  const { start, end } = webinarTimes(w);
  const details = w.descripcion + (w.link_zoom ? `\n\nLink de acceso: ${w.link_zoom}` : '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: w.titulo,
    dates: `${icsDate(start)}/${icsDate(end)}`,
    details,
    location: w.link_zoom || '',
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function downloadIcs(w: Webinar) {
  const { start, end } = webinarTimes(w);
  const details = (w.descripcion + (w.link_zoom ? `\\nLink de acceso: ${w.link_zoom}` : '')).replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `UID:${w.id}@pirai.es`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${w.titulo}`,
    `DESCRIPTION:${details}`,
    w.link_zoom ? `LOCATION:${w.link_zoom}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${w.titulo.replace(/\s+/g, '_')}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function WebinarsPage() {
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Webinar | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/webinars')
      .then(r => r.json())
      .then(d => {
        if (d.webinars && d.webinars.length > 0) setWebinars(d.webinars);
        else setWebinars(PLACEHOLDER_WEBINARS);
      })
      .catch(() => setWebinars(PLACEHOLDER_WEBINARS))
      .finally(() => setLoading(false));
  }, []);

  async function handleRegister() {
    if (!nombre.trim() || !email.trim() || !modal) return;
    setSending(true);
    setError('');
    try {
      const r = await fetch('/api/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, webinar_id: modal.id, webinar_titulo: modal.titulo }),
      });
      const d = await r.json();
      if (d.ok) setSuccess(true);
      else setError(d.error || 'Error al registrarse');
    } catch {
      setError('Error de conexión. Intentá de nuevo.');
    } finally {
      setSending(false);
    }
  }

  function openModal(w: Webinar) {
    setModal(w);
    setSuccess(false);
    setError('');
    setNombre('');
    setEmail('');
  }

  const upcoming = webinars.filter(w => !isPast(w.fecha) && !w.grabacion_url);
  const past = webinars.filter(w => isPast(w.fecha) || w.grabacion_url);

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/pirai-nombre.png" alt="Piraí" width={500} height={500} className="h-20 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-[#718096] hover:text-[#2D3748] transition-colors">Inicio</Link>
            <Link href="/login" className="text-sm font-semibold bg-[#00A86B] text-white px-4 py-2 rounded-xl hover:bg-[#009660] transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-[#1A2332] to-[#1e3a2f] text-white py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1BCDD1] mb-3 block">Webinars en vivo</span>
          <h1 className="text-4xl font-extrabold mb-4">Aprendé con quienes<br />ya lo vivieron</h1>
          <p className="text-white/70 max-w-xl text-lg leading-relaxed">
            Eventos online gratuitos sobre búsqueda laboral, LinkedIn, entrevistas, negociación y más.
            En vivo, con preguntas reales y sin filtros.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12 space-y-12">
        {/* PRÓXIMOS */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#718096] mb-6">Próximos webinars</h2>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="bg-white rounded-3xl h-32 animate-pulse" />)}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-[#E2E8F0]">
              <p className="text-[#718096] font-medium">No hay webinars programados por ahora.</p>
              <p className="text-sm text-[#718096] mt-1">Volvé pronto o seguinos en redes para no perderte ninguno.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcoming.map(w => (
                <div key={w.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {w.tags && w.tags.split(',').map(t => (
                          <span key={t} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#00A86B]/10 text-[#00A86B] px-2 py-0.5 rounded-full">
                            <Tag className="w-2.5 h-2.5" />{t.trim()}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-lg font-bold text-[#2D3748] mb-2">{w.titulo}</h3>
                      <p className="text-sm text-[#718096] leading-relaxed mb-3 line-clamp-2">{w.descripcion}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#718096]">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#00A86B]" />
                          <span className="capitalize">{formatFecha(w.fecha)}</span>
                        </span>
                        {w.hora && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#00A86B]" />
                            {w.hora} hs
                          </span>
                        )}
                        {w.speaker && (
                          w.speaker_linkedin ? (
                            <a
                              href={w.speaker_linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="flex items-center gap-1.5 hover:text-[#00A86B] hover:underline"
                            >
                              <User className="w-3.5 h-3.5 text-[#00A86B]" />
                              {w.speaker}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-[#00A86B]" />
                              {w.speaker}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => openModal(w)}
                      className="flex-shrink-0 flex items-center gap-2 bg-[#00A86B] text-white font-semibold px-5 py-3 rounded-2xl hover:bg-[#009660] transition-colors"
                    >
                      Me anoto <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PASADOS / GRABACIONES */}
        {past.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#718096] mb-6">Webinars anteriores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {past.map(w => (
                <div key={w.id} className="bg-white rounded-3xl border border-[#E2E8F0] p-5 opacity-80">
                  <h3 className="font-bold text-[#2D3748] mb-1 text-sm">{w.titulo}</h3>
                  <p className="text-xs text-[#718096] mb-3 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    <span className="capitalize">{formatFecha(w.fecha)}</span>
                  </p>
                  {w.grabacion_url ? (
                    <a href={w.grabacion_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00A86B] hover:underline">
                      <Play className="w-3.5 h-3.5" /> Ver grabación
                    </a>
                  ) : (
                    <span className="text-xs text-[#718096]">Grabación próximamente</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-1">Inscripción</p>
                  <h3 className="font-bold text-[#2D3748] text-lg leading-snug">{modal.titulo}</h3>
                  <p className="text-xs text-[#718096] mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span className="capitalize">{formatFecha(modal.fecha)}</span>
                    {modal.hora && <> · <Clock className="w-3 h-3" /> {modal.hora} hs</>}
                  </p>
                </div>
                <button onClick={() => setModal(null)} className="text-[#718096] hover:text-[#2D3748] flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-[#00A86B] mx-auto mb-3" />
                  <p className="font-bold text-[#2D3748] text-lg mb-1">¡Ya estás anotado/a! 🎉</p>
                  <p className="text-sm text-[#718096]">Te enviamos los detalles a <strong>{email}</strong>. ¡Nos vemos en el webinar!</p>
                  <div className="flex items-center justify-center gap-2 mt-5">
                    <a
                      href={modal.google_calendar_url || googleCalendarUrl(modal)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#F2F4F7] text-[#2D3748] px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <CalendarPlus className="w-3.5 h-3.5" /> Google Calendar
                    </a>
                    <button
                      onClick={() => downloadIcs(modal)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-[#F2F4F7] text-[#2D3748] px-3 py-2 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Outlook / Apple (.ics)
                    </button>
                  </div>
                  <button onClick={() => setModal(null)} className="mt-4 text-sm font-semibold text-[#00A86B] hover:underline">
                    Cerrar
                  </button>
                </div>
              ) : (
                <>
                  {modal.speaker && (
                    <div className="bg-[#F2F4F7] rounded-2xl p-4 mb-5 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#00A86B]/20 flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-[#00A86B]" />
                      </div>
                      <div>
                        {modal.speaker_linkedin ? (
                          <a
                            href={modal.speaker_linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-[#2D3748] hover:text-[#00A86B] hover:underline inline-flex items-center gap-1"
                          >
                            {modal.speaker} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <p className="text-xs font-bold text-[#2D3748]">{modal.speaker}</p>
                        )}
                        {modal.speaker_bio && <p className="text-xs text-[#718096] mt-0.5">{modal.speaker_bio}</p>}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-[#718096] uppercase mb-1 block">Tu nombre</label>
                      <input
                        className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                        placeholder="Ej: Ana García"
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#718096] uppercase mb-1 block">Tu email</label>
                      <input
                        className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                        placeholder="Ej: ana@email.com"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    {error && <p className="text-xs text-red-500">{error}</p>}
                    <button
                      onClick={handleRegister}
                      disabled={sending || !nombre.trim() || !email.trim()}
                      className="w-full flex items-center justify-center gap-2 bg-[#00A86B] text-white font-semibold py-3 rounded-xl hover:bg-[#009660] transition-colors disabled:opacity-50"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : '✓'} Confirmar inscripción
                    </button>
                    <p className="text-center text-xs text-[#718096]">Es gratis · Sin spam · Podés darte de baja cuando quieras</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
