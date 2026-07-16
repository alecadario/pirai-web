export const metadata = {
  title: 'Política de Privacidad — Piraí',
  description: 'Cómo Piraí recopila, usa y protege tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Política de Privacidad</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Última actualización: 8 de abril de 2026</p>

      <p>
        Piraí (&quot;nosotros&quot;, &quot;la app&quot;) es una aplicación de productividad profesional
        desarrollada por Alejandra Cadario. Esta política describe cómo recopilamos, usamos
        y protegemos tu información cuando utilizás nuestra aplicación web y móvil.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>1. Información que recopilamos</h2>
      <p>
        <strong>Datos de cuenta:</strong> Al registrarte, recopilamos tu nombre, dirección de
        correo electrónico y foto de perfil a través de nuestro proveedor de autenticación (Clerk).
      </p>
      <p>
        <strong>Datos de uso:</strong> Información sobre las empresas, contactos y actividades
        que registrás en la plataforma como parte de tu pipeline profesional.
      </p>
      <p>
        <strong>Datos de diagnóstico:</strong> Respuestas al cuestionario de onboarding para
        personalizar tu experiencia y recomendaciones.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>2. Cómo usamos tu información</h2>
      <p>Usamos tu información para:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Proveer y mantener el servicio de Piraí</li>
        <li>Personalizar recomendaciones de contenido y recursos</li>
        <li>Generar métricas e insights sobre tu actividad profesional</li>
        <li>Enviar notificaciones relevantes sobre tu progreso</li>
        <li>Mejorar la experiencia del producto</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>3. Almacenamiento de datos</h2>
      <p>
        Tus datos se almacenan de forma segura en Airtable y se transmiten mediante
        conexiones encriptadas (HTTPS). No vendemos ni compartimos tu información
        personal con terceros con fines publicitarios.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>4. Servicios de terceros</h2>
      <p>Utilizamos los siguientes servicios:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Clerk</strong> — autenticación y gestión de cuentas</li>
        <li><strong>Airtable</strong> — almacenamiento de datos</li>
        <li><strong>Stripe</strong> — procesamiento de pagos (si aplicable)</li>
        <li><strong>OpenAI</strong> — generación de recomendaciones personalizadas</li>
      </ul>
      <p>Cada servicio tiene su propia política de privacidad que te recomendamos revisar.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>5. Uso de datos de Google / Google API Services</h2>
      <p>
        Piraí utiliza la API de Gmail para permitir a los usuarios leer y enviar correos electrónicos
        directamente desde la aplicación, como parte de su seguimiento de búsqueda de empleo.
      </p>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Datos accedidos:</strong> mensajes de Gmail del usuario autenticado (asunto, remitente, cuerpo, adjuntos), accedidos en tiempo real durante la sesión activa.</li>
        <li><strong>Uso:</strong> exclusivamente para mostrar emails relevantes al usuario dentro de la app y permitirle enviar mensajes desde su cuenta. Los datos no se almacenan en nuestros servidores más allá de la sesión activa.</li>
        <li><strong>Transferencia:</strong> no se comparten ni venden datos de Gmail a terceros bajo ninguna circunstancia.</li>
        <li><strong>Modelos de IA:</strong> los datos obtenidos a través de Google Workspace APIs no se utilizan para entrenar, desarrollar ni mejorar modelos de inteligencia artificial, propios ni de terceros.</li>
        <li><strong>Retención y eliminación:</strong> no retenemos datos de Gmail. El usuario puede revocar el acceso de Piraí en cualquier momento desde <a href="https://myaccount.google.com/permissions" style={{ color: '#6366f1' }}>myaccount.google.com/permissions</a>.</li>
      </ul>
      <p style={{ marginTop: 16, padding: '12px 16px', background: '#f0fdf4', borderLeft: '4px solid #00A86B', borderRadius: 4, fontSize: 14 }}>
        <strong>Declaración de uso limitado:</strong> El uso de datos recibidos de Google Workspace APIs cumple con la{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: '#6366f1' }}>
          Google API Services User Data Policy
        </a>
        , incluyendo los requisitos de Limited Use. Los datos de Google no se utilizan para desarrollar, mejorar ni entrenar modelos de inteligencia artificial.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>6. Tus derechos</h2>
      <p>Podés:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Acceder a tus datos personales en cualquier momento</li>
        <li>Solicitar la corrección de datos inexactos</li>
        <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
        <li>Retirar tu consentimiento en cualquier momento</li>
      </ul>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>7. Seguridad</h2>
      <p>
        Implementamos medidas de seguridad razonables para proteger tu información.
        Sin embargo, ningún método de transmisión por internet es 100% seguro.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>8. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política ocasionalmente. Te notificaremos sobre cambios
        significativos a través de la app o por correo electrónico.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>9. Contacto</h2>
      <p>
        Si tenés preguntas sobre esta política, escribinos a:{' '}
        <a href="mailto:ale@alecadario.com" style={{ color: '#6366f1' }}>ale@alecadario.com</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #eee', color: '#999', fontSize: 14 }}>
        © 2026 Piraí — Alejandra Cadario
      </div>
    </main>
  );
}
