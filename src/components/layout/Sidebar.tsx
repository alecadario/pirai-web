'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clearAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/crm', label: 'CRM', icon: '👥' },
  { href: '/empleos', label: 'Empleos', icon: '💼' },
  { href: '/cv', label: 'CV & Cartas', icon: '📄' },
  { href: '/perfil', label: 'Perfil', icon: '👤' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-[var(--color-brand-border)] flex flex-col">
      <div className="px-6 py-5 border-b border-[var(--color-brand-border)]">
        <span className="text-xl font-bold text-[var(--color-brand-primary)]">Pirai</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[var(--color-brand-accent)] text-[var(--color-brand-primary)]'
                  : 'text-[var(--color-brand-muted)] hover:bg-[var(--color-brand-surface)] hover:text-[var(--color-brand-dark)]'
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--color-brand-border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-brand-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
