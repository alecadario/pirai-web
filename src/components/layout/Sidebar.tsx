'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAuth, getUserName, getUserEmail } from '@/lib/auth';
import {
  LayoutDashboard, Users, Briefcase, Sparkles, BarChart3,
  User, LogOut, ChevronRight, Zap,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchQuota, PLAN_META } from '@/lib/quota';
import { getUserId } from '@/lib/auth';

function PiraiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pirai-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2ECC71" />
          <stop offset="60%" stopColor="#00A86B" />
          <stop offset="100%" stopColor="#00BCD4" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill="url(#pirai-g)" />
      <path d="M24 18 L24 82 Q24 86 28 86 L36 86 Q40 86 40 82 L40 64 L56 64 Q76 64 82 50 Q88 36 76 26 Q68 18 52 18 Z M40 30 L52 30 Q64 30 68 40 Q72 50 62 56 Q56 60 48 60 L40 60 Z" fill="white" />
      <path d="M50 18 C46 28 56 36 52 46 C48 56 38 58 36 68 C34 76 42 80 40 88" stroke="#1A2332" strokeWidth="5.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

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
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    setName(getUserName() ?? '');
    setEmail(getUserEmail() ?? '');
    const uid = getUserId();
    if (uid) fetchQuota(uid).then(q => q && setPlan(q.plan));
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
          <PiraiIcon className="w-8 h-8 shrink-0" />
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
        {/* Plan badge */}
        <Link
          href="/plan"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            pathname === '/plan'
              ? 'bg-[var(--color-pirai-500)] text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 shrink-0" />
          <span className="flex-1">Mi Plan</span>
          {plan && plan !== 'gratis' && (
            <span className="text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded-full">
              {PLAN_META[plan]?.emoji} {PLAN_META[plan]?.name}
            </span>
          )}
          {plan === 'gratis' && (
            <span className="text-[10px] font-bold bg-amber-500/80 text-white px-1.5 py-0.5 rounded-full">
              Gratis
            </span>
          )}
        </Link>

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
