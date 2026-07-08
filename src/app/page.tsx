'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Target, Zap, BookOpen, Sparkles, Users, BarChart3,
  ChevronRight, Smartphone, Monitor, ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Target,
    color: 'bg-[#00A86B]/10 text-[#00A86B]',
    title: 'CRM de búsqueda laboral',
    desc: 'Seguí cada empresa, contacto y postulación en un solo lugar. Nunca más perder el hilo.',
  },
  {
    icon: Zap,
    color: 'bg-amber-100 text-amber-600',
    title: 'Acciones diarias inteligentes',
    desc: 'Piraí analiza tu pipeline y te dice exactamente qué hacer hoy para avanzar.',
  },
  {
    icon: Sparkles,
    color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]',
    title: 'Marca personal',
    desc: 'Analizá tu perfil de LinkedIn, generá mensajes personalizados y destacate.',
  },
  {
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600',
    title: 'Cursos y recursos',
    desc: 'Recibís el curso del mes y recursos seleccionados para seguir creciendo.',
  },
  {
    icon: Users,
    color: 'bg-rose-100 text-rose-600',
    title: 'Networking con propósito',
    desc: 'Organizá tus contactos, hacé seguimiento y construí relaciones que importan.',
  },
  {
    icon: BarChart3,
    color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]',
    title: 'Insights de tu búsqueda',
    desc: 'Métricas claras: tasa de respuesta, actividad semanal, progreso real.',
  },
];

