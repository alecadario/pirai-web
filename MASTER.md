# Pirai — Master Reference Document

> Documento de referencia completo para Claude y colaboradores.
> Última actualización: julio 2026.

---

## 1. Qué es Pirai

Pirai es una aplicación de búsqueda de empleo y desarrollo de carrera para profesionales hispanohablantes. Ayuda a los usuarios a:

- Organizar su búsqueda de trabajo en un pipeline visual (estilo kanban)
- Gestionar contactos y empresas (CRM)
- Trabajar su marca personal
- Prepararse para entrevistas
- Registrar acciones diarias de networking
- Conectar su Gmail para dar contexto a la IA
- Recibir análisis de perfil con IA (OpenAI)
- Gestionar deals/ventas (para freelancers)

**Para quién:** profesionales en búsqueda activa de empleo, especialmente en Latinoamérica y España.

---

## 2. Los dos productos

| Producto | Dominio | Repo GitHub | Stack | Deploy |
|---|---|---|---|---|
| App móvil / web app | piraiapp.com | `alecadario/pirai` | Next.js 14 + Capacitor (iOS) | Netlify |
| Desktop web | pirai.es | `alecadario/pirai-web` | Next.js 16 + Tailwind v4 + TypeScript | Netlify |

### Relación entre los dos
- **piraiapp.com** es el backend real — tiene todas las rutas API (`/pages/api/`), la lógica de negocio, la conexión con Airtable, la autenticación, etc.
- **pirai.es** es el frontend desktop — sus rutas `/src/app/api/` son simples proxies que reenvían las llamadas a piraiapp.com para evitar CORS.
- **Regla:** todo el trabajo nuevo va en pirai-web (pirai.es). Solo se modifica piraiapp.com cuando es estrictamente necesario para que una API funcione.

---

## 3. Infraestructura y herramientas

### Control de versiones
- **GitHub** — ambos repos bajo el usuario `alecadario`
- Branch de trabajo activo: `claude/jobs-app-friday-default-view-kgtho2` (ambos repos)
- Deploy automático desde `main`
- Hotfixes: push a branch `fix-main` → merge a `main`

### Hosting y deploy
- **Netlify** — ambos sitios
  - piraiapp.com: deploy desde `main` de `alecadario/pirai`
  - pirai.es: deploy desde `main` de `alecadario/pirai-web`
  - Netlify Functions: `netlify/functions/daily-notifications.js` (cron diario de push notifications)

### Base de datos
- **Airtable** — base de datos principal (no hay SQL)
- Acceso vía API REST (`https://api.airtable.com/v0/`)
- Credenciales: `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` (solo en servidor, nunca exponer con prefijo `NEXT_PUBLIC_`)

### IA
- **OpenAI API** — análisis de perfil, sugerencias de CV, preparación de entrevistas, matching de ofertas
- Variable: `OPENAI_API_KEY`

### Autenticación
- **Google OAuth 2.0** — flujo completo en `pages/api/google/`
  - `user_id` en Airtable = Google ID (número de 21 dígitos, ej: `107960129910573357787`)
- **Apple Sign-In** — flujo completo en `pages/api/apple/`
  - `user_id` en Airtable = `apple_XXXXXXXXXXXXXXXXXXXXXXXX`
- **Sin Clerk** — fue usado antes, ya removido completamente
- La sesión se guarda en `localStorage` del browser

