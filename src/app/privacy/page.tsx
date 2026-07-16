export const metadata = {
  title: 'Política de Privacidad — Piraí',
  description: 'Cómo Piraí recopila, usa y protege tus datos personales.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-brand-gray">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-brand-dark mb-2">Política de Privacidad</h1>
        <p className="text-brand-muted text-sm mb-10">Última actualización: julio de 2025</p>

        <section className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">1. Quiénes somos</h2>
          <p className="text-brand-muted leading-relaxed">
            Piraí es una plataforma de búsqueda de empleo inteligente que ayuda a profesionales a organizar su proceso de búsqueda, mejorar su marca personal y conectar con oportunidades laborales. Operamos en <strong>pirai.es</strong> y <strong>piraiapp.com</strong>.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">2. Datos que recopilamos</h2>
          <ul className="text-brand-muted leading-relaxed space-y-2 list-disc list-inside">
            <li>Información de perfil profesional (nombre, cargo, experiencia, habilidades)</li>
            <li>Actividades de búsqueda de empleo (empresas contactadas, entrevistas, seguimientos)</li>
            <li>Datos de autenticación gestionados por Clerk (no almacenamos contraseñas)</li>
            <li>Preferencias y configuración de la plataforma</li>
          </ul>
        </section>

        <section className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">3. Uso de datos de Google / Google API Services</h2>

          <p className="text-brand-muted leading-relaxed mb-4">
            Piraí utiliza la API de Gmail para permitir a los usuarios leer y enviar correos electrónicos directamente desde la aplicación, como parte de su seguimiento de búsqueda de empleo.
          </p>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-brand-dark mb-1">Datos accedidos</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Mensajes de Gmail del usuario autenticado (asunto, remitente, cuerpo, adjuntos) accedidos en tiempo real durante la sesión activa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-1">Uso</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Exclusivamente para mostrar emails relevantes al usuario dentro de la app y permitirle enviar mensajes desde su cuenta. Los datos se obtienen en tiempo real y no se almacenan en nuestros servidores más allá de la sesión activa.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-1">Transferencia</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                No se comparten ni venden datos de Gmail a terceros bajo ninguna circunstancia.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-1">Modelos de IA</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                Los datos obtenidos a través de Google Workspace APIs <strong>no se utilizan</strong> para entrenar, desarrollar ni mejorar modelos de inteligencia artificial, propios ni de terceros.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-brand-dark mb-1">Retención y eliminación</h3>
              <p className="text-brand-muted text-sm leading-relaxed">
                No retenemos datos de Gmail. El usuario puede revocar el acceso de Piraí a su cuenta Google en cualquier momento desde{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pirai-600 hover:underline"
                >
                  myaccount.google.com/permissions
                </a>.
              </p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-pirai-50 rounded-xl border border-pirai-100">
            <p className="text-sm text-pirai-700 leading-relaxed">
              <strong>Declaración de uso limitado:</strong> El uso de datos brutos o derivados recibidos de Google Workspace APIs cumple con la{' '}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Google API Services User Data Policy
              </a>
              , incluyendo los requisitos de Limited Use. Los datos de Google no se utilizan para desarrollar, mejorar ni entrenar modelos de inteligencia artificial.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">4. Seguridad</h2>
          <p className="text-brand-muted leading-relaxed">
            Utilizamos cifrado en tránsito (HTTPS/TLS) para todas las comunicaciones. Los datos se almacenan en Airtable con acceso restringido por API key. La autenticación se delega a Clerk, que cumple con los estándares de seguridad OAuth 2.0.
          </p>
        </section>

        <section className="bg-white rounded-2xl p-8 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">5. Tus derechos</h2>
          <p className="text-brand-muted leading-relaxed mb-3">
            Tenés derecho a acceder, rectificar y eliminar tus datos en cualquier momento. Para solicitar la eliminación de tu cuenta y datos asociados, contactanos en:
          </p>
          <a href="mailto:hola@pirai.es" className="text-pirai-600 font-medium hover:underline">
            hola@pirai.es
          </a>
        </section>

        <section className="bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-brand-dark mb-4">6. Contacto</h2>
          <p className="text-brand-muted leading-relaxed">
            Si tenés preguntas sobre esta política de privacidad, podés escribirnos a{' '}
            <a href="mailto:hola@pirai.es" className="text-pirai-600 hover:underline">hola@pirai.es</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
