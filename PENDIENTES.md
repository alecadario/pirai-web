# Pendientes pirai.es — Auditorías jul-2026

## ✅ Resuelto
- Páginas legales creadas: /terminos, /aviso-legal, /cookies, /privacy
- Footer con links legales en home y webinars
- Nav completa en /webinars
- Login: links reales a términos + email hola@pirai.es + noindex
- 404 con diseño de Piraí en español
- Bug H1/H2 concatenado ("Tu copiloto paraconseguir trabajo")
- Botones de precios con parámetro de plan (?plan=pro, ?plan=acelerado)
- Email unificado en Privacy y Aviso Legal a pirai@alecadario.com
- Link de cookies en footer

---

## ⏳ Pendiente

### S1 — Urgente (antes del 29-jul)
- [ ] **Webinar caducado en home** — muestra sep-2025 hardcodeado. Conectar al mismo endpoint que /webinars para mostrar el próximo real.

### S2 — Esta semana
- [ ] **SEO** — Títulos únicos por página, meta descriptions distintas, Open Graph (og:title, og:description, og:image), canonical. Hoy las 3 páginas comparten el mismo title y description.
- [ ] **Contraste CTA** — Botón verde principal tiene ratio 3.08:1, mínimo WCAG AA es 4.5:1.
- [ ] **Contradicción de cifras** — Home dice "+100 usuarios en beta" Y "miles de candidatos activos". Hay que unificar.

### S3 — Backlog
- [ ] Toggle "Soy emprendedor" incompleto — cambia hero pero no testimonios, precios ni footer.
- [ ] Fechas con "De Julio De" por text-transform: capitalize en CSS.
- [ ] Hora del webinar solo en hora boliviana (añadir zonas horarias relevantes).
- [ ] Logo "PiraiApp" sin tilde en algunos lugares (unificar a "Piraí").
