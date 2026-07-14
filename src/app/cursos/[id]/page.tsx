'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Circle, Loader2, Award, ChevronLeft, AlertTriangle } from 'lucide-react';
import { getYouTubeId, loadYouTubeAPI, type YTPlayer } from '@/lib/youtube';
import { generateCertificadoPDF, makeCertificadoCodigo } from '@/lib/pdf';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  portada_url: string;
}

interface Leccion {
  id: string;
  titulo: string;
  video_url: string;
  descripcion: string;
  orden: number;
}

export default function CursoDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [curso, setCurso] = useState<Curso | null>(null);
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loadingCurso, setLoadingCurso] = useState(true);

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [formNombre, setFormNombre] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  const [completadas, setCompletadas] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);

  const playerRef = useRef<YTPlayer | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const emailRef = useRef('');
  const cursoIdRef = useRef('');

  // Load course + lessons
  useEffect(() => {
    if (!id) return;
    cursoIdRef.current = id;
    Promise.all([
      fetch(`/api/cursos?id=${id}`).then(r => r.json()),
      fetch(`/api/lecciones?curso_id=${id}`).then(r => r.json()),
    ]).then(([cursoData, leccionesData]) => {
      setCurso(cursoData.curso || null);
      const l = leccionesData.lecciones || [];
      setLecciones(l);
      if (l.length > 0) setSelectedId(l[0].id);
    }).finally(() => setLoadingCurso(false));
  }, [id]);

  // Enroll (or confirm existing enrollment) + load progress — called once with a confirmed identity
  async function enrollAndLoad(confirmedNombre: string, confirmedEmail: string, cursoId: string) {
    emailRef.current = confirmedEmail;
    setNombre(confirmedNombre);
    setEmail(confirmedEmail);
    localStorage.setItem('pirai_cursos_nombre', confirmedNombre);
    localStorage.setItem('pirai_cursos_email', confirmedEmail);

    const insc = await fetch(`/api/inscripciones?email=${encodeURIComponent(confirmedEmail)}&curso_id=${cursoId}`).then(r => r.json());
    if (!insc.inscripto) {
      await fetch('/api/inscripciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: confirmedNombre, email: confirmedEmail, curso_id: cursoId }),
      });
    }
    const prog = await fetch(`/api/progreso?email=${encodeURIComponent(confirmedEmail)}&curso_id=${cursoId}`).then(r => r.json());
    setCompletadas(new Set<string>(prog.leccionesVistas || []));
    setEnrolled(true);
  }

  // Figure out who's watching
  useEffect(() => {
    if (!id) return;
    const storedEmail = localStorage.getItem('pirai_cursos_email');
    const storedNombre = localStorage.getItem('pirai_cursos_nombre');
    if (storedEmail && storedNombre) {
      enrollAndLoad(storedNombre, storedEmail, id);
    } else {
      setShowEnrollForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    selectedIdRef.current = selectedId;
  }, [selectedId]);

  async function marcarCompletada(leccionId: string) {
    if (!leccionId || completadas.has(leccionId)) return;
    setCompletadas(prev => new Set(prev).add(leccionId));
    try {
      await fetch('/api/progreso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailRef.current, curso_id: cursoIdRef.current, leccion_id: leccionId }),
      });
    } catch { /* progreso ya quedó marcado localmente */ }
  }

  // YouTube player: create once, swap video on selection change
  useEffect(() => {
    if (!enrolled || !selectedId) return;
    const leccion = lecciones.find(l => l.id === selectedId);
    const videoId = leccion ? getYouTubeId(leccion.video_url) : null;
    setVideoError(!videoId);
    if (!videoId) return;

    loadYouTubeAPI().then(() => {
      if (!window.YT) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(videoId);
        return;
      }
      playerRef.current = new window.YT.Player('yt-curso-player', {
        videoId,
        playerVars: { rel: 0 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (window.YT && e.data === window.YT.PlayerState.ENDED && selectedIdRef.current) {
              marcarCompletada(selectedIdRef.current);
            }
          },
          onError: () => setVideoError(true),
        },
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrolled, selectedId, lecciones]);

  useEffect(() => {
    return () => { playerRef.current?.destroy(); };
  }, []);

  async function handleEnroll() {
    if (!formNombre.trim() || !formEmail.trim() || !id) return;
    setEnrolling(true);
    await enrollAndLoad(formNombre.trim(), formEmail.trim(), id);
    setShowEnrollForm(false);
    setEnrolling(false);
  }

  function handleDescargarCertificado() {
    if (!curso) return;
    const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    generateCertificadoPDF({
      nombre,
      cursoTitulo: curso.titulo,
      fecha,
      codigo: makeCertificadoCodigo(email, curso.id),
    });
  }

  const todasCompletadas = lecciones.length > 0 && lecciones.every(l => completadas.has(l.id));
  const selectedLeccion = lecciones.find(l => l.id === selectedId) || null;

  if (loadingCurso) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#00A86B] animate-spin" />
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-[#2D3748] font-semibold">No encontramos este curso.</p>
        <Link href="/cursos" className="text-sm font-semibold text-[#00A86B] hover:underline">Volver a cursos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/pirai-nombre.png" alt="Piraí" width={500} height={500} className="h-20 w-auto object-contain" />
          </Link>
          <Link href="/cursos" className="flex items-center gap-1.5 text-sm text-[#718096] hover:text-[#2D3748] transition-colors">
            <ChevronLeft className="w-4 h-4" /> Todos los cursos
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-5 py-8">
        <h1 className="text-2xl font-extrabold text-[#2D3748] mb-1">{curso.titulo}</h1>
        <p className="text-[#718096] mb-6">{curso.descripcion}</p>

        {!enrolled ? (
          <div className="bg-white rounded-3xl border border-[#E2E8F0] p-10 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-[#00A86B] animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Player */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black relative">
                <div id="yt-curso-player" className="w-full h-full" />
                {videoError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6 bg-black/90">
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                    <p className="text-white text-sm font-medium">No pudimos cargar este video.</p>
                    <p className="text-white/60 text-xs">Revisá que el link de YouTube sea válido y permita insertarse (embed) en otros sitios.</p>
                  </div>
                )}
              </div>
              {selectedLeccion && (
                <div className="mt-4">
                  <h2 className="font-bold text-[#2D3748]">{selectedLeccion.titulo}</h2>
                  {selectedLeccion.descripcion && (
                    <p className="text-sm text-[#718096] mt-1 leading-relaxed">{selectedLeccion.descripcion}</p>
                  )}
                </div>
              )}

              {todasCompletadas && (
                <div className="mt-6 bg-[#00A86B]/10 border border-[#00A86B]/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-[#00A86B] flex-shrink-0" />
                    <div>
                      <p className="font-bold text-[#2D3748]">¡Completaste el curso!</p>
                      <p className="text-sm text-[#718096]">Ya podés descargar tu certificado.</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDescargarCertificado}
                    className="flex-shrink-0 bg-[#00A86B] text-white font-semibold px-5 py-3 rounded-2xl hover:bg-[#009660] transition-colors"
                  >
                    Descargar certificado
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: lessons */}
            <div className="bg-white rounded-3xl border border-[#E2E8F0] p-5 h-fit">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#718096]">Lecciones</h3>
                <span className="text-xs font-semibold text-[#00A86B]">
                  {completadas.size}/{lecciones.length}
                </span>
              </div>
              <div className="space-y-1">
                {lecciones.map((l, i) => {
                  const done = completadas.has(l.id);
                  const active = l.id === selectedId;
                  return (
                    <button
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      className={`w-full flex items-center gap-3 text-left px-3 py-3 rounded-2xl transition-colors ${
                        active ? 'bg-[#00A86B]/10' : 'hover:bg-gray-50'
                      }`}
                    >
                      {done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00A86B] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#CBD5E0] flex-shrink-0" />
                      )}
                      <span className={`text-sm ${active ? 'font-semibold text-[#2D3748]' : 'text-[#4A5568]'}`}>
                        {i + 1}. {l.titulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enroll modal */}
      {showEnrollForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-1">Anotate al curso</p>
            <h3 className="font-bold text-[#2D3748] text-lg leading-snug mb-5">{curso.titulo}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#718096] uppercase mb-1 block">Tu nombre</label>
                <input
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  placeholder="Ej: Ana García"
                  value={formNombre}
                  onChange={e => setFormNombre(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#718096] uppercase mb-1 block">Tu email</label>
                <input
                  className="w-full border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#00A86B]"
                  placeholder="Ej: ana@email.com"
                  type="email"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                />
              </div>
              <button
                onClick={handleEnroll}
                disabled={enrolling || !formNombre.trim() || !formEmail.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#00A86B] text-white font-semibold py-3 rounded-xl hover:bg-[#009660] transition-colors disabled:opacity-50"
              >
                {enrolling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Empezar curso'}
              </button>
              <p className="text-center text-xs text-[#718096]">Usamos tu email para guardar tu progreso y avisarte de tu certificado.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
