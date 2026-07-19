import Link from 'next/link';

export const metadata = {
  title: 'Política de Cookies — Piraí',
  description: 'Información sobre el uso de cookies en Piraí.',
};

export default function CookiesPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#00A86B', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Volver a inicio</Link>
      <h1 style={{ fontSize: 28, marginBottom: 8, marginTop: 24 }}>Política de Cookies</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Última actualización: julio de 2026</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos que se descargan en tu dispositivo al navegar y permiten, entre otras funciones, recordar tus preferencias o mantener tu sesión activa.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Cookies que utiliza Piraí</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 12 }}>
        <thead>
          <tr style={{ background: '#f2f4f7' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Tipo</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Finalidad</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>Consentimiento</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Técnicas / necesarias</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Autenticación, seguridad y mantenimiento de la sesión</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>No requerido</td>
          </tr>
        </tbody>
      </table>
      <p style={{ marginTop: 16, color: '#666', fontSize: 14 }}>Piraí utiliza únicamente cookies técnicas imprescindibles para el funcionamiento del servicio. No se utilizan cookies analíticas, publicitarias ni de terceros.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>Gestión de cookies</h2>
      <p>Podés gestionar o eliminar cookies desde la configuración de tu navegador. Ten en cuenta que deshabilitar las cookies técnicas puede afectar al funcionamiento del servicio (por ejemplo, cerrar tu sesión automáticamente).</p>

      <p style={{ marginTop: 40, color: '#666', fontSize: 13 }}>
        ¿Preguntas? Escribinos a <a href="mailto:hola@pirai.es" style={{ color: '#00A86B' }}>hola@pirai.es</a>
      </p>
    </main>
  );
}
