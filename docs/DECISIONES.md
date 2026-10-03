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