const STEPS = [
  { num: '01', title: 'Cargás tus empresas objetivo', desc: 'Sumás las empresas que te interesan y tus contactos dentro de cada una.' },
  { num: '02', title: 'Piraí te dice qué hacer', desc: 'Cada día recibís 2-3 acciones priorizadas según tu pipeline real.' },
  { num: '03', title: 'Actuás y registrás', desc: 'Mandás mensajes, vas a entrevistas, hacés seguimiento. Todo queda en el CRM.' },
  { num: '04', title: 'Ves tu progreso crecer', desc: 'Insights semanales, racha de días activos y cursos para seguir mejorando.' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/pirai-icon.png" alt="Piraí" width={32} height={32} className="rounded-xl" />
            <span className="font-bold text-xl text-[#2D3748]">Piraí</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-[#718096]">
            <a href="#que-es" className="hover:text-[#2D3748] transition-colors">¿Qué es?</a>
            <a href="#como-funciona" className="hover:text-[#2D3748] transition-colors">Cómo funciona</a>
            <Link href="/webinars" className="hover:text-[#2D3748] transition-colors">Webinars</Link>
          </div>
          <Link
            href="/login"
            className="hidden md:inline-flex items-center gap-1.5 bg-[#00A86B] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#009660] transition-colors"
          >
            Entrar <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button className="md:hidden text-[#718096]" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="w-5 space-y-1.5">
              <span className="block h-0.5 bg-current rounded" />
              <span className="block h-0.5 bg-current rounded" />
              <span className="block h-0.5 bg-current rounded" />
            </div>
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden px-5 pb-4 flex flex-col gap-3 text-sm font-medium border-t border-gray-100 pt-4">
            <a href="#que-es" onClick={() => setMenuOpen(false)} className="text-[#718096]">¿Qué es?</a>
            <a href="#como-funciona" onClick={() => setMenuOpen(false)} className="text-[#718096]">Cómo funciona</a>
            <Link href="/webinars" onClick={() => setMenuOpen(false)} className="text-[#718096]">Webinars</Link>
            <Link href="/login" className="text-[#00A86B] font-semibold">Entrar →</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1A2332] via-[#1e3a2f] to-[#004d30] text-white py-24 px-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1BCDD1]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00A86B]/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <Image src="/pirai-logo-white.svg" alt="Piraí" width={72} height={72} />
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#1BCDD1] animate-pulse" />
            En lanzamiento — unite a los primeros usuarios
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Tu copiloto para<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1BCDD1] to-[#4DCB9D]">
              conseguir trabajo
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Piraí organiza tu búsqueda laboral, te dice qué hacer cada día y te ayuda a construir
            relaciones reales. Menos caos, más resultados.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#2D3748] font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition-all shadow-lg cursor-not-allowed">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span>iOS <span className="text-xs text-gray-400 font-normal ml-1">próximamente</span></span>
            </button>

            <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#2D3748] font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition-all shadow-lg cursor-not-allowed">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.17.64.2.96.09l12.45-7.19-2.78-2.79-10.63 9.89zM.29 1.33C.11 1.64 0 2.01 0 2.44v19.12c0 .43.11.8.29 1.11l.06.06 10.71-10.71v-.25L.35 1.27l-.06.06zM20.67 10.3l-2.83-1.63-3.13 3.12 3.13 3.12 2.85-1.64c.81-.47.81-1.23-.02-1.97zM3.18.24L15.63 7.43l-2.78 2.79L2.22.33c.32-.11.66-.08.96.09v-.18z"/></svg>
              <span>Android <span className="text-xs text-gray-400 font-normal ml-1">próximamente</span></span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#00A86B] text-white font-semibold px-6 py-3.5 rounded-2xl hover:bg-[#009660] transition-all shadow-lg"
            >
              <Monitor className="w-5 h-5" />
              Usar en desktop
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="mt-5 text-sm text-white/40">Gratis para empezar · Sin tarjeta de crédito</p>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[#F2F4F7] py-12 px-5">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-10 text-center">
          {[
            { num: '500+', label: 'usuarios en beta' },
            { num: '12k+', label: 'actividades registradas' },
            { num: '3x', label: 'más entrevistas' },
            { num: '0€', label: 'para empezar' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-[#00A86B]">{num}</p>
              <p className="text-sm text-[#718096] mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUÉ ES */}
      <section id="que-es" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-3 block">¿Qué es Piraí?</span>
            <h2 className="text-4xl font-extrabold text-[#2D3748] mb-4">
              Buscar trabajo es un trabajo.<br />
              <span className="text-[#00A86B]">Piraí te lo hace más fácil.</span>
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">
              La mayoría manda CVs al vacío y espera. Piraí cambia eso: te da un sistema claro,
              te dice qué hacer cada día y te acompaña hasta que conseguís lo que buscás.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl p-6 border border-[#E2E8F0] hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#2D3748] mb-2">{title}</h3>
                <p className="text-sm text-[#718096] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="como-funciona" className="py-24 px-5 bg-[#1A2332]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1BCDD1] mb-3 block">Cómo funciona</span>
            <h2 className="text-4xl font-extrabold text-white mb-4">Simple. Directo. Efectivo.</h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto">Sin complicaciones. En 4 pasos empezás a moverte con foco.</p>
          </div>

          <div className="space-y-4">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex items-start gap-5 bg-white/5 border border-white/10 rounded-3xl p-6 hover:bg-white/8 transition-colors">
                <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00A86B] to-[#1BCDD1] flex items-center justify-center">
                  <span className="text-white font-extrabold text-sm">{num}</span>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WEBINARS TEASER */}
      <section className="py-20 px-5 bg-gradient-to-br from-[#E6F7F1] to-[#E7FAFB]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1BCDD1] mb-3 block">Webinars en vivo</span>
            <h2 className="text-3xl font-extrabold text-[#2D3748] mb-4">
              Aprendé con expertos<br />que ya lo vivieron
            </h2>
            <p className="text-[#718096] mb-6 leading-relaxed">
              Cada mes organizamos webinars gratuitos sobre búsqueda laboral, negociación, LinkedIn,
              entrevistas y más. En vivo, con preguntas y sin filtros.
            </p>
            <Link
              href="/webinars"
              className="inline-flex items-center gap-2 bg-[#00A86B] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#009660] transition-colors"
            >
              Ver próximos webinars <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-[#00A86B]/10 flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-[#00A86B]" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-1">Próximo webinar</p>
              <p className="font-bold text-[#2D3748] mb-1">Cómo negociar tu salario</p>
              <p className="text-xs text-[#718096]">Agosto 2026 · Online · Gratis</p>
              <Link href="/webinars" className="mt-4 block text-center text-xs font-semibold bg-[#00A86B]/10 text-[#00A86B] py-2 rounded-xl hover:bg-[#00A86B]/20 transition-colors">
                Me anoto →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-5 bg-gradient-to-br from-[#00A86B] to-[#1BCDD1] text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">¿Empezamos?</h2>
          <p className="text-lg text-white/80 mb-8">
            Unite a cientos de personas que ya organizaron su búsqueda con Piraí.
            Es gratis, rápido y cambia todo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white text-[#00A86B] font-bold px-7 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Monitor className="w-5 h-5" /> Empezar en desktop
            </Link>
            <button className="flex items-center gap-2 border border-white/40 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-colors cursor-not-allowed">
              <Smartphone className="w-5 h-5" /> App próximamente
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A2332] text-white/50 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Image src="/pirai-logo-white.svg" alt="Piraí" width={24} height={24} className="opacity-80" />
            <span className="font-semibold text-white/70">Piraí</span>
          </div>
          <p>© 2026 Piraí · Hecho con 💚 para quienes buscan trabajo con propósito</p>
          <div className="flex items-center gap-5">
            <Link href="/webinars" className="hover:text-white transition-colors">Webinars</Link>
            <Link href="/login" className="hover:text-white transition-colors">Acceder</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