### Pagos
- **Stripe** — suscripciones y pagos únicos
  - `pages/api/checkout/create-session.js` — planes individuales
  - `pages/api/create-checkout.js` — checkout B2B/equipos
  - `pages/api/stripe-webhook.js` — maneja eventos de Stripe
  - Variables: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`

### Email transaccional
- **Resend** — envío de emails (bienvenida, notificaciones)
- Variable: `RESEND_API_KEY`

### Push Notifications
- **APNS (Apple Push Notification Service)** — notificaciones nativas iOS
- `pages/api/send-apns.js` — envía push a dispositivos iOS
- `netlify/functions/daily-notifications.js` — cron diario que dispara los push
- Variables: `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY_BASE64`
- **No se usa** web push (VAPID) — ese código fue eliminado

### Video
- Videos de YouTube embebidos (modal player en la app)
- Tabla `video_views` en Airtable registra qué videos vio cada usuario

---

## 4. Tablas en Airtable

| Tabla | Qué guarda |
|---|---|
| `Users` | Registro principal del usuario: `user_id`, `email`, `name`, `plan`, tokens de Google, etc. |
| `Activities` | Actividades del pipeline: postulaciones, emails enviados, llamadas, etc. |
| `Companies` | Empresas guardadas por el usuario (CRM) |
| `Contacts` | Contactos guardados por el usuario (CRM) |
| `Events` | Eventos del pipeline (entrevistas, fechas clave) |
| `MarcaPersonal` | Contenido de marca personal del usuario |
| `InterviewReviews` | Reseñas de entrevistas |
| `DailyActions` | Acciones diarias de networking registradas |
| `Deals` | Ventas/deals (para freelancers) — campos: `client_name`, `amount`, `currency`, `deal_type`, `status`, `user_id` |
| `PushSubscriptions` | Tokens de dispositivos para APNS |
| `video_views` | Registro de videos vistos por usuario |

---

## 5. Planes y usuarios

### Planes
- **Free** — funcionalidades básicas, cuotas limitadas
- **Planes pagos** — gestionados en `lib/plans.js` y `lib/quota.js`
- Los límites se verifican en `pages/api/quota.js` antes de operaciones costosas (llamadas a OpenAI, análisis, etc.)

### Usuario admin
- Email: `ale@alecadario.com`
- **Sin restricciones de ningún tipo** — cuota ilimitada, sin rate limits, sin mensajes de upgrade
- Implementado en `lib/quota.js`:
  ```js
  const ADMIN_EMAILS = ['ale@alecadario.com'];
  // Devuelve plan "impulso" con 999999 usos y weeklyLimits null
  ```
- En el frontend (pirai-web): **nunca** mostrar mensajes de límite, bloqueos ni prompts de upgrade para este email

---

## 6. Autenticación — flujo detallado

### Google OAuth
1. Usuario hace clic en "Entrar con Google"
2. App redirige a `pages/api/google/connect.js` → redirige a `accounts.google.com`
3. Google redirige de vuelta a `pages/api/google/callback.js`
4. El callback intercambia el code por tokens, obtiene el perfil de Google
5. Busca o crea el usuario en Airtable (`Users` table) usando el Google ID como `user_id`
6. Redirige al frontend con `?pirai_user_id=XXX&pirai_email=XXX&pirai_name=XXX`
7. El frontend guarda la sesión en localStorage

### Apple Sign-In
1. Usuario hace clic en "Entrar con Apple"
2. App usa el plugin Capawesome para Sign in with Apple (nativo en iOS)
3. Apple devuelve un `id_token` JWT
4. El token se verifica en `pages/api/apple/callback.js` con las claves públicas de Apple
5. Se extrae el `sub` (Apple ID) y se crea `user_id = "apple_" + sub`
6. Busca o crea el usuario en Airtable
7. Redirige con los datos de sesión

### Fallback por email
- Si el callback de Google no encuentra un usuario por Google ID, busca por email como fallback
- Si lo encuentra, actualiza el `user_id` al Google ID actual — cubre casos de usuarios con registros duplicados o incompletos

---

## 7. Estructura de archivos — pirai (piraiapp.com)

```
pirai/
├── components/
│   └── PiraiApp.jsx          ← Componente principal de la app (muy grande)
├── pages/
│   ├── _app.js               ← App wrapper (meta tags, fonts, viewport)
│   ├── index.js              ← Landing page / entry point
│   ├── admin.jsx             ← Panel de admin (solo ale@alecadario.com)
│   └── api/
│       ├── google/
│       │   ├── connect.js    ← Inicia OAuth con Google
│       │   └── callback.js   ← Recibe callback de Google, crea sesión
│       ├── apple/
│       │   ├── connect.js    ← Inicia Sign in with Apple (web)
│       │   └── callback.js   ← Recibe callback de Apple, crea sesión
│       ├── checkout/
│       │   └── create-session.js  ← Stripe checkout individual
│       ├── admin/
│       │   └── admin-stats.js     ← Stats para el panel admin
│       ├── bootstrap.js      ← Carga inicial: companies + contacts del usuario
│       ├── user-record.js    ← Lee el registro del usuario en Airtable
│       ├── quota.js          ← Verifica cuota del usuario
│       ├── analyze-profile.js ← Análisis de CV/perfil con OpenAI
│       ├── chat.js           ← Chat con IA
│       ├── gmail-messages.js ← Lee emails de Gmail del usuario
│       ├── google-token.js   ← Refresca access token de Google
│       ├── activities.js     ← CRUD actividades del pipeline
│       ├── deals.js          ← CRUD deals/ventas
│       ├── crm/
│       │   ├── contacto.js   ← CRUD contactos
│       │   └── empresa.js    ← CRUD empresas
│       ├── delete-account.js ← Elimina cuenta y todos los datos del usuario
│       ├── create-checkout.js ← Stripe checkout B2B/equipos
│       ├── stripe-webhook.js ← Maneja eventos de Stripe
│       ├── send-apns.js      ← Envía push notifications iOS
│       ├── pricing.js        ← Devuelve precios de planes
│       └── ...
├── lib/
│   ├── airtable.js           ← Funciones helper para Airtable (CRUD)
│   ├── quota.js              ← Lógica de cuotas y planes
│   ├── plans.js              ← Definición de planes y precios
│   ├── cors.js               ← Headers CORS para las APIs
│   └── google-token.js       ← Gestión de tokens OAuth de Google
├── netlify/
│   └── functions/
│       └── daily-notifications.js  ← Cron: envía push diarias a usuarios
├── public/
│   └── sw.js                 ← Service worker (cache offline)
└── capacitor.config.ts       ← Config de Capacitor para iOS
```

---

## 8. Estructura de archivos — pirai-web (pirai.es)

```
pirai-web/
└── src/
    ├── app/
    │   ├── layout.tsx         ← Layout raíz (fonts, metadata)
    │   ├── page.tsx           ← Landing page
    │   ├── dashboard/
    │   │   └── page.tsx       ← Dashboard principal del usuario
    │   ├── crm/
    │   │   └── page.tsx       ← CRM (contactos y empresas)
    │   ├── marca/
    │   │   └── page.tsx       ← Marca personal
    │   ├── insights/
    │   │   └── page.tsx       ← Insights y analytics
    │   ├── perfil/
    │   │   └── page.tsx       ← Perfil del usuario
    │   └── api/               ← Proxies a piraiapp.com (evitar CORS)
    │       ├── bootstrap/route.ts
    │       ├── activities/route.ts
    │       ├── chat/route.ts
    │       ├── profile/route.ts
    │       ├── user/profile/route.ts
    │       └── ...
    └── lib/
        ├── api.ts             ← Helper de fetch (get/post)
        └── ...
