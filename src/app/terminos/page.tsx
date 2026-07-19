import Link from 'next/link';

export const metadata = {
  title: 'Términos y Condiciones — Piraí',
  description: 'Términos y condiciones de uso y contratación de Piraí.',
};

export default function TerminosPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#00A86B', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Volver a inicio</Link>
      <h1 style={{ fontSize: 28, marginBottom: 8, marginTop: 24 }}>Términos y Condiciones de Uso y Contratación</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Última actualización: julio de 2026</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.1. Objeto y aceptación</h2>
      <p>Los presentes Términos regulan el uso de la Plataforma Piraí y la contratación de sus planes de suscripción, prestados por <strong>Samurai Venture SL</strong> (CIF B95986014). Al registrarte, marcar la casilla de aceptación o utilizar la Plataforma, declarás haber leído y aceptado estos Términos, el Aviso Legal y la Política de Privacidad. Si no los aceptás, no debés usar la Plataforma.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.2. Descripción del servicio</h2>
      <p>Piraí es una herramienta de software (SaaS y aplicación móvil) que ayuda al usuario a <strong>organizar</strong> su búsqueda de empleo y desarrollo profesional mediante un CRM, acciones diarias, análisis y contenidos, incluyendo funcionalidades basadas en inteligencia artificial.</p>
      <p><strong>Piraí es una herramienta de organización y apoyo. NO es una agencia de colocación, ni un servicio de recruiting, ni garantiza la obtención de empleo, entrevistas, respuestas de reclutadores ni resultado profesional alguno.</strong></p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.3. Registro y cuenta</h2>
      <p>El registro se realiza mediante autenticación con Google. El usuario es responsable de la veracidad de los datos aportados y de la custodia y confidencialidad del acceso a su cuenta. El usuario debe ser mayor de edad y tener capacidad legal para contratar.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.4. Planes, precios y contratación</h2>
      <p>Piraí ofrece un plan gratuito y planes de pago (actualmente "Pro" y "Acelerado"), cuyas características y precios vigentes se detallan en la Plataforma. Los precios se muestran en la divisa seleccionable.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.5. Pago, renovación y cancelación</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Pasarela de pago:</strong> los pagos se procesan a través de <strong>Stripe</strong>. Samurai Venture SL no almacena los datos completos de tu tarjeta.</li>
        <li><strong>Renovación automática:</strong> las suscripciones se renuevan automáticamente por periodos mensuales al precio vigente, salvo cancelación previa.</li>
        <li><strong>Cancelación:</strong> podés cancelar en cualquier momento desde tu cuenta o escribiendo a pirai@alecadario.com. La cancelación surte efecto al final del periodo ya abonado.</li>
      </ul>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.6. Derecho de desistimiento (consumidores)</h2>
      <p>Si sos consumidor, disponés de un plazo de <strong>14 días naturales</strong> desde la contratación para desistir sin necesidad de justificación, escribiendo a pirai@alecadario.com. Al contratar un plan de pago solicitás y consentís expresamente que la prestación del servicio comience de inmediato.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.7. Política de reembolso</h2>
      <p>Salvo el derecho de desistimiento legal descrito en 3.6 y las garantías legales de conformidad, <strong>los importes abonados por periodos de suscripción no son reembolsables</strong>, incluidos los casos de cancelación anticipada o de no utilización del servicio durante el periodo contratado.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.8. Uso aceptable</h2>
      <p>El usuario se obliga a no: (i) usar la Plataforma con fines ilícitos; (ii) introducir datos falsos o de terceros sin legitimación; (iii) intentar acceder, dañar o interferir en los sistemas; (iv) realizar ingeniería inversa, copiar o revender el servicio; (v) utilizar la Plataforma o los contenidos generados por IA para fines abusivos o fraudulentos.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.9. Contenidos generados por inteligencia artificial</h2>
      <p>Las sugerencias, mensajes, análisis y textos generados por IA se ofrecen "tal cual", con carácter meramente orientativo, y <strong>pueden contener errores o imprecisiones</strong>. Es responsabilidad exclusiva del usuario revisar, validar y decidir sobre su uso.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.10. Limitación de responsabilidad</h2>
      <p>En la máxima medida permitida por la ley, la responsabilidad total de Samurai Venture SL frente al usuario quedará limitada al <strong>importe efectivamente abonado en los tres (3) meses anteriores</strong> al hecho que motive la reclamación. El Titular no responderá de daños indirectos, lucro cesante, pérdida de oportunidades profesionales, de datos o de ingresos.</p>

      <h2 style={{ fontSize: 18, marginTop: 32 }}>3.11. Legislación aplicable</h2>
      <p>Estos Términos se rigen por la legislación española. Para consumidores, será competente el fuero que la normativa de consumo determine. Para no consumidores, las partes se someten a los Juzgados y Tribunales del domicilio del Titular.</p>
      <p>Conforme al Reglamento (UE) 524/2013, los consumidores pueden acceder a la plataforma de resolución de litigios en línea de la Comisión Europea: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#00A86B' }}>https://ec.europa.eu/consumers/odr</a></p>

      <p style={{ marginTop: 40, color: '#666', fontSize: 13 }}>
        Titular: Samurai Venture SL · CIF B95986014 · Urb. Lubarrietaondo 48-BJ, 48110 Gatika (Vizcaya) · <a href="mailto:pirai@alecadario.com" style={{ color: '#00A86B' }}>pirai@alecadario.com</a>
      </p>
    </main>
  );
}
