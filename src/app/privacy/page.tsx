export const metadata = {
  title: 'Política de Privacidad — Piraí',
  description: 'Cómo Piraí recopila, usa y protege tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.7 }}>
      <a href="/" style={{ color: '#00A86B', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Volver a inicio</a>
      <h1 style={{ fontSize: 28, marginBottom: 8, marginTop: 24 }}>Política de Privacidad</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Última actualización: julio de 2026</p>

      <p>
        Piraí (&quot;nosotros&quot;, &quot;la app&quot;) es una aplicación de productividad profesional
        desarrollada por Samurai Venture SL. Esta política describe cómo recopilamos, usamos
        y protegemos tu información cuando utilizás nuestra aplicación web y móvil.
      </p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>1. Información que recopilamos</h2>
      <p>
        <strong>Datos de cuenta:</strong> Al registrarte con Google, recopilamos tu nombre,
        dirección de correo electrónico y foto de perfil a través de Google OAuth 2.0.
      </p>
      <p>
        <strong>Datos de uso:</strong> Información sobre las empresas, contactos y actividades
        que registrás en la plataforma como parte de tu pipeline profesional.
      </p>
      <p>
        <strong>Datos de perfil:</strong> Respuestas al cuestionario de onboarding para
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
        <li><strong>Google OAuth</strong> — autenticación e inicio de sesión</li>
        <li><strong>Google Gmail API</strong> — lectura y envío de correos desde la app</li>
        <li><strong>Airtable</strong> — almacenamiento de datos</li>
        <li><strong>Stripe</strong> — procesamiento de pagos</li>
        <li><strong>OpenAI</strong> — generación de recomendaciones personalizadas</li>
      </ul>
      <p>Cada servicio tiene su propia política de privacidad que te recomendamos revisar.</p>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>5. Uso de datos de Google</h2>
      <p>
        El uso de Piraí de la información recibida de las APIs de Google se adhiere a la{' '}
        <a href="https://developers.google.com/terms/api-services-user-data-policy" style={{ color: '#6366f1' }}>
          Google API Services User Data Policy
        </a>
        , incluyendo los requisitos de uso limitado (Limited Use).
      </p>

      <h3 style={{ fontSize: 17, marginTop: 20 }}>Autenticación</h3>
      <p>
        Usamos Google OAuth 2.0 para que puedas iniciar sesión de forma segura. Accedemos a tu
        nombre, email y foto de perfil únicamente para crear y gestionar tu cuenta en Piraí.
      </p>

      <h3 style={{ fontSize: 17, marginTop: 20 }}>Gmail</h3>
      <p>
        Piraí solicita acceso a tu Gmail para permitirte leer y responder correos relacionados
        con tu búsqueda de empleo directamente desde la app, sin tener que cambiar de plataforma.
      </p>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Datos accedidos:</strong> asunto, remitente, cuerpo y adjuntos de tus mensajes de Gmail.</li>
        <li><strong>Uso:</strong> exclusivamente para mostrar tus emails dentro de Piraí y permitirte enviar respuestas. No almacenamos el contenido de tus emails en nuestros servidores.</li>
        <li><strong>Sin transferencia:</strong> los datos de Gmail no se comparten ni se venden a ningún tercero.</li>
        <li><strong>Sin uso en IA:</strong> los datos de Gmail no se usan para entrenar, mejorar ni desarrollar modelos de inteligencia artificial, propios ni de terceros.</li>
        <li><strong>Eliminación:</strong> podés revocar el acceso de Piraí a tu cuenta Google en cualquier momento desde{' '}
          <a href="https://myaccount.google.com/permissions" style={{ color: '#6366f1' }}>myaccount.google.com/permissions</a>.
        </li>
      </ul>

      <div style={{ marginTop: 20, padding: '14px 18px', background: '#f0fdf4', borderLeft: '4px solid #00A86B', borderRadius: 4, fontSize: 14 }}>
        <strong>Declaración de uso limitado (Limited Use):</strong> El uso de datos brutos o derivados
        recibidos de las APIs de Google Workspace se adhiere a la Google API Services User Data Policy,
        incluyendo los requisitos de Limited Use. Estos datos no se utilizan para desarrollar, mejorar
        ni entrenar modelos de inteligencia artificial.
      </div>

      <h2 style={{ fontSize: 20, marginTop: 32 }}>6. Tus derechos</h2>
      <p>Podés:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Acceder a tus datos personales en cualquier momento</li>
        <li>Solicitar la corrección de datos inexactos</li>
        <li>Solicitar la eliminación de tu cuenta y datos asociados</li>
        <li>Revocar el acceso de Piraí a tu cuenta Google desde <a href="https://myaccount.google.com/permissions" style={{ color: '#6366f1' }}>myaccount.google.com/permissions</a></li>
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
        <a href="mailto:pirai@alecadario.com" style={{ color: '#6366f1' }}>pirai@alecadario.com</a>
      </p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #eee', color: '#999', fontSize: 14 }}>
        © 2026 Piraí — Samurai Venture SL
      </div>
    </main>
  );
}