```

---

## 9. Variables de entorno

### piraiapp.com (Netlify — piraiapp)

| Variable | Para qué |
|---|---|
| `AIRTABLE_API_KEY` | Acceso a Airtable (NUNCA usar prefijo NEXT_PUBLIC_) |
| `AIRTABLE_BASE_ID` | ID de la base de Airtable |
| `GOOGLE_CLIENT_ID` | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GOOGLE_REDIRECT_URI` | URL de callback de Google |
| `APPLE_SERVICES_ID` | Services ID de Apple para Sign-In |
| `APPLE_TEAM_ID` | Team ID de la cuenta Apple Developer |
| `APPLE_KEY_ID` | Key ID para APNS |
| `APPLE_PRIVATE_KEY_BASE64` | Clave privada APNS en base64 |
| `OPENAI_API_KEY` | API de OpenAI |
| `STRIPE_SECRET_KEY` | Stripe backend |
| `STRIPE_WEBHOOK_SECRET` | Verificar webhooks de Stripe |
| `RESEND_API_KEY` | Envío de emails |
| `ADMIN_SECRET` | Protege endpoints de admin |

### pirai.es (Netlify — pirai-web)

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL del backend (`https://piraiapp.com`) |

> ⚠️ **Regla de seguridad:** Nunca poner `AIRTABLE_API_KEY` con prefijo `NEXT_PUBLIC_` — ese prefijo bake la variable en el bundle JavaScript público y cualquiera puede verla. Solo `NEXT_PUBLIC_API_URL` debe tener ese prefijo.

---

## 10. Seguridad

