import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F2F4F7', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🐦</div>
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#2D3748', marginBottom: '8px' }}>Página no encontrada</h1>
      <p style={{ color: '#718096', marginBottom: '32px', maxWidth: '400px', lineHeight: '1.6' }}>
        Esta página no existe o fue movida. Pero tu búsqueda laboral puede seguir.
      </p>
      <Link
        href="/"
        style={{ background: '#00A86B', color: '#fff', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}
      >
        Volver al inicio
      </Link>
    </div>
  );
}
