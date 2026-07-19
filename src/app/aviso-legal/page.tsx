import Link from 'next/link';

export const metadata = {
  title: 'Aviso Legal — Piraí',
  description: 'Información legal del titular del sitio web Piraí.',
};

export default function AvisoLegalPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#00A86B', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Volver a inicio</Link>
      <h1 style={{ fontSize: 28, marginBottom: 8, marginTop: 24 }}>Aviso Legal</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Última actualización: julio de 2026</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>1.1. Información general (Art. 10 LSSI-CE)</h2>
      <p>En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la Información (LSSI-CE), se informa:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Titular:</strong> Samurai Venture SL</li>
        <li><strong>CIF:</strong> B95986014</li>
        <li><strong>Domicilio social:</strong> Urbanización Lubarrietaondo, 48 – BJ, 48110 Gatika (Vizcaya), España.</li>
        <li><strong>Correo electrónico:</strong> <a href="mailto:hola@pirai.es" style={{ color: '#00A86B' }}>hola@pirai.es</a></li>
        <li><strong>Sitio web:</strong> https://pirai.es</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>1.2. Objeto</h2>
      <p>El presente Aviso Legal regula el acceso, navegación y uso del sitio web <code>pirai.es</code> y de la aplicación Piraí. El acceso y uso de la Plataforma implica la aceptación plena de este Aviso Legal.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>1.3. Propiedad intelectual e industrial</h2>
      <p>Todos los derechos de propiedad intelectual e industrial de la Plataforma y de sus contenidos son titularidad de Samurai Venture SL o de terceros que han autorizado su uso. Queda prohibida la reproducción, distribución o comunicación pública sin autorización expresa y por escrito del Titular.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>1.4. Exclusión de responsabilidad</h2>
      <p>El Titular no garantiza la disponibilidad, continuidad ni infalibilidad del funcionamiento de la Plataforma. Piraí es una herramienta de organización y apoyo a la búsqueda de empleo. <strong>No garantiza la obtención de empleo, entrevistas ni resultado profesional alguno</strong>, ni asume responsabilidad por las decisiones que el usuario adopte sobre la base de la información o contenidos generados por la Plataforma (incluidos los generados mediante inteligencia artificial).</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>1.5. Legislación aplicable y jurisdicción</h2>
      <p>El presente Aviso Legal se rige por la legislación española. Para la resolución de cualquier controversia, las partes se someten a los Juzgados y Tribunales del domicilio del Titular, salvo que la normativa de consumo aplicable disponga otro fuero imperativo.</p>
    </main>
  );
}
