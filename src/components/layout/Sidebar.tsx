'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getUserName, getUserEmail } from '@/lib/auth';
import {
  LayoutDashboard, Users, Briefcase, Sparkles, BarChart3,
  User, LogOut, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  { href: '/dashboard', label: 'Tu Día', icon: LayoutDashboard },
  { href: '/crm', label: 'CRM', icon: Users },
  { href: '/empleos', label: 'Empleos', icon: Briefcase },
  { href: '/marca', label: 'Marca Personal', icon: Sparkles },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    setName(getUserName() ?? '');
    setEmail(getUserEmail() ?? '');
  }, []);

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <aside className="w-56 min-h-screen bg-[#1A2332] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-pirai-500)] flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-white font-bold text-lg">Piraí</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-[var(--color-pirai-500)] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Profile + logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3 space-y-1">
        <Link
          href="/perfil"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === '/perfil'
              ? 'bg-[var(--color-pirai-500)] text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          Perfil
        </Link>

        <div className="px-3 py-2 mt-1">
          <p className="text-white/80 text-xs font-medium truncate">{name || 'Usuario'}</p>
          <p className="text-white/40 text-xs truncate">{email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
