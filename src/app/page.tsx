'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Target, Zap, BookOpen, Sparkles, Users, BarChart3,
  ChevronRight, Smartphone, Monitor, ArrowRight,
  Briefcase, Building2,
} from 'lucide-react';

const CONTENT = {
  candidato: {
    badge: 'Para quienes buscan trabajo',
    headline: 'Tu copiloto para',
    highlight: 'conseguir trabajo',
    sub: 'Piraí organiza tu búsqueda laboral, te dice qué hacer cada día y te ayuda a construir relaciones reales. Menos caos, más resultados.',
    sectionLabel: '¿Qué es Piraí para vos?',
    sectionTitle: 'Buscar trabajo es un trabajo.',
    sectionHighlight: 'Piraí te lo hace más fácil.',
    sectionDesc: 'La mayoría manda CVs al vacío y espera. Piraí cambia eso: te da un sistema claro, te dice qué hacer cada día y te acompaña hasta que conseguís lo que buscás.',
    features: [
      { icon: Target, color: 'bg-[#00A86B]/10 text-[#00A86B]', title: 'CRM de búsqueda laboral', desc: 'Seguí cada empresa, contacto y postulación en un solo lugar. Nunca más perder el hilo.' },
      { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Acciones diarias inteligentes', desc: 'Piraí analiza tu pipeline y te dice exactamente qué hacer hoy para avanzar.' },
      { icon: Sparkles, color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]', title: 'Marca personal', desc: 'Analizá tu perfil de LinkedIn, generá mensajes personalizados y destacate.' },
      { icon: BookOpen, color: 'bg-purple-100 text-purple-600', title: 'Cursos y recursos', desc: 'Recibís el curso del mes y recursos seleccionados para seguir creciendo.' },
      { icon: Users, color: 'bg-rose-100 text-rose-600', title: 'Networking con propósito', desc: 'Organizá tus contactos, hacé seguimiento y construí relaciones que importan.' },
      { icon: BarChart3, color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]', title: 'Insights de tu búsqueda', desc: 'Métricas claras: tasa de respuesta, actividad semanal, progreso real.' },
    ],
    steps: [
      { num: '01', title: 'Cargás tus empresas objetivo', desc: 'Sumás las empresas que te interesan y tus contactos dentro de cada una.' },
      { num: '02', title: 'Piraí te dice qué hacer', desc: 'Cada día recibís 2-3 acciones priorizadas según tu pipeline real.' },
      { num: '03', title: 'Actuás y registrás', desc: 'Mandás mensajes, vas a entrevistas, hacés seguimiento. Todo queda en el CRM.' },
      { num: '04', title: 'Ves tu progreso crecer', desc: 'Insights semanales, racha de días activos y cursos para seguir mejorando.' },
    ],
  },
  emprendedor: {
    badge: 'Para emprendedores',
    headline: 'Tu copiloto para',
    highlight: 'hacer crecer tu negocio',
    sub: 'Piraí te ayuda a organizar tu pipeline comercial, hacer seguimiento de clientes potenciales y construir relaciones que generan resultados.',
    sectionLabel: '¿Qué es Piraí para vos?',
    sectionTitle: 'Conseguir clientes requiere un sistema.',
    sectionHighlight: 'Piraí te lo da.',
    sectionDesc: 'La mayoría improvisa su prospección y pierde oportunidades. Piraí te da un CRM simple, acciones diarias y métricas claras para que nunca pierdas el hilo con un cliente potencial.',
    features: [
      { icon: Target, color: 'bg-[#00A86B]/10 text-[#00A86B]', title: 'CRM de prospección', desc: 'Seguí cada lead, cliente potencial y oportunidad en un solo lugar.' },
      { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Acciones de follow-up', desc: 'Piraí te recuerda cuándo escribir, cuándo llamar y a quién priorizar hoy.' },
      { icon: Sparkles, color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]', title: 'Mensajes personalizados', desc: 'Generá outreach que no suene a spam. Con contexto real de cada contacto.' },
      { icon: Users, color: 'bg-rose-100 text-rose-600', title: 'Gestión de contactos', desc: 'Construí relaciones duraderas con tus clientes, socios e inversores.' },
      { icon: BookOpen, color: 'bg-purple-100 text-purple-600', title: 'Recursos para founders', desc: 'Cursos y contenido seleccionado para que sigas creciendo como emprendedor.' },
      { icon: BarChart3, color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]', title: 'Métricas de tu pipeline', desc: 'Tasas de conversión, actividad semanal y progreso real de tu prospección.' },
    ],
    steps: [
      { num: '01', title: 'Cargás tus leads y contactos', desc: 'Sumás los clientes potenciales, socios o inversores que querés cultivar.' },
      { num: '02', title: 'Piraí te dice qué hacer', desc: 'Cada día recibís acciones concretas: a quién escribir, con quién hacer follow-up.' },
      { num: '03', title: 'Actuás y registrás', desc: 'Mandás mensajes, hacés llamadas, agendás reuniones. Todo queda en el CRM.' },
      { num: '04', title: 'Convertís más oportunidades', desc: 'Métricas claras, racha de días activos y aprendizaje continuo.' },
    ],
  },
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [perfil, setPerfil] = useState<'candidato' | 'emprendedor'>('candidato');
  const c = CONTENT[perfil];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/pirai-nombre.png" alt="Piraí" width={500} height={500} className="h-20 w-auto object-contain" />
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
          {/* SELECTOR DE PERFIL */}
          <div className="inline-flex bg-white/10 border border-white/20 rounded-2xl p-1 mb-8">
            <button
              onClick={() => setPerfil('candidato')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                perfil === 'candidato'
                  ? 'bg-white text-[#2D3748] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" /> Busco trabajo
            </button>
            <button
              onClick={() => setPerfil('emprendedor')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                perfil === 'emprendedor'
                  ? 'bg-white text-[#2D3748] shadow-md'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" /> Soy emprendedor
            </button>
          </div>

          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6 ml-3">
            <span className="w-2 h-2 rounded-full bg-[#1BCDD1] animate-pulse" />
            En lanzamiento — unite a los primeros usuarios
          </div>

          <div className="flex justify-center mb-6">
            <Image src="/LOGO.BLANCO. SIN FONDO.png" alt="Piraí" width={100} height={100} className="h-20 w-auto object-contain" />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            {c.headline}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1BCDD1] to-[#4DCB9D]">
              {c.highlight}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            {c.sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/es/app/pira%C3%AD/id6761818966?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-[#2D3748] font-semibold px-6 py-3.5 rounded-2xl hover:bg-gray-50 transition-all shadow-lg"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              <span>Descargar en App Store</span>
            </a>

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

          <p className="mt-5 text-sm text-white/40">Gratis para empezar · Sin tarjeta de crédito · +100 usuarios en beta</p>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-[#F2F4F7] py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-10">Lo que dicen nuestros usuarios</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: 'Está buenísima. Me gusta que te acompañe en todo el camino, con tips, con cosas. No es solo una herramienta. Está muy, muy buena.', name: 'Eduardo', role: 'Empresario' },
              { quote: 'Me encantó. Supera al excel que yo tenía para hacer seguimiento a los trabajos que me postulaba.', name: 'Karla', role: 'HR Recruiter' },
              { quote: 'Antes no sabía cómo escribirle a los reclutadores para dar seguimiento a mis postulaciones. Ahora la app me ayuda.', name: 'Bernardo', role: 'Revenue Operations' },
            ].map(({ quote, name, role }) => (
              <div key={name} className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm flex flex-col gap-4">
                <p className="text-[#2D3748] text-sm leading-relaxed flex-1">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#00A86B]/10 flex items-center justify-center text-[#00A86B] font-bold text-sm flex-shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3748] text-sm">{name}</p>
                    <p className="text-xs text-[#718096]">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-[#718096] mt-10">Más de <span className="font-bold text-[#2D3748]">100 personas</span> ya organizaron su búsqueda con Piraí · <span className="text-[#00A86B] font-semibold">Gratis para empezar</span></p>
        </div>
      </section>

      {/* QUÉ ES */}
      <section id="que-es" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-3 block">{c.sectionLabel}</span>
            <h2 className="text-4xl font-extrabold text-[#2D3748] mb-4">
              {c.sectionTitle}<br />
              <span className="text-[#00A86B]">{c.sectionHighlight}</span>
            </h2>
            <p className="text-lg text-[#718096] max-w-2xl mx-auto">{c.sectionDesc}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {c.features.map(({ icon: Icon, color, title, desc }) => (
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

      {/* SCREENSHOTS */}
      <section className="py-20 px-5 bg-[#F8FAFB]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-3 block">La app por dentro</span>
            <h2 className="text-3xl font-extrabold text-[#2D3748]">Todo lo que necesitás, en un solo lugar</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { src: '/screen-tudia.png', label: 'Tu día' },
              { src: '/screen-prospectos.png', label: 'Prospectos' },
              { src: '/screen-empleos.png', label: 'Empleos' },
              { src: '/screen-marca.png', label: 'Marca Personal' },
              { src: '/screen-eventos.png', label: 'Eventos' },
              { src: '/screen-cv.png', label: 'CV' },
              { src: '/screen-insights.png', label: 'Insights' },
            ].map(({ src, label }) => (
              <div key={src} className="flex flex-col items-center gap-2">
                <div className="rounded-2xl overflow-hidden shadow-md border border-[#E2E8F0] w-full">
                  <Image src={src} alt={label} width={300} height={600} className="w-full h-auto object-cover" />
                </div>
                <span className="text-xs font-semibold text-[#718096]">{label}</span>
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
            {c.steps.map(({ num, title, desc }) => (
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
            Unite a más de 100 personas que ya organizaron su búsqueda con Piraí.
            Es gratis, rápido y cambia todo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white text-[#00A86B] font-bold px-7 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors shadow-lg"
            >
              <Monitor className="w-5 h-5" /> Empezar en desktop
            </Link>
            <a
              href="https://apps.apple.com/es/app/pira%C3%AD/id6761818966?l=en-GB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/40 text-white font-semibold px-7 py-3.5 rounded-2xl hover:bg-white/10 transition-colors"
            >
              <Smartphone className="w-5 h-5" /> Descargar en App Store
            </a>
          </div>
        </div>
      </section>

      {/* EMPRESAS CTA */}
      <section className="py-20 px-5 bg-[#F2F4F7]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00A86B] mb-3 block">Para empresas</span>
            <h2 className="text-3xl font-extrabold text-[#2D3748] mb-4">
              ¿Buscás talento?<br />
              <span className="text-[#00A86B]">Publicá tus búsquedas en Piraí.</span>
            </h2>
            <p className="text-[#718096] mb-6 leading-relaxed">
              Miles de candidatos activos usan Piraí para organizar su búsqueda laboral.
              Publicá tus posiciones y llegá a personas que están buscando trabajo con propósito.
            </p>
            <a
              href="https://piraiapp.com/empleadores"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#2D3748] text-white font-semibold px-5 py-3 rounded-xl hover:bg-[#1A2332] transition-colors"
            >
              <Building2 className="w-4 h-4" />
              Publicar una búsqueda <ChevronRight className="w-4 h-4" />
            </a>
          </div>
          <div className="w-full md:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm space-y-4">
              {[
                { icon: Users, color: 'bg-[#00A86B]/10 text-[#00A86B]', title: 'Candidatos activos', desc: 'Personas que buscan trabajo hoy, no hace 6 meses.' },
                { icon: Target, color: 'bg-[#1BCDD1]/10 text-[#1BCDD1]', title: 'Perfiles verificados', desc: 'Con CV, LinkedIn y historial de actividad.' },
                { icon: Zap, color: 'bg-amber-100 text-amber-600', title: 'Publicación simple', desc: 'En minutos, sin burocracia.' },
              ].map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#2D3748] text-sm">{title}</p>
                    <p className="text-xs text-[#718096]">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A2332] text-white/50 py-10 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Image src="/pirai-nombre.png" alt="Piraí" width={80} height={80} className="h-5 w-auto object-contain brightness-0 invert opacity-70" />
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
