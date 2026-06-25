'use client';

import AppShell from '@/components/layout/AppShell';

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="p-8 max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--color-brand-dark)] mb-1">Tu Día</h1>
        <p className="text-[var(--color-brand-muted)] text-sm mb-8">Resumen de tu actividad con Pirai</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Postulaciones activas', value: '—' },
            { label: 'Contactos CRM', value: '—' },
            { label: 'CVs generados', value: '—' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5"
            >
              <p className="text-2xl font-bold text-[var(--color-brand-primary)]">{value}</p>
              <p className="text-sm text-[var(--color-brand-muted)] mt-1">{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[var(--color-brand-border)] p-5">
          <h2 className="font-semibold text-[var(--color-brand-dark)] mb-3">Actividad reciente</h2>
          <p className="text-sm text-[var(--color-brand-muted)]">Nada por ahora. ¡Empezá a usar Pirai!</p>
        </div>
      </div>
    </AppShell>
  );
}
