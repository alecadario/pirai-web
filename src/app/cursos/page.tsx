'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, GraduationCap } from 'lucide-react';
import { slugify } from '@/lib/slug';

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  portada_url: string;
}

export default function CursosPage() {
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cursos')
      .then(r => r.json())
      .then(d => setCursos(d.cursos || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F2F4F7] font-sans">
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

      <div className="bg-gradient-to-br from-[#1A2332] to-[#1e3a2f] text-white py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1BCDD1] mb-3 block">Cursos</span>
          <h1 className="text-4xl font-extrabold mb-4">Aprendé a tu ritmo<br />y sacá tu certificado</h1>
          <p className="text-white/70 max-w-xl text-lg leading-relaxed">
            Clases en video, sin vueltas. Mirá cada lección hasta el final y descargá tu certificado al terminar.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map(i => <div key={i} className="bg-white rounded-3xl h-40 animate-pulse" />)}
          </div>
        ) : cursos.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E2E8F0]">
            <GraduationCap className="w-8 h-8 text-[#00A86B] mx-auto mb-3" />
            <p className="text-[#718096] font-medium">Todavía no hay cursos publicados.</p>
            <p className="text-sm text-[#718096] mt-1">Volvé pronto, estamos preparando el primero.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {cursos.map(c => (
              <Link
                key={c.id}
                href={`/cursos/${slugify(c.titulo)}`}
                className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {c.portada_url ? (
                  <div className="h-40 w-full relative bg-[#1A2332]">
                    <Image src={c.portada_url} alt={c.titulo} fill className="object-cover" unoptimized />
                  </div>
                ) : (
                  <div className="h-40 w-full bg-gradient-to-br from-[#1A2332] to-[#1e3a2f] flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-[#1BCDD1]" />
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-[#2D3748] mb-2">{c.titulo}</h3>
                  <p className="text-sm text-[#718096] leading-relaxed mb-4 line-clamp-3 flex-1">{c.descripcion}</p>
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#00A86B]">
                    Empezar curso <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