### Autenticación en APIs
- Las rutas API usan `userId` del body/query para identificar al usuario
- Antes de PATCH o DELETE, se verifica que el registro pertenezca al `userId`:
  - `crm/empresa.js` → busca en Companies y verifica ownership
  - `crm/contacto.js` → busca en Contacts y verifica ownership
  - `deals.js` → busca el deal y verifica `user_id`
  - `delete-account.js` → verifica que el usuario existe antes de borrar

### CORS
- Las rutas API de piraiapp.com tienen `lib/cors.js` que controla qué orígenes pueden llamar
- pirai-web usa rutas proxy (`/src/app/api/`) para evitar llamadas cross-origin directas

---

## 11. Funcionalidades principales

### Pipeline de búsqueda de empleo
- Vista kanban con etapas: Guardada → Aplicada → En proceso → Oferta → Descartada
- Cada tarjeta = una actividad (`Activities` en Airtable)
- Se puede mover entre etapas, agregar notas, adjuntar empresa/contacto

### CRM
- **Empresas:** nombre, industria, website, país, ciudad, prioridad, estado, objetivo
- **Contactos:** nombre, título, email, LinkedIn, teléfono, empresa asociada, etapa, notas
- Ownership verificado: cada user solo ve y edita los suyos

### Marca Personal
- Contenido guardado en tabla `MarcaPersonal`
- IA ayuda a generar y mejorar contenido

### Preparación de entrevistas
- `InterviewReviews` — registro de entrevistas con feedback
- IA da sugerencias de respuestas, preguntas frecuentes por empresa

### Daily Actions
- Registro diario de acciones de networking (`DailyActions`)
- Gamificación: racha de días activos

### Gmail Integration
- Usuario conecta su Gmail via OAuth (scope de lectura de emails)
- `gmail-messages.js` lee los últimos mensajes con refresh token automático
- Da contexto a la IA para respuestas más personalizadas

### Deals (Freelancers)
- CRM de ventas: cliente, descripción, monto, moneda, tipo (único/recurrente), estado
- Estados: `en_negociacion` → `ganado` / `perdido`

### AI / Chat
- `chat.js` — chat general con contexto del usuario
- `analyze-profile.js` — análisis del CV y perfil profesional
- Límite semanal de análisis (bypass para admin)

### Push Notifications (iOS)
- Cron diario via Netlify Functions
- Envía recordatorios de acciones diarias
- Usa APNS (Apple Push Notification Service)

---

## 12. Panel de admin

- URL: `piraiapp.com/admin`
- Solo accesible para `ale@alecadario.com`
- Muestra estadísticas globales: usuarios totales, activos, conversiones, revenue
- Endpoint: `pages/api/admin/admin-stats.js`

---

## 13. Flujo de deploy

1. Desarrollar en branch `claude/jobs-app-friday-default-view-kgtho2`
2. Mergear a `main`
3. Netlify detecta el push a `main` y despliega automáticamente
4. Para hotfixes urgentes: push a `fix-main` → merge a `main`

### Comandos útiles
```bash
# Cambiar al branch de trabajo
git checkout claude/jobs-app-friday-default-view-kgtho2

# Push al branch
git push -u origin claude/jobs-app-friday-default-view-kgtho2
```

---

## 14. Convenciones de código

- **pirai (piraiapp.com):** JavaScript puro (`.js`, `.jsx`), Next.js Pages Router
- **pirai-web (pirai.es):** TypeScript (`.ts`, `.tsx`), Next.js 16 App Router
- **Estilos pirai-web:** Tailwind v4 (sin config file — directivas en CSS)
- **API calls en pirai-web:** siempre via rutas proxy `/api/` para evitar CORS, nunca directo a piraiapp.com desde el cliente
- **IDs de usuario:** siempre el campo `user_id` en Airtable — Google ID (número) o `apple_XXXX`
- **Sin comentarios obvios** — solo comentar cuando el "por qué" no es evidente

---

## 15. Cosas que NO tenemos / fueron removidas

- ❌ **Clerk** — auth anterior, completamente removido
- ❌ **Web Push (VAPID)** — push notifications web, removido (usamos APNS)
- ❌ **Exchange Rates dinámicos** — los precios son hardcodeados en `lib/plans.js`
- ❌ **Team features** — código de teams/invitaciones removido
- ❌ `NEXT_PUBLIC_AIRTABLE_API_KEY` — removida de Netlify (era un riesgo de seguridad crítico, exponía la clave en el bundle público)
