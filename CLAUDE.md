# Pirai Web — Instrucciones para Claude

## Regla principal
**Todo el trabajo va en pirai-web (pirai.es).** piraiapp.com es solo referencia de código — se lee para entender qué replicar en el desktop, pero NO se modifica salvo que sea estrictamente necesario para que una API funcione desde el browser.

## Stack
- Next.js 16, Tailwind v4, TypeScript
- Deploy: Netlify desde `main`
- Hotfixes: push `fix-main` → `main` directamente
- Feature branch: `claude/jobs-app-friday-default-view-kgtho2`

## API
- Backend: `process.env.NEXT_PUBLIC_API_URL ?? 'https://piraiapp.com'`
- Llamadas cross-origin: siempre proxiar a través de rutas API de pirai-web (`/src/app/api/`) para evitar CORS

## Usuario admin
- `ale@alecadario.com` tiene acceso ilimitado a todo, sin restricciones de ningún tipo
- No aplicar límites de quota, rate limits, ni bloqueos de features para este usuario
- El backend ya lo maneja en `quota.js` (plan impulso con 999999 usos)
- En el frontend: nunca mostrar mensajes de límite, bloqueos ni prompts de upgrade para este email
- Análisis de perfil incluido: puede re-analizar ilimitadas veces (bypass del límite semanal en analyze-profile.js)

## Convenciones
- Rama de trabajo: `claude/jobs-app-friday-default-view-kgtho2` (ambos repos)
- PRs a main: mergear sin preguntar
