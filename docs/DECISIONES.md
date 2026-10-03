# Registro de decisiones

Todas las decisiones se tomaron entre el 2 y el 3 de octubre de 2026, antes de escribir código de aplicación.

## Producto y alcance

| # | Decisión | Razón |
|---|---|---|
| D01 | Reproductor de música web (PC y móvil) para músicos | Requisito del taller |
| D02 | Nombre temporal **Legato**; logo pendiente | El nombre definitivo y el icono los define la autora |
| D03 | Alcance MVP en **4 días** | Fecha real de entrega |
| D04 | Extras priorizados: modo estructura → ensayo → undo/redo → karaoke M/S | Maximizar rúbrica sin comprometer el MVP |
| D05 | Post-entrega: sync, Google IdP, ACRCloud, Spotify, Demucs, transcodificación | No caben en el plazo |

## Técnicas

| # | Decisión | Razón |
|---|---|---|
| D06 | TypeScript en todo el proyecto | Requisito del taller y seguridad de tipos |
| D07 | React + Vite + Tailwind | Ecosistema maduro para UI, DnD, i18n y PWA |
| D08 | **Bun** como gestor de paquetes | Elección de la autora; rapidez |
| D09 | Repo simple modular (sin monorepo pesado) | "Repo simplecito, no saturar" |
| D10 | Lista doblemente enlazada a mano (sin métodos de frameworks) | Núcleo académico del taller |
| D11 | `currentNode` como puntero, nunca índice | Corrige el bug #12 de reordenamiento |
| D12 | Visualizador "modo estructura" | Evidencia visual del uso real de la estructura |
| D13 | Undo/redo con pila de comandos | Refuerza el uso de estructuras de datos |
| D14 | Persistencia local con IndexedDB + sesión persistente | Recargar y continuar sin backend |
| D15 | Sin analítica de ningún tipo | Minimización de datos |
| D16 | i18n ES / EN / PT con i18next | Requisito del taller |
| D17 | Tests: Vitest + Testing Library + fast-check + Playwright + axe-core | Calidad y regresión del bug #12 |

## Plataforma y despliegue

| # | Decisión | Razón |
|---|---|---|
| D18 | AWS con cuenta nueva (Free plan: hasta $200 en créditos, 6 meses) | Requisito de despliegue |
| D19 | AWS Amplify Hosting + Cognito en `us-east-1` | Ruta más rápida a HTTPS con dominio propio |
| D20 | Dominio `app.jenilarper.dev` (ya propio) | `legato.dev/.app/.fm` están ocupados y no existen dominios gratis registrables |
| D21 | DNS manual con **CNAME en name.com** (pestaña DNS Records) | No tocar nameservers; sin costo |
| D22 | Login: **Cognito correo/contraseña** en el timebox; Google IdP después | Google Cloud quedó diferido; evita riesgo en el plazo |
| D23 | Fallback de login: perfil local con interfaz `AuthProvider` | No frenar el MVP si Cognito falla |
| D24 | S3 + DynamoDB + sync multi-dispositivo: post-entrega | No cabe en 4 días |
| D25 | Conflictos de sync: última edición gana (`updatedAt`) | Simple y predecible (cuando se implemente) |
| D26 | Sin monitoreo de errores externo | Sin terceros ni datos personales |

## Cumplimiento y accesibilidad

| # | Decisión | Razón |
|---|---|---|
| D27 | Cookies: solo esenciales + **consentimiento granular** | Colombia (Ley 1581) y UE (GDPR/ePrivacy) |
| D28 | Páginas de privacidad, términos y cookies en ES/EN/PT | Requisito del taller |
| D29 | Accesibilidad WCAG 2.2 AA + panel de opciones para discapacidad | Requisito del taller |
| D30 | Textos legales redactados como plantilla revisable | Proyecto académico; no sustituyen asesoría legal |
| D31 | Sin fines de lucro; biblioteca privada; responsabilidad del usuario sobre su contenido | Derechos de autor |

## Seguridad

| # | Decisión | Razón |
|---|---|---|
| D32 | Secretos solo en `.env`/`~/.aws`, nunca en el repo | Buenas prácticas |
| D33 | Rotar/desactivar la access key compartida al terminar la entrega | La llave quedó expuesta en el chat |
| D34 | Validación con Zod en formularios, API e importaciones | Robustez |
| D35 | Rate limits y cuotas (post-entrega en la nube) | Evitar abuso y costos |

## Descubrimientos de infraestructura (3 oct 2026)

