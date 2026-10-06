# Prompt para la próxima sesión — MODO PLAN (copiar y pegar)

> Pega **todo el bloque de abajo** como primer mensaje de una sesión nueva **en modo plan** (no en build). Objetivo: **rediseñar el front** para que no se vea genérico, usando los skills instalados, y dejar listo el **despliegue**. El backend y las funcionalidades ya están completos y estables (**v1.0.0**).

```text
Vas a continuar el proyecto Legato (reproductor de música para músicos con
listas doblemente enlazadas hechas a mano). ESTA SESIÓN EMPIEZA EN MODO PLAN:
solo leer, investigar, proponer y preguntar; no modificar archivos ni ejecutar
builds hasta que yo lo autorice.

CONTEXTO: el BACKEND y las FUNCIONALIDADES están COMPLETOS y funcionando
(reproductor, listas dobles, playlists, biblioteca, músicos, login con Google o
invitado, sincronización, import de Spotify, calidad de audio). El móvil ya está
reorganizado. NO hay que tocar funcionalidad: SOLO mejorar el FRONT (que hoy se
siente genérico y queremos que sea premium/distinto). Hay una versión de respaldo
etiquetada: git tag v1.0.0 (esta base se conserva).

PASO 1 (obligatorio): lee COMPLETOS:
  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md
  /home/jenifrutica/Proyectos/legato/docs/PENDIENTES.md
Consulta si hace falta: docs/ESTADO.md, docs/REDISENO.md (dirección actual
"Duotono 62"), docs/UI-UX.md, docs/ACCESIBILIDAD.md, docs/DECISIONES.md.

PASO 2: verifica el estado real (no asumas):
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # 318 en verde
  ~/.bun/bin/bun run test:e2e    # 17 en verde (modo local, puerto 5174)
  ~/.bun/bin/bun run build
  # Dev (si lo pido): ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
  # Abrir SIEMPRE http://127.0.0.1:5173 (no localhost, por Spotify).

PASO 3: LEE ESTOS SKILLS (están instalados en el proyecto) antes de proponer:
  .agents/skills/awwwards-animations/SKILL.md   # animaciones premium GSAP/Motion/Anime.js/Lenis
  .agents/skills/animejs/SKILL.md               # motores de animación (timelines, stagger, SVG)
  .agents/skills/manus/SKILL.md                 # delegar investigación/diseño largo a Manus AI
  También usa la skill "impeccable" (flujo de dirección, no solo el detector) y
  "review-animations"/"design-taste-frontend" si aplican.

PASO 4: prepara un PLAN de rediseño de front (SIN tocar código aún) y hazme
preguntas con el question tool. Requisitos:
  - Que NO se vea genérica ni "hecha con IA": direcciones concretas de arte
    (tipografía, composición, movimiento), no solo color.
  - MANTENER el estilo/base actual (Duotono 62: papel + tinta + tinta directa del
    álbum, nada oscuro por defecto) y TODAS las funcionalidades.
  - MANTENER: una sola barra de reproducción por vista, cero superposiciones,
    portada completa en el disco, UI teñida por el álbum, i18n ES/EN/PT.
  - Mejorar el MÓVIL (ya reorganizado) y el ESCRITORIO.
  - **Falta un buen logo/icono**: hoy es un marcador Duotono temporal; hay que
    crear el logo/icono definitivo (wordmark + símbolo + favicon e icono PWA).
  - Accesibilidad: axe 0.
  - Usar las animaciones de forma con criterio (micro-interacciones, transiciones,
    reveals) sin sacrificar rendimiento (60fps) ni el fallback de reducción de
    movimiento.
  - Muéstrame 2–3 direcciones visuales con composición (y, si puedes, capturas)
    ANTES de construir; no iterar a ciegas.
  - No romper los E2E (selectores por aria-label; si renombras controles, actualiza
    tests/e2e). Se aceptan capturas con Playwright para comparar.

PENDIENTE DESPUÉS DEL FRONT (no ahora): DESPLIEGUE.
  - Firebase → Authentication → Authorized domains: añadir app.jenilarper.dev.
  - Spotify dashboard: confirmar https://app.jenilarper.dev en Redirect URIs.
  - bun run build → S3 privado + CloudFront (OAC) + ACM us-east-1 → CNAME
    app.jenilarper.dev en name.com → 403/404 → /index.html 200 (SPA) → sw.js y
    manifest.webmanifest con Cache-Control: no-cache.
  - ROTAR/desactivar la access key de AWS expuesta (issue #27).
  No desplegar ni rotar nada hasta que yo lo pida.

REGLAS DEL PROYECTO (no negociables):
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main al cerrar cada
  bloque verificado.
- Nada oscuro por defecto (el oscuro es opcional y conmutable).
- La portada se ve en el disco; la UI se tiñe MUCHO con los colores del álbum.
- El núcleo académico son las LISTAS DOBLES HECHAS A MANO (no tocar su lógica).
- Validar SIEMPRE antes de commitear: format + typecheck + oxlint + tests + build +
  E2E; axe sin violaciones.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md.
- No hay tokens de IA ni sesión de Spotify en el entorno: verificación en mi
  navegador (Brave/Fedora); si Firebase no responde, la puerta tiene timeout.

Empieza leyendo y verificando; lee los skills; luego preséntame el plan de front
y tus preguntas. No escribas código todavía.
```