| # | Decisión | Razón |
|---|---|---|
| D36 | La cuenta AWS está en una organización con **SCP** que bloquea Cognito, Amplify, Lambda y DynamoDB | Verificado con errores `AccessDeniedException` explícitos; disponibles S3, CloudFront, ACM, Route 53, EC2 e IAM |
| D37 | Login del MVP: **perfil local**; `CognitoAuthProvider` implementado y listo para una cuenta sin SCP | Cumple el fallback del timebox sin bloquear el MVP |
| D38 | Despliegue del Día 4 cambia a **S3 + CloudFront + ACM** en vez de Amplify | Amplify está bloqueado; S3/CloudFront/ACM están permitidos |
| D39 | Crossfade **secuencial** (fade-out + fade-in) por defecto 2 s, rango 0–12 s | Sin doble deck en el MVP; el solape real con dos elementos de audio queda post-entrega |
| D40 | Salida de audio con **setSinkId** solo donde el navegador lo soporta (Chromium); fallback silencioso | Firefox/Safari no lo implementan |
| D41 | Modo offline con **service worker en producción** (app shell) + IndexedDB local | No interfiere con el desarrollo; `sw.js` debe servirse sin caché en CloudFront |
| D42 | Jam en tiempo real y playlists compartidas: **post-entrega** con interfaz `JamProvider` y diseño en `docs/JAM.md` | Requiere backend WebSocket y cuentas, bloqueados por la SCP; se sincroniza control, nunca audio |

## Rediseño visual (3 oct 2026, sesión 3)

| # | Decisión | Razón |
|---|---|---|
| D43 | Rediseño completo de la capa visual usando el flujo de **impeccable** (context → new-work → roll → comps → direction contract → build → detect → finish review) y elección de dirección con la autora antes de construir | No volver a iterar a ciegas sobre la UI |
| D44 | Dirección elegida: **Duotono 62** (edición musical impresa a dos tintas: papel hueso, tinta negra y una tinta directa del álbum) | Máxima fuerza gráfica y tipográfica; conserva la portada como protagonista |
| D45 | Se descartan las cartas A (Círculo armónico), C (Partitura) y D (Dos tintas); la notación de C vive dentro del panel de músicos de Duotono | Una sola coherencia visual; la fusión no superó a la dirección pura |
| D46 | Tema por portada redefinido a **tres tintas derivadas** (papel, tinta y tinta directa) con contraste AA y variante oscura; el alto contraste de a11y gana | El pedido es que la UI se tiña de forma notoria sin perder legibilidad |
| D47 | Tipografías: **Archivo variable** (display/UI, eje de ancho), **Source Serif 4** (notación y letras) y **JetBrains Mono** (datos); se retiran Fraunces e Inter | La tipografía es el material gráfico principal |
| D48 | Ondas de **líneas planas** saliendo del disco, en las dos tintas del álbum, grosores alternados estilo tipográfico, sin glow; 30 fps y respeto a `prefers-reduced-motion` | El pedido textual: ondas tipo líneas siguiendo el estilo de la fuente |
| D49 | Panel de músicos (partitura + modo Estructura) como **slide-over con pestaña arrastrable**, minimizable/maximizable y estado persistido | Es una capa para quien explora; no debe cargar la vista por defecto |
| D50 | Letras: diseño e interacción ahora con datos de ejemplo; conexión **LRCLIB + etiquetas/.lrc** en la fase funcional siguiente | No acoplar el rediseño a una API externa |
| D51 | Carril de burbujas reservado en el héroe para la **Cápsula nostálgica** (nueva funcionalidad); se implementa después del rediseño | La funcionalidad anunciada necesita hogar visual desde el inicio |
| D52 | `buildPath: comp` registrado en `.impeccable/config.json`; los comps se produjeron como **mocks HTML locales** capturados con Playwright porque la key de OpenAI estaba vencida (401) | Verificación visual real sin coste ni dependencias |
| D53 | Cápsula nostálgica: generador **determinista** por fecha + usuario sobre la biblioteca local, registro de escuchas en `localStorage` (`legato.plays.v1`), contextos (obsesión/olvidada/hace un año/recién llegada) y «Favoritos» como playlist creada al guardar | Sin backend ni cuentas; el mismo día produce la misma cápsula |
| D54 | El «fondo degradado dinámico» de la cápsula se traduce a **banda dura de tinta directa** detrás de la tarjeta | La regla del mundo prohíbe gradientes decorativos; se conserva el efecto dinámico con dos tintas |
