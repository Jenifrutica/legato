# Legato — Contexto completo (handoff de sesión)

> **Lee este documento completo antes de tocar nada.** Está escrito para que una sesión nueva (o un agente distinto) continúe el proyecto exactamente donde quedó, sin releer toda la conversación anterior.

- **Última actualización:** 4 de octubre de 2026, sesión 6 (cierre).
- **Último commit:** ver `git log --oneline -1`. Rama `main`, todo pusheado.
- **Tests:** 313 unitarios + 13 E2E en verde. typecheck/lint/build en verde. axe 0 y detector de impeccable `[]`.
- **Pendientes detallados:** `docs/PENDIENTES.md` (verificación de login con Firebase, «error de conexión», ocultar velocidad en Spotify, import de playlists, deploy).
- **Servidor de desarrollo:** `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` → `http://127.0.0.1:5173` (no `localhost`, por Spotify).

---

## 1. Quién y qué

- **Autora:** Jenifer Daniela Urbano Córdoba — Universidad Cooperativa de Colombia — `jenifer.urbano@campusucc.edu.co` — Colombia.
- **Proyecto:** **Legato** (nombre temporal; logo/icono definitivos pendientes). Reproductor de música web para músicos, con **listas doblemente enlazadas implementadas a mano** como núcleo académico. Proyecto estudiantil **sin fines de lucro**.
- **Entrega:** taller de ~4 días (inicio 3 oct 2026, entrega ~6 oct 2026). Rúbrica: **lista doble/estructuras**, **UI/UX**, **despliegue**.
- **Idioma de trabajo:** el usuario habla español; commits e identificadores de código en inglés. Regla explícita: **commits sin `Co-Authored-By`**, simples.
- **El usuario pidió una funcionalidad nueva** que aún no especificó: preguntar al retomar.

## 2. Estado actual exacto

| Área | Estado |
|---|---|
| Núcleo DLL + tests | Cerrado |
| Reproductor completo (motor, cola, bucles, aleatorio, crossfade, A–B, karaoke, timer, salida de audio) | Cerrado |
| Biblioteca + importación + metadatos + CRUD | Cerrado |
| Playlists múltiples (varias listas dobles) + DnD + undo/redo | Cerrado |
| Persistencia IndexedDB (biblioteca+blobs, playlists, sesión) | Cerrado |
| UI Hi-Fi clara + vinilo 2D con portada completa + tema dinámico por portada | Cerrado |
| i18n ES/EN/PT | Cerrado |
| Accesibilidad WCAG 2.2 AA + panel | Cerrado |
| Legal (privacidad, términos, cookies, accesibilidad) + consentimiento granular | Cerrado |
| PWA offline (service worker en producción) | Cerrado |
| Fuentes: Spotify (PKCE + previews + **Web Playback SDK Premium**), Audius, Jamendo con toggles | Cerrado |
| E2E Playwright (smoke, persistencia, regresión bug #12) | Cerrado |
| **Despliegue AWS** | **Pendiente (Día 4)** |
| **Nueva funcionalidad del usuario** | **Pendiente de definir** |
| Post-entrega: jam/shared, ACRCloud, Demucs, Google IdP, sync, cuotas | Diseñado/documentado |

Issues de GitHub: #1–#22 y #34–#38 cerrados; #23–#27 (Día 4) y #28–#33 (post) abiertos; **#36 (jam) abierto** con diseño en `docs/JAM.md`. Las tareas #39–#42 (rediseño, fuentes, SDK) se hicieron sin issue propio.

## 3. Repositorio y flujo

- **Repo privado:** https://github.com/Jenifrutica/legato
- **Local:** `/home/jenifrutica/Proyectos/legato`
- **Cuenta gh autenticada:** Jenifrutica. git: `JeniFedora` / `jenifer.urbano@campusucc.edu.co`.
- **Flujo:** commits en inglés, mensajes tipo `feat(scope): ...`, `fix(scope): ...`, `docs: ...`. **Nunca `Co-Authored-By`.** Push a `main` directo. Verificar con `bun run format && bun run typecheck && bun run lint && bun run test` antes de commitear.
- El usuario pidió commits en inglés a mitad del proyecto (los primeros están en español; ya no).

## 4. Entorno de la máquina

| Herramienta | Detalle |
|---|---|
| Bun | 1.4.2 en `~/.bun/bin/bun` (no está en PATH de shells no-login: usar ruta completa o `export PATH="$HOME/.bun/bin:$PATH"`) |
| AWS CLI | v2.37.9 en `~/.local/bin/aws` |
| Credenciales AWS | `~/.aws/credentials` (chmod 600), usuario IAM `reproo`, cuenta `793452510776`, región `us-east-1` |
| Skills de diseño | Instaladas con `npx skills`: emilkowalski (animate, review-animations, improve-animations, emil-design-eng, apple-design, break-ui, etc.), taste (design-taste-frontend, high-end-visual-design, minimalist-ui, etc.) e **impeccable 4.5.0** (script en `~/.config/opencode/skills/impeccable/scripts/impeccable`, detector: `impeccable detect --json <archivos>`). Actualizar: `npx -y skills update -g -y` |
| Obsidian | Vault activo: `/home/jenifrutica/Downloads/asas` (Flatpak `md.obsidian.Obsidian`) |
| Playwright | Chromium instalado en `~/.cache/ms-playwright` |
| Otros | Node 24 vía nvm, `gh` 2.97, Postman, Spotify desktop |

**Comandos clave:**

```bash
cd /home/jenifrutica/Proyectos/legato

# Desarrollo (obligatorio 127.0.0.1 si se va a usar Spotify)
~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort

# Si la UI queda en blanco tras agregar archivos (caché HMR de Vite):
#   matar el proceso del puerto 5173, rm -rf node_modules/.vite, reiniciar.
# No afecta al build de producción.

~/.bun/bin/bun run test        # 313 unitarios
~/.bun/bin/bun run test:e2e    # 13 E2E (modo local, puerto 5174; levanta el server solo)
~/.bun/bin/bun run build       # build producción
~/.bun/bin/bun run preview     # probar PWA/offline (SW solo en prod)
~/.bun/bin/bun run typecheck   # tsc -b
~/.bun/bin/bun run lint        # oxlint (Vite 8 usa oxlint, no ESLint)
~/.bun/bin/bun run format      # prettier
```

## 5. Credenciales y cuentas

- **Spotify Client ID:** `af94497d2dfc4354ab14d27a9c1a8ee0` (público). Redirect URIs registradas en el dashboard: `http://127.0.0.1:5173` y `https://app.jenilarper.dev`. **`localhost` NO está permitido por Spotify** (solo IP loopback). Scopes: streaming, user-read-email, user-read-private, user-read-playback-state, user-modify-playback-state, playlist-read-private. El usuario tiene **Premium**.
- **Jamendo Client ID:** `6a0833bd`. El **Client Secret no se usa** (la API pública solo necesita client_id) y no debe guardarse ni compartirse.
- **Audius:** sin credenciales.
- **AWS access key:** fue compartida por chat → **rotar/desactivar al terminar la entrega** (issue #27). Vive solo en `~/.aws/credentials`.
- **Google Cloud / Cognito IdP:** diferido (la cuenta AWS actual no permite Cognito por SCP).
- Archivo real con las variables: `.env.local` (gitignored). Plantilla: `.env.example`.

```
VITE_LOCAL_MODE=true
VITE_SPOTIFY_CLIENT_ID=af94497d2dfc4354ab14d27a9c1a8ee0
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173
VITE_JAMENDO_CLIENT_ID=6a0833bd
```

## 6. AWS (para el Día 4)

- **La cuenta tiene una SCP que bloquea:** Cognito, Amplify, Lambda, DynamoDB. **Permitidos:** S3, CloudFront, ACM, Route 53, EC2, IAM.
- **Ruta de despliegue decidida:** frontend estático en **S3 privado + CloudFront + certificado ACM en `us-east-1`** (no Amplify). `app.jenilarper.dev` como CNAME en name.com.
- Plan gratuito AWS 2026: **$200 en créditos por 6 meses**; la cuenta se cierra al agotarlos o a los 6 meses (salvo pasar a Paid). Alerta de presupuesto de $1 ya creada.
- **Pasos Día 4:** `bun run build` → bucket S3 privado → subir `dist/` → ACM (validación DNS) → CloudFront con OAC + dominio alterno + error 403/404 → `/index.html` 200 (SPA) → CNAMEs en name.com (**pestaña DNS Records**, no nameservers) → verificar HTTPS. `sw.js` y `manifest.webmanifest` con `Cache-Control: no-cache`.
- Detalle completo en `docs/DESPLIEGUE.md`.

## 7. Dominio

- **Dominio propio:** `jenilarper.dev` (comprado en name.com; se administra en https://www.name.com/account/domain → pestaña **DNS Records**).
- Subdominio de entrega: **`app.jenilarper.dev`**.
- `legato.dev`, `legato.app`, `legato.fm` están ocupados; no hay dominios gratis registrables. AWS no regala dominios.

## 8. Arquitectura (real, en el repo)

```
src/
├─ core/doubly-linked-list/     # DoublyLinkedList<T> a mano + tests (0 dependencias)
├─ player/
│  ├─ engine.ts                 # HTMLAudioElement + AudioLike testeable (load/play/seek/rate, Media Session)
│  ├─ queue.ts                  # PlaybackQueue sobre DLL (next/prev, bucles, shuffle con playOrder, move, structure)
│  ├─ controller.ts             # orquesta cola+motor: transiciones con crossfade, A–B, karaoke, balance, timer hooks
│  ├─ audio-graph.ts            # Web Audio: splitter → gains L/R → merger → analyser → salida; balance/canales/karaoke
│  ├─ player-store.ts           # Zustand singleton del reproductor (incluye timer, salida de audio)
│  ├─ sleep-timer.ts            # 15/30/45/60/90 min, fin de canción, N canciones; fade-out al expirar
│  ├─ output-devices.ts         # setSinkId (Chromium)
│  └─ types.ts                  # QueueTrack, LoopMode, ChannelMode, StructureNode
├─ features/
│  ├─ auth/                     # AuthProvider (local | Cognito PKCE), contexto y chip de cuenta
│  ├─ library/                  # LibraryTrack, TrackLibrary (DLL), importAudioFiles (music-metadata), format, store
│  ├─ playlists/                # PlaylistCollection (varias DLL), store con historial
│  ├─ persistence/              # Dexie/IndexedDB: songs (blob), playlists, session; hidratación y autosave
│  ├─ history/                  # CommandStack (dos DLL) + store; undo/redo de operaciones de playlists
│  ├─ a11y/                     # preferencias y panel (texto, dislexia, contraste, movimiento, daltonismo, controles)
│  ├─ i18n/                     # i18next ES/EN/PT tipado
│  ├─ legal/                    # documentos, consentimiento de cookies, páginas hash #/legal/*
│  ├─ theme/                    # extracción de paleta de la portada + tema dinámico global con contraste AA
│  └─ sources/                  # proveedores: spotify (PKCE+SDK), audius, jamendo, store de toggles, búsqueda, UI
├─ ui/                          # TopBar, Hero, VinylVisual, WaveRing/Bars, PlayerBar, MobileNav, RightPanel,
│                               # LibraryPanel, HistoryButtons, PracticePanel, TimerPanel, AudioQualityPanel,
│                               # StructureView, SpotifyBanner, TransportButton, icons
├─ app/App.tsx                  # shell: TopBar + Hero + RightPanel + PlayerBar móvil + banners/paneles
├─ styles/index.css             # Tailwind v4 (@theme), tokens, sliders, a11y, tema de álbum
└─ main.tsx                     # render + handleSpotifyRedirect + hidratación + registro SW (prod)
tests/e2e/                      # Playwright: fixtures, smoke, dnd (regresión #12)
public/                         # favicon.svg, manifest.webmanifest, sw.js
docs/                           # ver §19
```

## 9. Núcleo académico (lo que más pesa en la rúbrica)

- `DoublyLinkedList<T>` implementada **a mano** (punteros `prev/next`, `head/tail/length`), sin arrays internos. Operaciones: prepend/append/insertAt/removeFirst/Last/At/Node, find/nodeAt/indexOf/contains, moveNode/swapNodes/reverse, iteradores bidireccionales, forEach/toArray/clear. Invariantes testeadas + **property-based con fast-check**.
- **Bug #12 (crítico):** el reproductor guarda **`currentNode` como puntero, nunca índice**. Si suena A y arrastras C a la posición 1, sigue sonando A y `next()` va a la que ahora es 2. Cubierto por tests unitarios, de cola y **E2E real con drag de ratón**.
- **Aleatorio:** lista doble paralela `playOrder` + historial; apagarlo vuelve al orden original desde el nodo actual.
- **Undo/redo:** `CommandStack` con dos listas dobles; snapshots antes/después de playlists; atajos Ctrl/Cmd+Z y Ctrl/Cmd+Shift+Z.
- **Modo estructura:** visualizador en vivo de nodos/prev/next con el nodo sonando resaltado (pestaña Estructura en el panel de biblioteca/playlist).

## 10. Reproductor (comportamiento actual)

- **Motor:** HTMLAudioElement; `Media Session`; velocidad 1/0.9/0.75/0.5; bucles none/all/one; aleatorio; historial.
- **AudioGraph (Web Audio):** source → splitter → gains L/R → merger → analyser → salida. Da: **balance L/R** (potencia constante), **aislamiento de canales** (estéreo / solo L / solo R / mono), **karaoke M/S** (L−R) y el analizador para ondas.
- **Crossfade:** por defecto **2 s**, rango 0–12 s, fade-out/fade-in secuencial (sin solape; el solape real con doble deck es post-entrega). Se guarda en la sesión.
- **Temporizador:** presets de minutos, fin de canción, N canciones; **fade-out de 2.5 s** antes de pausar.
- **A–B loop:** marcar A, marcar B (B>A), salto automático, se limpia al cambiar de canción.
- **Salida de audio:** selector con `setSinkId` donde exista (Chromium); fallback silencioso.
- **Duración en streams:** si el motor no reporta duración, se usa la de los metadatos (arreglo reciente).
- **Calidad premium:** panel con codec, muestreo, bitrate, canales, tamaño; balance; canales; salida.

## 11. Persistencia y sesión

- **IndexedDB (Dexie):** `songs` (metadatos + **blob** + artwork), `playlists` (orden como `trackIds[]`), `session`.
- Al arrancar: `hydrateStores()` reconstruye biblioteca, playlists y **reanuda la sesión** (canción, posición, volumen, velocidad, bucle, aleatorio, balance, canal, crossfade) sin autoplay.
- Autosave por suscripción con debounce; `pagehide` guarda la sesión. Guardas si no hay `indexedDB`.
- Tests con `fake-indexeddb`.

## 12. UI/UX, accesibilidad, i18n, legal, PWA

- **Diseño "Hi-Fi vivo" claro (nunca oscuro):** top bar sticky; **héroe con vinilo 2D a la izquierda con la portada como disco completo (sin recorte)** girando al reproducir, ondas, título gigante, artista·álbum, progreso y transporte completo (shuffle, prev, play, next, repeat, 1x, ensayo, timer, volumen). Panel derecho con pestañas **Biblioteca · Buscar · Playlists · Cola · Audio**. Móvil: vinilo arriba, barra mini + nav inferior.
- **Tema dinámico por portada en toda la interfaz:** paleta extraída de la carátula (canvas, clusters), aplicada a variables `--album-*` → tokens; **contraste AA garantizado** (`ensureContrast`); el modo alto contraste de a11y gana sobre el tema; transición suave. Sin portada → etiqueta neutra.
- **i18n:** ES/EN/PT tipado (i18next + CustomTypeOptions). Selector en top bar y móvil.
- **Accesibilidad:** panel con tamaño de texto 100–200 %, OpenDyslexic, alto contraste, reducir movimiento, daltonismo, controles grandes; skip-link; foco visible; axe-core sin violaciones; declaración con correo de contacto.
- **Legal:** `#/legal/privacy|terms|cookies|accessibility` en 3 idiomas; **consentimiento granular de cookies** con versión (`legato.consent`); sin analítica ni rastreadores.
- **PWA:** `manifest.webmanifest` + `sw.js` (app shell) registrado **solo en producción**; biblioteca/sesión offline por IndexedDB.
- **Rendimiento:** los canvas de ondas **solo animan al reproducir, a 30 fps**, se detienen si la pestaña está oculta o el canvas no se ve; sin `backdrop-blur`; `will-change` en el disco. (Arreglado tras reporte de trabones.)

## 13. Fuentes de música (`src/features/sources`)

- **Ajustes (⚙):** toggles por proveedor + estado + **Conectar Spotify**.
- **Por defecto: solo Spotify activo**; Audius y Jamendo apagados (se activan en Ajustes). Clave de persistencia: `legato.sources.v2`.
- **Spotify:** OAuth **PKCE** (sin secret; redirect `http://127.0.0.1:5173`), búsqueda + previews 30 s, y **Web Playback SDK** para reproducción completa Premium. Al reproducir completo: se pausa nuestro motor y aparece el **banner de Spotify** (progreso, play/pausa, prev/next, salir). El audio de Spotify **no pasa por nuestro DSP** (balance/karaoke/velocidad/crossfade no aplican ahí).
- **Audius:** streaming completo gratis (host discovery `https://api.audius.co`), sin credenciales; se puede **guardar en la biblioteca**.
- **Jamendo:** API v3 con client_id; streaming completo y **guardar** si la licencia lo permite.
- **Búsqueda:** `searchAll` con timeout de 8 s por proveedor (no se cuelga si uno falla); resultados con botón ▶ (preview/local) y botón verde (Spotify completo) o ⬇ (guardar).
- **Limitación conocida a verificar:** streams cross-origin a través del `MediaElementSource` pueden quedar en silencio si el servidor no manda CORS. Si pasa, opciones: `audio.crossOrigin='anonymous'` o bypass del grafo para URLs externas.

## 14. Testing

- **Unitarios (Vitest + jsdom + fake-indexeddb):** 154 en verde. Cubren DLL (borde + property-based), cola, controlador (crossfade, A–B, karaoke, restore), biblioteca/import, playlists/historial, persistencia, tema (contraste), fuentes (mocks de fetch), i18n, a11y store, legal.
- **E2E (Playwright, `tests/e2e`):** 4 en verde — carga/consentimiento/idioma/legales, undo/redo de playlists, **regresión #12 con drag real**, persistencia al recargar. El webServer reusa el dev server si está corriendo.
- **Calidad:** typecheck + oxlint + Prettier + build en verde en cada commit. Detector de impeccable sin hallazgos en los archivos de UI.
- **Quirk:** al agregar archivos nuevos con el dev server corriendo, Vite puede servir un módulo stale ("does not provide an export named X") → **reiniciar el server** y `rm -rf node_modules/.vite`. Solo desarrollo.

## 15. Decisiones clave (resumen; completo en `docs/DECISIONES.md`, D01–D42)

- TypeScript + React + Vite + Tailwind + **Bun**; repo simple modular (no monorepo).
- Lista doble a mano; `currentNode` por puntero (bug #12).
- Persistencia local-first; sync S3+DynamoDB post-entrega (LWW).
- Login: perfil local en el MVP; Cognito implementado y listo (bloqueado por SCP). Google IdP diferido.
- Despliegue S3+CloudFront+ACM (Amplify bloqueado). Dominio `app.jenilarper.dev`.
- Sin analítica; cookies esenciales con consentimiento granular.
- Crossfade secuencial; salida de audio setSinkId; PWA offline en producción.
- Jam/shared playlists: post-entrega, diseño en `docs/JAM.md` (sincroniza control, nunca audio).
- Rediseño: tema dinámico por portada en toda la UI, vinilo 2D (el 3D con R3F se implementó y **se retiró por decisión del usuario**; three.js desinstalado).
- Fuentes: Spotify por defecto, Audius/Jamendo conmutables; Spotify full playback con SDK Premium.

## 16. Pendientes y próximos pasos

1. **Nueva funcionalidad pedida por el usuario** (sin especificar aún): preguntar y planificar.
2. **Día 4 (despliegue):** pulir UI, responsive fino, deploy S3+CloudFront con `app.jenilarper.dev`, README/demo finales, **rotar la access key** (issue #27).
3. **Verificaciones:** reproducción Spotify SDK completa end-to-end (Premium), posible silencio CORS en streams externos, E2E de búsqueda/proveedores (no existe aún).
4. **Post-entrega:** jam + playlists compartidas (#36), ACRCloud (#30), Spotify metadata avanzada (#31), Demucs (#32), Google IdP (#29), sync (#28), cuotas (#33).

## 17. Problemas conocidos / riesgos

- **SCP de AWS** limita el backend; el deploy es estático.
- **CORS en audio externo** (ver §13) puede silenciar Audius/Jamendo en el grafo; verificar en el navegador del usuario.
- **Vite stale HMR** (§14): reiniciar server, no afecta producción.
- **Cuenta AWS free plan** se cierra sola a los 6 meses/agotar créditos.
- **Access key expuesta** en chat: rotar antes de terminar.
- Spotify: SDK requiere Premium y navegador con DRM; Safari parcial.

## 18. Preferencias del usuario (respetar)

- Español; respuestas claras y directas; commits en inglés y **sin co-authored**.
- **Nada oscuro en la interfaz**, estética premium (vinilo, ondas, profundidad), nada genérico.
- El vinilo debe mostrar la portada y **no recortarse**; la interfaz se tiñe con los colores del álbum.
- Validar absolutamente todo (tests + revisión); documentar todo.
- Le importa que "no se rompa" cuando lo exploten en la demo.
- Tiene Spotify Premium y dominio propio; quiere AWS capa gratuita.
- Al final de cada bloque: probar en local antes de seguir.

## 19. Mapa de documentación del repo (`docs/`)

`PLAN.md` (4 días), `DECISIONES.md` (D01–D42), `ARQUITECTURA.md`, `ESTRUCTURA-DATOS.md` (DLL + bug #12), `FUNCIONALIDADES.md` (MVP/extra/post), `UI-UX.md`, `ACCESIBILIDAD.md`, `LEGAL.md`, `TESTING.md`, `DESPLIEGUE.md`, `ENTORNO.md`, `JAM.md` (post-entrega), `ESTADO.md` (tablero vivo), **`CONTEXTO-COMPLETO.md` (este)** y **`PROMPT-NUEVA-SESION.md`**.

## 20. Prompt listo para una sesión nueva

Ver `docs/PROMPT-NUEVA-SESION.md` (copiar y pegar tal cual). Resumen: pedirle que lea este archivo, verifique el estado (tests/build), arranque el dev server en `127.0.0.1`, y pregunte por la nueva funcionalidad antes de planificar; recordar las reglas (commits en inglés sin co-authored, nada oscuro, portada en el vinilo, validar todo, documentar).

---

## Actualización — sesión 2 (misma fecha, tarde)

Cambios aplicados después del primer handoff (commit siguiente a `dc40927`):

- **Paleta nueva**: violeta `#6c4cff` + teal `#00a8b5` sobre fondo frío `#f1f3f9` (adiós crema/terracota). **Modo oscuro opcional** (botón sol/luna en la barra; clase `theme-dark`; persistido en `legato.theme`; el tema por portada tiene variantes oscuras `--album-dark-*`).
- **Vinilo**: 2D, más grande, sangrando por la izquierda y mostrando ~1/4 del círculo; la portada sigue siendo el disco completo.
- **Ondas**: barras con gradiente violeta→teal y anillo más grueso; **siempre animadas** (movimiento sintético cuando el analizador no tiene datos, p. ej. Spotify; reales al reproducir local). 30 fps, se detienen con la pestaña oculta.
- **Layout**: fila de controles del héroe con `flex-wrap` y anchos contenidos; panel derecho con `relative z-20 bg-bg` para que nunca se superponga.
- **Spotify diagnóstico**: `searchSpotify` ahora lanza errores (no los traga); `searchAll` devuelve `{ tracks, errors }` con timeout por proveedor; la pestaña Buscar muestra el error por proveedor; Ajustes tiene **Probar conexión** (`getSpotifyProfile` → `/v1/me` con nombre y plan). Si el usuario "conectó pero no ve canciones", ahora verá el motivo exacto (401/403/timeout/sin sesión).
- **Búsqueda → playlists**: selector "Agregar a…" en cada resultado descargable (guarda y agrega), opción "＋ Nueva playlist…" (prompt de nombre) y **drag & drop nativo** de resultados Audius/Jamendo sobre las playlists (pestaña Playlists). Helper: `src/features/sources/save-track.ts`.
- Todo verificado: 154 unit + 4 E2E + build. Dev server: reiniciar limpio tras agregar archivos (`rm -rf node_modules/.vite`).

### Corrección importante de Spotify (misma sesión)

- **HTTP 400 en búsqueda**: Spotify cambió en feb 2026 el máximo de `limit` en `GET /v1/search` de 50 a **10**. Enviábamos `limit=20` → 400. Corregido a `limit=10`.
- Los errores de la API ahora incluyen el **mensaje del cuerpo** (`HTTP <status>: <message>`) y se muestran por proveedor en la pestaña Buscar.
- `GET /me` ya no devuelve `product` (cambio feb 2026); "Probar conexión" muestra solo el nombre.
- Vinilo: ahora **~3/4 visible** (lg: `-left-[11rem] w-[44rem]`, xl: `-left-[12rem] w-[48rem]`), contenido desplazado a `ml-[34rem]/ml-[37rem]`.
- Ondas: reaccionan a los **bajos** (pulso global calculado con los primeros bins) y al espectro; alrededor del disco visible; sintéticas cuando no hay datos del analizador.

### Correcciones de UI/UX (sesión 2, tanda 3)

- **Sin superposiciones**: el héroe se apila debajo de `xl`; el sangrado del vinilo solo aplica en `xl+`; el contenido nunca invade el panel derecho (`min-w-0`, `overflow-x-hidden`, panel con `z-20 bg-bg`).
- **Disco sin cortes**: tamaño acotado por altura (`xl:w-[min(44rem,70dvh)]`) y sin recorte vertical.
- **Ondas solo en el disco**: se eliminaron las ondas de la barra (WaveBars ya no se usa); el anillo rodea el disco visible y reacciona a los bajos + espectro (sintético sin datos).
- **Tema por portada también para pistas online**: `useAlbumTheme` ahora usa `currentTrack.artworkUrl` (antes buscaba en la biblioteca y Spotify/Audius/Jamendo no tenían tema).
- **Controles conscientes de Spotify**: con playback del SDK activo, play/pausa, anterior/siguiente, progreso y seek en héroe y barra móvil controlan Spotify.
- **Agregar a playlists / listas dobles**: filas de la biblioteca arrastrables a las playlists; resultados de búsqueda con "Agregar a…", "＋ Nueva playlist…" y drag & drop. Todo pasa por `PlaylistCollection` (append/moveNode sobre la DLL). El modo Estructura visualiza los nodos.

### Correcciones de UI/UX y audio (sesión 2, tanda 4)

- **Audio cross-origin**: `audio.crossOrigin = 'anonymous'` para que previews de Spotify y streams de Audius/Jamendo suenen a través del grafo Web Audio (causa probable de botones "muertos": el elemento sonaba en silencio o `play()` fallaba). Los errores del motor ahora se guardan en el snapshot (`error`) y se muestran en el héroe.
- **Giro del disco**: `VinylVisual` ahora escucha el playback del SDK de Spotify; gira también con Spotify y usa su portada.
- **Ondas más exageradas y de color**: anillo con longitud ×1.6, grosor 4 y color HSL rotando en el tiempo + pulso de bajos.
- **Controles en dos filas**: transporte arriba; velocidad/ensayo/timer/volumen abajo → el volumen ya no se sale ni se superpone.
- **E2E ampliado**: se verifica play → "Pausar" → pausa → "Reproducir" con una pista importada (los 4 E2E en verde).

### Audio de streaming con dos elementos (sesión 2, tanda 5)

- **Causa raíz de "No se pudo reproducir el audio"**: el audio externo (previews de Spotify, streams Audius/Jamendo) no manda CORS, y un elemento enrutado por `MediaElementSource` no puede sonar en esas condiciones. Solución: **dos elementos de audio** en `player-store`: `audio` (local, pasa por `AudioGraph` con balance/karaoke/analizador) y `streamAudio` (directo, sin grafo). `PlayerController` elige motor por canción (`blob:`/mismo origen → local; externo → stream) y pausa el otro. Tests siguen pasando (con un solo audio, ambos motores son el mismo).
- El analizador solo recibe audio local; para streaming las ondas usan movimiento sintético.
- Disco más grande (`xl:w-[min(48rem,78dvh)]`, sin cortarse) y con glow del color del álbum; tema mucho más notorio (fondo/paneles teñidos + halo en `body` con `--album-glow-soft`); ondas con glow y color HSL rotando; botones más grandes/obvios (play 56px, resto 40px, tooltips); héroe con padding inferior para que la barra fija no tape contenido.

### Streaming de Spotify y ondas con paleta (sesión 2, tanda 6)

- **Previews fallan con frecuencia** (CORS/404 en el CDN): el botón ▶ de resultados Spotify ahora usa **reproducción completa del SDK** si hay sesión conectada; si no, avisa que conectes Spotify. El botón verde se mantiene.
- **Ondas con la paleta del álbum**: `WaveRing` lee `--color-primary` y `--color-accent` (ya teñidos por la portada) cada ~1s y pinta alternando esos colores con glow. Ya no rota el tono libre.
- **Ondas sin corte**: en `xl` (disco sangrando) se dibuja solo el arco derecho visible (`arc="right"`); en pantallas menores el anillo completo.
- **Barra**: padding inferior del héroe aumentado (`pb-40 lg:pb-28`) para que nada quede bajo la barra fija.

### Responsive, tema con Spotify y documentación (sesión 2, tanda 7)

- **Una sola barra de reproducción por vista**: en móvil el héroe ya no muestra progreso ni controles (los maneja la barra inferior); el **banner de Spotify** solo aparece en estados `connecting`/`error` (la reproducción se controla desde el héroe en escritorio y la barra en móvil). Antes había hasta tres barras duplicadas.
- **Disco a media pantalla en móvil/responsive**: el vinilo se recorta mostrando su mitad superior (contenedor `h-40/52` con `overflow-hidden`); en `xl` vuelve el disco grande con sangrado y arco de ondas derecho.
- **Tema por portada también con Spotify**: `useAlbumTheme` ahora usa la portada del playback del SDK cuando está activo (antes solo miraba el reproductor local y Spotify nunca teñía la UI).
- **Ondas**: leen la paleta del álbum (`--color-primary`/`--color-accent`) y usan un pulso de **beat** sintético cuando no hay datos del analizador (Spotify no pasa por el grafo), para que se sienta rítmico.
- **Documentación nueva**: `docs/MUSICOS.md` (funciones para músicos, estado y especificación completa) y `docs/AUTH.md` (login: perfil local activo, Cognito/Google pendientes y pasos para activarlos).

### Responsive fino (sesión 2, tanda 8)

- **Disco en móvil/tablet**: ahora se ve la **mitad inferior** (`clipPath: inset(50% 0 0 0)` en el disco, con margen negativo para alinear); las **ondas no se recortan** (el clip es solo al disco, el anillo se dibuja por encima de la sección).
- **Título**: `break-words` + tamaños responsivos (`text-3xl sm:text-4xl 2xl:text-5xl`) para que no se corte contra el panel.
- **Responsive por secciones**: móvil (disco mitad inferior + sin controles en héroe), `lg` (disco completo centrado, controles visibles), `xl` (disco grande sangrando con arco derecho de ondas).
- **Barra móvil**: padding inferior del héroe a `pb-48` para que la barra + nav fija no tape el panel.

### Layout final (sesión 2, tanda 9)

- **Disco completo siempre** (se quitó el recorte de mitad; girando se veía feo).
- **Ondas contenidas en el héroe** (padding vertical en el bloque del disco) para que no invadan el contenido inferior.
- **Footer movido al final real de la página** (después del grid, antes de la barra fija); ya no aparece a mitad de página robando espacio.
- **Héroe más compacto** (sin min-height en móvil) y contenido xl limitado con `xl:max-w-[calc(100%_-_35rem)]` para no desbordar sobre el panel.
- **Panel con `pb-52`** en móvil para que la barra fija + navegación no tapen resultados ni el botón de playlists; estado vacío de Playlists ahora con botón "Nueva playlist".

---

# ⚠️ PRIORIDAD NÚMERO 1 PARA LA NUEVA SESIÓN: REDISEÑAR TODA LA INTERFAZ

> El usuario considera que **la interfaz actual está fea**. No es un ajuste: es un **rediseño completo**. Todo lo funcional se conserva; la capa visual se rehace.

## Estado al cierre de la sesión 2

- **Funcionalidad completa y estable**: 154 tests unitarios + 4 E2E en verde, typecheck/lint/build OK.
- **Reproductor**: local (Web Audio con balance/karaoke/analizador) y streaming (elemento directo para Spotify/Audius/Jamendo). Spotify: PKCE + previews + SDK Premium; tema dinámico por portada (incluye Spotify).
- **Listas dobles**: núcleo, playlists, DnD, undo/redo, modo Estructura — todo funcionando.
- **Pendientes funcionales**: nueva funcionalidad que el usuario aún no especificó; Día 4 (deploy S3+CloudFront + rotar access key); verificación fina del SDK de Spotify; músicos (docs/MUSICOS.md); login Cognito/Google (docs/AUTH.md).
- **Servidor de desarrollo**: `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` (Spotify exige 127.0.0.1). Tras agregar archivos: reiniciar y borrar `node_modules/.vite` (caché HMR de Vite).

## Qué está feo (feedback concreto acumulado del usuario)

1. **Composición general pobre**: mucho espacio desperdiciado, secciones que no dialogan, footer que aparecía a mitad de página (ya movido al final, pero la sensación general sigue).
2. **Vinilo**: el recorte a media circunferencia en móvil se veía mal (se volvió a disco completo); el sangrado/posición y el tamaño no convencen; el giro y el brazo son básicos.
3. **Ondas**: recortes, se salían de la sección o quedaban tapadas; color y ritmo aún no sorprenden. Deben rodear el disco, usar la paleta del álbum y sentirse musicales.
4. **Barras duplicadas y superposiciones** en responsive (se iteró mucho: una barra por vista, panel con `z-20`, `pb-52`, contenido xl acotado — pero la sensación sigue siendo frágil).
5. **Slider de volumen**: posición y aspecto poco intuitivos.
6. **Botones**: poco claros/jerarquía débil (se agrandó el play, tooltips, hover — insuficiente).
7. **Tema por portada**: funciona pero es sutil; el usuario quiere un cambio **mucho más notorio** con detalles (halo, superficies, tipografía, texturas).
8. **Paleta violeta/teal actual**: no convence; el usuario sugirió antes "otra paleta" y aceptó modo oscuro opcional.
9. **Playlists** deben sentirse como la funcionalidad estrella (listas dobles): agregar desde búsqueda, crear, drag & drop, visualización de la estructura.

## Cómo atacarlo en la nueva sesión (recomendado)

1. **Usar impeccable como manda su flujo** (no solo el detector): `impeccable context` → leer `reference/new-work.md` → **ronda de dirección con el usuario** (el usuario elige entre 2-3 direcciones con composición, no solo color) → escribir el *direction contract* en el surface brief → construir → `impeccable detect` → revisión final con capturas (Playwright ya está instalado).
2. Apoyarse en las skills instaladas: `high-end-visual-design`, `design-taste-frontend`, `emil-design-eng`, `animate`, `review-animations`, `minimalist-ui`, `apple-design`, `break-ui`.
3. **Preguntar antes de construir**: mostrar 2-3 direcciones visuales concretas (con paleta, tipografía, composición del héroe, estilo del vinilo/ondas) y que el usuario elija. No volver a iterar a ciegas.
4. **Checklist de pantallas a rediseñar**: héroe (vinilo + título + controles), barra superior, barra inferior/móvil, panel derecho (Biblioteca/Buscar/Playlists/Cola/Audio), páginas legales, paneles de Ajustes/Accesibilidad, estado vacío, responsive 390/768/1024/1280/1440.
5. Mantener: tokens en CSS variables, contraste AA, i18n ES/EN/PT, a11y (axe sin violaciones), una sola barra por vista, sin superposiciones, rendimiento (canvas a 30fps, sin blur costoso).
6. **No romper los tests**: 154 unit + 4 E2E deben seguir en verde; los E2E usan selectores por `aria-label` (Reproducir/Pausar/Siguiente, Reordenar X, Agregar X a una playlist, pestañas, etc.). Si se renombran controles, actualizar `tests/e2e`.

---

## Sesión 3 (3 oct 2026) — rediseño decidido y arrancado

### Nueva funcionalidad definida: Cápsula nostálgica

La autora especificó la funcionalidad pendiente: un **carrusel interactivo tipo historias efímeras** en la pantalla principal (burbujas animadas que abren un visor vertical a pantalla completa, o popup siempre presente). Presenta a diario una cápsula de **3–5 tarjetas** que combinan el arte del álbum con un **fondo degradado dinámico**, **barra de progreso temporizada de 15 s** y reproducción automática de un **fragmento clave** (desde el segundo 30 o el coro). DTOs: objeto contenedor con fecha, id de usuario, expiración y arreglo de diapositivas; cada diapositiva lleva metadatos de la pista (título, artista, álbum, carátula, URL del fragmento), punto de inicio, **etiqueta de contexto** («Hace 1 año», «Obsesión olvidada») y texto evocador con métricas pasadas; en la interfaz: mantener presionado para pausar, reproducir la canción completa en la cola y guardar en favoritos. **Se implementa después del rediseño (F11)**; el rediseño reserva su carril de burbujas en el héroe.

### Dirección visual elegida: **Duotono 62**

Tras el flujo de impeccable (`context` → `new-work` → roll `concept-seed --scope direction --mode operate`, semilla `b6f5b18f` → cuatro comps), la autora eligió **Duotono 62**: edición musical impresa a dos tintas (papel hueso, tinta negra y una tinta directa derivada de la portada). Refinamientos pedidos por la autora e incorporados: **tintas adaptadas a la portada**, **ondas de líneas planas estilo tipográfico saliendo del disco** y **panel de músicos/partitura como slide-over con pestaña arrastrable, minimizable/maximizable** (solo para quien explora). Se descartaron A (Círculo armónico), C (Partitura) y D (Dos tintas); la notación de C vive dentro del panel de músicos de Duotono.

- Plan, paleta, tipografías y validación: **`docs/REDISENO.md`**.
- Contrato de dirección: `.impeccable/surfaces/src-app-app-tsx.md`.
- Comp aprobado: `.impeccable/mocks/decision/b-duotono.png` + sidecar con `"approved": true`; `buildPath: comp` en `.impeccable/config.json`.
- Comps construidos como mocks HTML locales capturados con Playwright (la key de OpenAI estaba vencida, error 401); previsualizaciones en `.impeccable/mocks/mockups/`.

### Fases

F0 tokens y fuentes · F1 shell/barra · F2 héroe y vinilo · F3 ondas de líneas · F4 panel + partitura slide-over · F5 barras móvil · F6 playlists estrella · F7 letras (diseño) · F8 responsive 390/768/1024/1280/1440 · F9 vacíos/oscuro/legales/a11y · F10 validación, docs y commits · F11 Cápsula nostálgica · F12 conexión de letras (LRCLIB + etiquetas/.lrc).

- Reglas que se mantienen: claro por defecto (oscuro opcional), portada completa en el disco (**círculo completo posicionado, nunca `clip-path`**), UI teñida por el álbum, una sola barra por vista, cero superposiciones, 154 unit + 4 E2E en verde, typecheck/lint/build, axe sin violaciones, commits en inglés sin `Co-Authored-By` y push a `main` por bloque verificado.
- **Documentar cada tanda** en `docs/ESTADO.md` y en este archivo.
- La **key de OpenAI** de `.bashrc` está vencida; si se quiere volver a generar comps con IA, hay que reemplazarla. No es necesaria para el plan.
- No desplegar hasta que la autora lo pida; rotar la access key antes de terminar la entrega.

### Cierre del rediseño (misma sesión 3)

- **F0–F10 cerradas**: tokens Duotono, shell/barra, héroe con media luna, vinilo con portada completa, ondas de líneas, panel + partitura slide-over, barras móvil, playlists estrella, letras diseñadas (bandera `legato.lyrics.demo`), responsive 390/768/1024/1280/1440, oscuro conmutable, vacíos y accesibilidad.
- **Verificación final:** 154 unit + 4 E2E en verde, typecheck/lint/build OK, **axe 0 violaciones** (claro/oscuro/390/legales) y `impeccable detect` en `[]`.
- **Documentación de diseño:** `DESIGN.md` en la raíz (spec con frontmatter de tokens) y `.impeccable/design.json`.
- **Pendiente inmediato:** Día 4 (deploy S3 + CloudFront + rotar la access key) y verificación fina del SDK de Spotify; futuras: jam (#36), ACRCloud (#30), Demucs (#32), Google IdP (#29), sync (#28). Día 4 sigue en pausa hasta pedido explícito.
- **F11 Cápsula nostálgica cerrada** (issue #49): carrusel diario tipo historias en el héroe; DTOs, registro local de escuchas, generador determinista, visor con 15 s por tarjeta, fragmento desde ~30 s, mantener para pausar, teclado, «Escuchar completa» y «Guardar en Favoritos» (playlist automática).
- **F12 Letras reales cerrada** (issue #50): parser LRC propio + LRCLIB (`/api/get` con respaldo de búsqueda), hook con caché/timeout, atribución «Letra vía LRCLIB» y política de privacidad actualizada en ES/EN/PT (LRCLIB siempre activo por decisión de la autora). La bandera `legato.lyrics.demo` sigue disponible para previsualizar el diseño sin red.
- Estado global tras la sesión: **172 unit + 4 E2E**, typecheck/lint/build, axe 0 y `impeccable detect` en `[]`.
- Commits de la sesión: `032a310` (tema), `40ca44b` (UI), `acc2e8e` (detector), `b1f8960` (cierre del rediseño + DESIGN.md) y cierres de cápsula y letras.


---

## Sesión 4 (4 oct 2026) — Lista, Spotify en tus estructuras, PiP, audio e import de playlists

### Lo implementado (todo con tests y commits en `main`)

- **Lista (cola) con punteros:** `enqueue` (`append`), `playNext` (`insertAt` tras el nodo actual), quitar, vaciar y reordenar (`moveNode`); la pestaña se llama **Lista** y muestra «doble enlace»; menú «＋» por fila (biblioteca/playlists) y en la Cápsula; drop sobre la pestaña Lista; E2E propio que verifica además que reordenar no cambia lo que suena (fix #12).
- **Referencias externas de Spotify:** los resultados de búsqueda guardan la pista como referencia (`external: true`, `sourceUrl = spotify:track:...`, sin audio; `externalUrl` persistido en IndexedDB) y entran a biblioteca, playlists y Lista. El controlador delega su reproducción al SDK (`setExternalPlayer`), la Lista manda next/prev y **avanza sola al terminar**; las filas marcan `SPOTIFY`. Spotify aporta solo la canción (se eliminó la cola de Spotify).
- **Playlists DnD:** «Agregar a…» siempre visible (crea al vuelo), zonas resaltadas, drop sobre la pestaña Playlists y dentro de la playlist abierta.
- **Mini reproductor:** flotante (z-60, por encima de todas las pantallas), arrastrable con posición persistida; botón para **sacarlo del navegador con Document Picture-in-Picture** (ventana siempre encima) con estilos clonados y controles sincronizados.
- **Audio:** bajos con **lowshelf 0–12 dB** y **4 camas de ambiente generadas** (lluvia, vinilo, café, viento); **crossfade visible** en la pestaña Audio (0–12 s, secuencial); avance automático reanuda el `AudioContext` (antes podía avanzar en silencio); slider de progreso con estado de arrastre (sin trabas).
- **Video mp4:** `mediaType`, motor local con `<video>`, visor «Ver/Ocultar video» sincronizado (audio por el motor).
- **Interfaz:** rótulo «Lado A · 33⅓» eliminado; selector de colección propio (adiós al «alo» del select nativo); ventanita para nombrar playlists; dropdown de colección; toggles de letra (héroe + panel de músicos) con tira de cola cuando no hay letra; controles anclados abajo.
- **Ondas:** líneas finas y largas con curva envolvente de puntas, espacio sobre el campo de tinta y tinta fuera; reposo quieto, al sonar late. Detector de golpes por **flujo espectral** de la banda del bombo (umbral adaptativo + refractario 180 ms + envolvente 130 ms). Medición con bombo de 500 ms: picos cada **497 ms**. Spotify/streaming: pulso sintético 120 BPM mientras suena (el SDK no se puede analizar por DRM).
- **Import de playlists de Spotify:** pestaña Playlists → «Importar de Spotify» (lista de la cuenta, tope 100 pistas, referencias externas). Soporta el renombre de campos `track`→`item`, `tracks`→`items`, fallback `/tracks`→`/items`, límites 50/20/10, reintento 429 y paginación hasta 200. **Pendiente de verificar con la cuenta real** (ver `docs/PENDIENTES.md` §1).
- **Cápsula nostálgica** (sesión previa) y **letras reales** (LRCLIB) siguen en verde.

### Pendientes (detalle y criterios en `docs/PENDIENTES.md`)

1. Configurar/verificar la importación de playlists de Spotify (diagnóstico con la autora).
2. Afinar las ondas al ritmo con música real (y evaluar control de sensibilidad/BPM).
3. Módulo para músicos: metrónomo, BPM/tonalidad, ChordPro, transposición, LRC local, pitch shift, setlists, notas; stems (Demucs) post-entrega.
4. **Login obligatorio** con usuarios en la base de datos (probable auth local en IndexedDB con PBKDF2; Cognito bloqueado por la SCP).
5. Refinar y desplegar (Día 4) + **rotar la access key** expuesta.

### Entorno

- **No hay tokens**: la key de OpenAI está vencida; no hay sesión de Spotify en el entorno de desarrollo (verificación con el navegador de la autora y Premium); la access key de AWS debe rotarse.
- Si la UI queda en blanco o un módulo «no exporta X» tras agregar archivos: reiniciar el server y `rm -rf node_modules/.vite`.
- Prompt listo para la próxima sesión (modo plan): **`docs/PROMPT-PLAN-NUEVA-SESION.md`** (canónico, copiar y pegar); `docs/PROMPT-NUEVA-SESION.md` queda como entrada rápida.

---

## Sesión 5 (3 oct 2026) — Ondas v6 (fase B) y reorden nueva

### Reorden acordado con la autora

- El arreglo del **import de playlists de Spotify (fase A)** se pospone a **justo antes del despliegue**: la autora prefiere implementar otras fases primero. Orden actual: **B → C → D → A → E** (E = deploy, siempre al final; rotar la access key al cierre).
- Login (fase D): la primera cuenta registrada será la de la autora («jenifedora»); adoptará la biblioteca/playlists actuales. Datos **separados por usuario**, recuperación con **código**, Spotify sobrevive al logout dentro del mismo navegador.
- Músicos (fase C): activado por **toggle en Ajustes**; ChordPro con **parser propio**; BPM manual+estimado y tonalidad manual; **pitch shift y stems post-entrega**.

### Lo implementado (todo con tests y verificación)

- **Detector puro** `src/player/beat-detector.ts`: flujo espectral de la banda del bombo con umbral adaptativo, refractario y envolvente; presets `soft` / `normal` / `aggressive` (`BEAT_PRESETS`). El primer cuadro fija la línea base (arrancar no cuenta como golpe) y `reset()` vuelve a reposo.
- **Store** `src/player/waves-store.ts`: sensibilidad y BPM manual persistidos (`legato.waves.v1`), `clampBpm` (30–240) y `nextTap` (tap tempo que se reinicia tras 2 s).
- **Audiógrafo** (`src/player/audio-graph.ts`): segundo `AnalyserNode` exclusivo para golpes (`fftSize` 1024, `smoothing` 0) con la banda 40–150 Hz calculada por `sampleRate`; `getBeatBass()` devuelve el nivel normalizado. El analizador de dibujo no cambia.
- **Ondas** (`src/ui/WaveRing.tsx`): usa `BeatDetector` con la sensibilidad elegida; con señal real detecta golpes, sin señal (Spotify por DRM) usa **pulso sintético al BPM manual** (120 por defecto); en reposo, anillo quieto.
- **UI** (pestaña Audio): botones Suave/Normal/Agresiva (con `aria-pressed`), campo BPM 30–240 y botón **Marcar** (tap tempo), con aviso de que aplica al streaming. i18n ES/EN/PT.
- **Pistas de prueba** (fuera del repo, generadas con ffmpeg): `~/Downloads/legato-ritmo-120bpm.wav` y `~/Downloads/legato-ritmo-100bpm.wav` (bombo claro + bajo + pad, 36 s).
- **Tests nuevos (11)**: `beat-detector.test.ts` (120 BPM sin desfase, refractario, agresiva detecta golpes suaves que suave ignora, sin señal no hay golpes, reset, presets ordenados) y `waves-store.test.ts` (clamp y tap tempo).
- **Verificación**: baseline (191+6+build) y cierre de la tanda (**202 unit + 6 E2E + build + typecheck + lint + format**, axe 0 dentro de la suite y `impeccable detect` en `[]`).

### Pendiente dentro de B

- Validación auditiva de la autora con las pistas de prueba (picos a ojo en los golpes, reposo quieto) y afinar presets si hace falta.
- Documentar en `docs/PENDIENTES.md` §2.

### C1 Metrónomo (fase C, implementado)

- Módulo nuevo `src/features/musician/`: `metronome.ts` (programador puro con lookahead + motor Web Audio + clic sintetizado con oscilador cuadrado y envolvente), `metronome-store.ts` (BPM 30–240, compás, volumen; persistido en `legato.metronome.v1`), `musician-store.ts` (modo músico en `legato.musician.v1`).
- Compases 2/4, 3/4, 4/4 y 6/8 (acento en el 1 y el 4); tap tempo reutiliza `nextTap` de las ondas; el cambio de BPM reagenda el siguiente pulso desde el último clic; si el reloj se atrasa, se resincroniza sin perder la fase.
- UI: toggle **«Modo músico»** en Ajustes (apagado por defecto) y pestaña **Práctica** en el panel de músicos (Estructura sigue siempre disponible). i18n ES/EN/PT.
- Tests: `metronome.test.ts` (acentos, programación a 120 BPM, cambio de BPM, resincronización, motor con contexto falso y sin contexto). Total: **211 unit + 6 E2E**; verificado en navegador con Playwright (inicia/detiene sin errores).

### C2 BPM y tonalidad por pista (implementado)

- **Estimador propio** `bpm-estimator.ts`: filtro paso-bajos RBJ a 150 Hz, envolvente de ataques por flujo de energía (hops de 10 ms) y autocorrelación con interpolación parabólica y corrección de octava. `estimateBpmFromSamples` es puro y testeable; `detectBpmFromBlob` decodifica con `OfflineAudioContext` (primeros 90 s, mezcla a mono).
- **Verificado con las pistas de prueba** (`~/Downloads/legato-ritmo-120bpm.wav` y `100bpm.wav`, con bombo + bajo + pad): devuelve **120 y 100 exactos**.
- **Persistencia por pista** en IndexedDB: Dexie sube a **versión 2** con la tabla `analysis` (`trackId`); `hydrateStores` la carga y `startPersistence` la sincroniza; al borrar una canción se limpia su análisis. Tabla en ES/EN/PT.
- **UI** (pestaña Práctica): panel «BPM y tonalidad» con BPM manual (30–240), botón **Detectar BPM**, mensaje de estimación, selector de **tonalidad** (24 mayores/menores) y botón **Usar en el metrónomo**. La detección se desactiva en referencias externas de Spotify (DRM) con aviso para escribir el BPM a mano.
- **Tests** (9 nuevos): estimador sintético a 120/100, silencio y audio corto; store (clamp, alta/borrado de campos, conservación); persistencia (guardar/leer y `syncAnalysis` descarta pistas borradas). Total: **220 unit + 6 E2E**; verificado en navegador (detectó 120 y persistió BPM/tonalidad tras recargar).

### C3 ChordPro propio y transposición (implementado)

- **Parser propio** `chordpro.ts`: `[Acorde]letra`, directivas `{title}/{artist}/{key}/{comment}`, secciones (`start_of_chorus`/`soc` y equivalentes) y `#`; los metadatos desconocidos se conservan. `parseChordProLine` reparte cada acorde sobre el texto que le sigue.
- **Transposición** `transposeChord` (±11 semitonos, enarmonía según sostenidos/bemoles del original, acordes con barra como `G/B`) y `transposeSong` (acordes + tonalidad, sin tocar la letra).
- **Hojas por pista** en IndexedDB: Dexie sube a **versión 3** con la tabla `chords` (`trackId`); hidratación y `syncChords` en la persistencia, limpieza al borrar la canción.
- **UI** (pestaña **Acordes**): importar `.cho/.pro` o pegar texto, editor con autoguardado (debounce 400 ms), botones − / + de transporte con «Original», y vista en `<ruby>` (acorde sobre la sílaba, en tinta directa) con título/artista y `Tono: X`. i18n ES/EN/PT.
- **Tests** (12 nuevos): parser (tokens, secciones, comentarios, directivas desconocidas), transporte (mayores, menores, séptimas, octava, bemoles, barras, acordes inválidos), `transposeSong` y persistencia/store de hojas. Total: **232 unit + 6 E2E**; verificado en navegador (G→A con `+2`, persistencia tras recargar, sin errores).
- Detector de impeccable: se corrigió un `text-[0.625rem]` fuera de la rampa a `0.6875rem`; resultado `[]`.

### C4 Setlists y notas (implementado)

- **Setlists sobre otra DLL del núcleo** (`setlist.ts`): `moveSetlistItem` reconstruye la lista doble y reordena con `moveNode`; helpers de marcar/desmarcar tocada y quitar. Store `setlist-store.ts` con crear (vacía o desde playlist, sin duplicados), eliminar, seleccionar, mover, marcar y quitar; selección conservada al hidratar.
- **Notas** (`notes-store.ts`) por pista y por playlist con clave `tipo:id`; `NotesEditor` reutilizable con autoguardado (debounce 400 ms).
- **Persistencia IndexedDB**: Dexie sube a **versión 4** con `setlists: 'id'` y `notes: '[targetType+targetId]'` (clave compuesta); hidratación, `syncSetlists` y `syncNotes` (descarta destinos inexistentes); al borrar canciones o playlists se limpian sus notas.
- **UI**: pestañas **Setlist** (crear, elegir, reproducir, eliminar, filas con nº, tocada, subir/bajar, quitar, duración total) y **Notas** (pista actual + playlist seleccionada). Total 5 pestañas con `flex-wrap`. i18n ES/EN/PT.
- **Tests** (12 nuevos): reordenar con la DLL (extremos y mismo índice), ignorar pistas ausentes, marcar/quitar; store (crear/seleccionar/eliminar/hidratar); notas (guardar/hidratar/borrar); persistencia de setlists y de notas con limpieza de huérfanos. Total: **244 unit + 6 E2E**; verificado en navegador (2 pistas, 1:12, reordenar, tocada y nota persisten tras recargar).

### C5 Letra local .lrc (implementado)

- **Store** `local-lyrics-store.ts` (por pista) y **persistencia**: Dexie sube a **versión 5** con la tabla `lyrics` (`trackId`); hidratación, `syncLyrics` (descarta pistas borradas) y limpieza al eliminar canciones.
- **Prioridad sobre LRCLIB**: `useLyrics` lee la letra local primero y, si tiene líneas sincronizadas, no llama a la red; `LyricsQuery` gana `trackId` (el héroe lo pasa también en modo Spotify para referencias guardadas). El héroe muestra la atribución **«Letra local»** cuando aplica.
- **UI**: sección «Letra local (.lrc)» en la pestaña **Notas** (cargar archivo, estado y quitar). i18n ES/EN/PT.
- **Tests** (4 nuevos): store local; `useLyrics` prefiere la letra local y no llama a `fetch`; persistencia (guardar/leer) y `syncLyrics` descarta pistas ausentes. Total: **248 unit + 6 E2E**; verificado en navegador (héroe con línea local y persistencia tras recargar).
- **Cierre del módulo de músicos**: C1–C5 completos; **pitch shift y stems (Demucs) quedan post-entrega** como se acordó.

### C6 Acordes automáticos con la letra (implementado, pedido de la autora)

- **Motor de detección** propio y puro: `fft.ts` (radix-2 con ventana Hann), `audio-decode.ts` (decodifica a mono, compartido con BPM) y `chord-detect.ts`: por cuadro (4096, hop ~93 ms, primeros 120 s) calcula el **perfil cromático**, prueba las **24 tríadas mayores/menores** y suaviza con mediana + herencia del acorde anterior; los tramos cortos se funden. Devuelve `{ time, duration, chord }[]`.
- **Sin trabajo manual**: al abrir la pestaña **Acordes**, si hay archivo local y no hay acordes guardados, la detección corre sola (una vez por pista). El resultado se guarda en el análisis de la pista (`detectedChords`, persistido con la tabla `analysis`).
- **Con la letra**: si hay letra local o de LRCLIB, cada línea muestra encima el acorde vigente (sección «Acordes con la letra»); si no hay letra, se muestra la **línea de tiempo**. El editor manual ChordPro (pegar/importar/transportar) pasa a un desplegable «Editor manual (ChordPro)».
- **Aislamiento de instrumentos**: los stems reales (Demucs) siguen post-entrega; mientras tanto se mantienen las aproximaciones por DSP: karaoke M/S (atenuar voz), aislamiento L/R, balance y **bajos de −12 a +12 dB** (ahora también atenúan).
- **Tests** (7 nuevos): FFT (pico de un seno, DC), detección (C→G con tiempos, menores, silencio, audio corto) y store (`setDetectedChords` no pisa BPM/tono). Total: **255 unit + 6 E2E**; verificado en navegador con una pista de prueba C·G·Am·F generada con ffmpeg (`~/Downloads/legato-acordes.wav`).

### C7 Análisis de Spotify para ondas y acordes (implementado; verificación pendiente con la cuenta)

- **Motivo**: la autora reportó que con Spotify no salían acordes y las ondas no iban al ritmo. El audio del SDK va por DRM y no se puede analizar; la vía es el **análisis que Spotify publica por pista**.
- **API**: `fetchSpotifyAudioAnalysis(trackId)` (`/v1/audio-analysis`) devuelve tempo, tono/modo, `beats[]` y `segments[].pitches` (croma de 12 dimensiones). Si la app no tiene acceso responde 403/404 y el panel muestra el **error exacto**.
- **Chords**: `chordsFromSpotifySegments` reutiliza `chordsFromChromaFrames` (el detector de C6, ahora separado del audio) sobre el croma de los segmentos; `spotifyKeyName` convierte tono+modo a `C`/`Am`. Al detectar se rellenan también **BPM** y **tonalidad** si estaban vacíos.
- **Ondas**: `WaveRing` gana `position`, `beats` y `bpmOverride`; con la rejilla de Spotify el golpe cae exactamente en cada beat y la posición se **interpola entre sondeos** (ancla + reloj del navegador) para que no vaya a saltos de 1 s. Sin rejilla, el pulso sintético usa el BPM de la pista (o el manual global) y queda **anclado a la posición** (antes usaba el reloj del rAF, así que nunca cuadraba de fase).
- **UI**: en la pestaña Acordes, para referencias de Spotify se intenta solo al abrir si hay sesión conectada; si falla, se muestra el mensaje con botón «Detectar desde Spotify».
- **Verificación real (3 oct 2026)**: la cuenta de la autora recibe **HTTP 403** en `/v1/audio-analysis` (Spotify ya no expone el análisis a apps nuevas). Se añadió **fallback automático por preview de 30 s**: `GET /v1/tracks/{id}` → `preview_url` → descarga + `detectChordsFromBlob` + `detectBpmFromBlob`. Si el preview existe, quedan acordes y BPM de los primeros 30 s; si no, el panel lo dice y quedan BPM manual (anclado) y el editor ChordPro.
- **Tests** (7 nuevos): `spotifyKeyName`, `chordsFromSpotifySegments`, store de beats y lectura del preview (con y sin URL). Total: **262 unit + 6 E2E**.

### C8 Tap tempo con fase y diagnóstico de audio (implementado)

- **Susto y aprendizaje**: en esta sesión se intentó forzar `channelCount`/`channelInterpretation` del `ChannelSplitter` para «arreglar» el mono; Chromium lanza `InvalidStateError` porque la interpretación del splitter es `discrete` fija, el `catch` del grafo se lo tragaba y **todo el audio quedaba mudo** (elemento congelado en 0 s). Se revirtió, se comprobó señal real (niveles >1200 con el WAV de prueba) y el `catch` ahora **avisa por consola** (`[audio-graph]`).
- **Enganche de depuración** `window.__legato` (solo `import.meta.env.DEV`) para medir el grafo real desde Playwright; `page.evaluate` con `import()` devolvía una **segunda instancia** del módulo y daba mediciones falsas.
- **Tap tempo con fase**: `Marcar` ya no solo fija BPM; con la posición (de Spotify, interpolada entre sondeos; o del motor local) calcula la **fase media** del compás (`offsetFromPositions`, función pura con tests) y las ondas golpean donde la autora marca. En referencias externas se guarda **BPM y fase por pista** (`analysis.bpm` / `analysis.beatOffset`) y `VinylVisual` los pasa a `WaveRing` como override.
- **Preview de Spotify**: `GET /v1/tracks/{id}?market=from_token`; si el análisis 403 y hay preview, se descargan 30 s y se estiman acordes + BPM; el panel distingue «Spotify tampoco ofrece preview» de «el preview no se pudo descargar o analizar» en vez de un genérico.
- **E2E**: un fallo de los smoke se debió a la **caché stale de Vite** tras muchas ediciones (`rm -rf node_modules/.vite` + reinicio), no a regresión. Total: **265 unit + 6 E2E**.

### C9 Acorde en vivo (implementado)

- **Contexto**: la autora veía «chords estimated from the audio» pero sin letra solo aparecía la línea de tiempo, así que la estimación no se «veía». En Spotify el 403 sin preview es definitivo.
- **Indicador en vivo** en la pestaña Acordes: tarjeta grande con el **acorde vigente** y el **siguiente** (`Siguiente: X` / `Último acorde`), sincronizada a la posición (motor local o `positionMs` de Spotify). Resalta además la **línea de letra activa** y la **fila activa** de la línea de tiempo.
- **Ayuda**: cuando no hay letra, el aviso invita a cargar un `.lrc` en Notas.
- **Helper puro** `activeChordIndex` con tests (posiciones antes del primer acorde, límites y vacío). Total: **267 unit + 6 E2E**; verificado en navegador con la pista C·G·Am·F (C → G → Am → F en vivo).

### C10 Modo micrófono en vivo (implementado, pedido de la autora)

- **Motivo**: para Spotify no hay análisis (403) ni preview en muchos casos. La vía casera elegida: **escuchar la sala por micrófono** (audio 100 % en el dispositivo) para estimar en vivo beats y acordes, siempre disponible.
- **Motor** `mic-analyzer.ts`: `getUserMedia` (sin cancelación de eco/ruido ni AGC) → `AnalyserNode` de niveles (fftSize 4096, croma) → analizador de bombo (1024, sin suavizado) → gain 0 al destino (silencio, sin realimentación). `stop()` libera el stream y cierra el contexto. Errores tipados (permiso denegado / sin micrófono / desconocido).
- **Pureza testeable**: `chromaFromMagnitudes`, `chordFromChroma`, `majorityChord` (en `chord-detect.ts`) y `estimateBpmFromBeats` + `phaseFromBeats` (en `mic-analyzer.ts`).
- **Store** `mic-store.ts`: polling cada 120 ms; ventana móvil de 5 etiquetas para el acorde en vivo; `BeatDetector` sobre la banda del bombo con **latencia compensada** (80 ms) y cálculo de BPM/fase contra la posición de la pista (local o Spotify, vía callbacks que aporta la UI para no acoplar módulos). Al cambiar de pista finaliza y continúa con la nueva; al detener **guarda por pista**: `detectedChords` (origen `mic`), `detectedBeats`, `bpm` y `beatOffset`, **sin pisar un análisis de archivo local** (`shouldSaveMicChords`).
- **UI**: `MicControl` en las pestañas **Audio** y **Acordes** (iniciar/detener, estado, acorde en vivo, BPM oído, nota de privacidad); el indicador grande de Acordes muestra el acorde del micrófono mientras escucha; `WaveRing` prioriza los golpes del micrófono cuando no hay señal local (Spotify/vinilo) sobre el pulso sintético.
- **Tests** (12 nuevos): helpers de BPM/fase, reconocimiento desde croma, voto mayoritario, regla de guardado y un **E2E con micrófono falso de Chromium** (`--use-fake-device-for-media-stream`) que verifica permiso, escucha y parada. Total: **279 unit + 7 E2E**.
- **Límites documentados**: calidad según ruido/volumen de la sala; los acordes en vivo son orientativos; no sustituye al análisis de un archivo local.

### R Rollback de acordes automáticos (implementado, decisión de la autora)

- **Motivo**: en música real el detector clásico (croma + tríadas) no produce acordes fiables, así que se archiva la detección automática en lugar de mostrarla.
- **Bandera `legato.chords.auto`** (apagada por defecto, `features/musician/chords-flag.ts`): con la bandera activa vuelve todo (detección local, Spotify y micrófono). Sin ella, ni se muestra ni corre.
- **Pestaña Acordes**: el **editor manual ChordPro** pasa a ser el contenido principal con una **guía visible** («Cómo usar los acordes»: importar `.cho/.pro`, formato `{title:}` / `[C]letra`, autoguardado y transporte). El intento de Spotify (análisis/preview) también queda tras la bandera.
- **Micrófono**: conserva golpes, BPM y fase (ondas) y su guardado por pista; los acordes en vivo solo aparecen con la bandera.
- **Tests**: `chords-flag.test.ts` (apagada por defecto, se activa con `1`) y verificación en navegador (solo editor + guía, sin detección ni micrófono en Acordes). Total: **281 unit + 7 E2E**.

### S Stems con Demucs para practicar (implementado)

- **`scripts/practice-mix.sh`**: usa **Docker** (imagen CPU propia construida desde `scripts/demucs.Dockerfile`: python 3.12 + torch/torchaudio CPU + numpy + demucs + ffmpeg) para no depender del Python del sistema (3.14 sin wheels). Caché de modelos en `~/.cache/legato-demucs` y montajes con `:z` para **SELinux de Fedora**; el contenedor corre con el uid del usuario para que los ficheros salgan con sus permisos.
- **Salidas listas para importar** en `stems/<nombre>/` (gitignored): «sin voz» (modelo de 4 stems con `--two-stems=vocals`) y, con `--guitar` (modelo `htdemucs_6s`), «sin voz», «sin guitarra», «solo batería» y «solo bajo» mezcladas con ffmpeg.
- **Verificado end-to-end** con un clip de 8 s: separación en ~6 s y MP3s con audio (volumen medido; «solo batería» en silencio es correcto porque el clip sintético no tiene batería).
- **`docs/STEMS.md`**: requisitos, comandos, notas de calidad/tiempos y cómo practicar en Legato (loop A–B, metrónomo, velocidad, ChordPro). La integración dentro de la web con servidor local queda como mejora futura.

### T Ondas: margen dinámico del bombo (implementado)

- **Diagnóstico medido**: la banda del bombo saturaba (media 0.71, pico 0.98) porque `getByteFrequencyData` con el rango por defecto (`-100..-30 dB`) recorta un bajo continuo; el flujo del golpe quedaba aplastado.
- **Arreglo**: `beatAnalyser.minDecibels = -90`, `maxDecibels = -10` en el grafo local y en el micrófono. Verificado: en la pista de 120 BPM la media baja a 0.50 y se cuentan 15 golpes en 6 s; en la pista sin bombo, 0 golpes. El pulso del golpe sube a ×3 y la pestaña Audio explica cuándo las ondas siguen el beat real (local/micrófono) y cuándo usan el BPM marcado (Spotify sin micrófono).
- **Metrónomo documentado para otra sesión**: `docs/METRONOMO.md` (uso paso a paso, arquitectura, problemas conocidos y criterios de aceptación).

### D Login obligatorio (implementado)

- **Proveedor real**: Firebase Authentication con correo/contraseña + Google, verificación por email y recuperación por correo; política de sesión de 7 días. Si falta configuración, **respaldo local** con cuentas PBKDF2-SHA256 (310k, salt y comparación constante) y sesiones opacas en IndexedDB, para clase sin internet y E2E.
- **Puerta**: `AuthGate` en `App` (cargando → login → verificación → shell); pantallas Duotono en `LoginScreen.tsx`; i18n ES/EN/PT; axe 0; política de privacidad actualizada (Firebase/Google).
- **Datos por usuario** con Dexie v7 (`userId` + índices): biblioteca, playlists, sesión (`current:<uid>`), análisis, acordes, letras, setlists y notas; al entrar se hidratan por usuario y al salir se vacían. **El primer usuario adopta los huérfanos** (biblioteca previa). Tokens de Spotify y cápsula por usuario (sobreviven al logout); ajustes de dispositivo globales.
- **Cuenta**: cerrar sesión (chip) y eliminar cuenta (Ajustes, con contraseña) que borra usuario y datos.
- **Pruebas**: 290 unit (PBKDF2, cuentas locales, migración/filtrado, selección de proveedor) + **9 E2E** (auth.spec nuevo y los 7 existentes con `registerAndEnter`).
- **Pendiente manual**: crear/pegar la configuración de Firebase (pasos con enlaces en `docs/AUTH.md`) y verificar registro con correo real, Google, recuperación y borrado.
- **Aislamiento de sesión (bug reportado)**: al cambiar de cuenta no se limpiaba el estado transitorio (SDK de Spotify, cola interna del reproductor, undo/redo, temporizador, ambiente, metrónomo y micrófono). Se añadió `teardownSession()` en la capa app + `PlayerController.clearSession()` + `stopAmbientPlayback()`; E2E nuevo de cambio de cuenta.

### N Sincronización en la nube (implementado)

- **Motivo**: la autora necesita que cada usuario tenga lo suyo **en cualquier dispositivo** (móvil o PC), no por navegador.
- **Arquitectura**: `features/sync/` con backend abstracto; **Firebase** implementa Firestore: metadatos por usuario y **audios/portadas troceados** en documentos (`fileManifests` + `fileChunks`, 700 KB por trozo en base64), porque Storage exige el plan Blaze; backend en memoria para tests.
- **Fusión**: por registro con `updatedAt` (gana la edición más reciente) y **lápidas** (`tombstones`) para que los borrados viajen sin resucitar; `mergeTable`/`mergeTombstones` puros y testeados.
- **Ciclo**: al iniciar sesión se baja y aplica (con descarga de audios faltantes y progreso), se hidrata y luego se sube lo local; los cambios locales se empujan con debounce de 3 s; botón «Sincronizar ahora» y toggle en Ajustes (la sincronización solo se activa con Firebase configurado).
- **Límites**: cuotas gratuitas de Firestore (documentadas en `docs/AUTH.md`); las referencias de Spotify viajan como metadatos y la conexión del SDK se hace por dispositivo (misma cuenta Premium).
- **Privacidad**: con la nube activa, canciones y audios se guardan en Firebase (Google); política actualizada en ES/EN/PT.
- **Tests**: fusión (5), motor con backend en memoria (4) y persistencia con lápidas; total **300 unit + 10 E2E**.

## Sesión 6 (4 oct 2026) — Audio en Firestore, arreglos del reproductor y cierre

### U Audio en Firestore, sin Storage (implementado)

- **Problema**: activar Firebase Storage obliga al plan **Blaze** (tarjeta de crédito); la autora lo rechazó. Los audios no caben solo en Firestore como documento.
- **Solución**: guardar los archivos **troceados** en Firestore tras la misma abstracción de backend (`firebase-backend.ts`): un documento **manifiesto** (`fileManifests`: nombre, tipo, tamaño, nº de trozos) y **trozos** (`fileChunks`: 700 KB en base64 por documento). El motor de sincronización (`sync-engine.ts`) sube y baja los trozos como si fuera un blob; al leer reconstruye el `Blob` y lo persiste en IndexedDB. Commit `75a11d4` (`feat(sync): store audio chunks in firestore and enable firebase auth`).
- **Estado del panel**: si falta configuración de Firebase o las reglas de Firestore, el panel de sincronización se muestra como **«Pendiente de configurar»** en vez de ofrecer un botón que fallará.
- **Reglas de Firestore** publicadas en la consola (`docs/AUTH.md`), con rutas por usuario para manifiestos y trozos.

### V Volumen/velocidad con Spotify y escape del bug «local = Spotify» (implementado)

- **Volumen con Spotify**: el control de volumen se conecta al volumen del **Web Playback SDK** (no pasa por el `GainNode` del DSP local); en móvil el control queda disponible en la barra inferior. Commit `a5b7b54` (`fix(player): spotify volume and speed controls on mobile`).
- **Velocidades ampliadas**: el ciclo del control pasa a **1× → 1.25× → 1.5× → 2× → 0.9× → 0.75× → 0.5×** (`PlayerController.cycleRate`); el panel de ensayo lista todas las tasas. Commit `2884b8b` (`feat(player): add faster playback speeds up to 2x`).
- **Bug corregido**: con Spotify **en pausa** y una pista **local** sonando, la app trataba la pista local como si fuera de Spotify (afectaba ondas/velocidad). Ahora `spotifyActive` depende de la pista **externa** real. Commit `da0303a` (`fix(player): local playback is not treated as spotify when spotify is paused`).
- **Velocidad en Spotify = imposible**: el SDK/DRM no permite cambiar la velocidad de reproducción; en su lugar se añadió un **aviso** explicativo en vez de dejar el control deshabilitado sin explicación. Commit `f1b1114` (`fix(player): explain that spotify cannot change speed instead of disabling`).

### W Estado y bloqueos al cierre de la sesión 6

- **Tests**: **312 unitarios + 13 E2E** en verde (incluye `spotify-store`, `external-track` y el E2E de reproducción), typecheck/lint/format/build en verde, detector de impeccable `[]`.
- **Firebase real**: la autora creó su cuenta, pero **el correo de verificación no llega** (probable spam; remitente `*firebaseapp.com`). Con la regla de que **sin correo verificado no hay sesión**, la vía recomendada para la demo es **entrar con Google**; configurar SMTP propio queda para después.
- **«Error de conexión»**: reportado por la autora pero **no reproducido** al cargar la app ni con Google (sin errores en consola). Pendiente localizar el mensaje exacto.
- **Decisión abierta (velocidad)**: la autora pidió **ocultar** el control de velocidad cuando la fuente es Spotify en vez de mostrar el aviso del commit `f1b1114`; queda pendiente confirmarlo e implementarlo.
- **Fase A (import de playlists de Spotify)**: aplazada a justo antes del deploy; pendiente de diagnóstico con la cuenta real. Detalle en `docs/PENDIENTES.md` §1.
- **Fase E (deploy)**: pendiente S3 + CloudFront + ACM + `app.jenilarper.dev` y **rotar la access key** expuesta.

### X Google como vía principal y verificación alcanzable (implementado)

- **Motivo**: el correo de verificación de Firebase no llega a la bandeja de la autora (spam). Con la verificación obligatoria, la vía fiable para la demo es **entrar con Google**.
- **Login** (`LoginScreen.tsx`): el botón de Google sube al principio y pasa a ser la **acción principal** (acento) con la nota «Sin correo de verificación; entras al instante» y un separador «o con tu correo». Claves nuevas `auth.googleHint` y `auth.orEmail` en ES/EN/PT.
- **Pantalla de verificación alcanzable** (`firebase-auth-provider.ts`): antes `signUp`/`signIn` sin verificar hacían `signOut` y la pantalla de verificación era inalcanzable. Ahora se mantiene la sesión y `AuthGate` muestra `VerifyEmailScreen` (reenviar, «ya lo confirmé» y salida por Google). Semántica: **sin correo verificado no se entra al reproductor, pero sí se puede estar en la pantalla de verificación**. `init()` ya no cierra la sesión no verificada; se conserva la política de 7 días.
- **Accesibilidad**: test de axe nuevo para la pantalla de verificación (`App.a11y.test.tsx`, `emailVerified: false`).
- **E2E**: los proveedores locales no verifican, así que los 13 E2E siguen igual.

### Y Ocultar la velocidad en Spotify (implementado)

- **Decisión de la autora**: en Spotify el control de velocidad no hace nada (SDK/DRM); se **oculta** en vez de mostrar un aviso.
- **Cambios**: `Hero.tsx`, `PlayerBar.tsx` (barra móvil) y la sección de velocidad de `PracticePanel.tsx` solo aparecen con `!spotifyActive`. En local se mantiene el ciclo **1→1.25→1.5→2→0.9→0.75→0.5** (`controller.cycleRate`). Se retiran el estado `speedNotice` y la clave i18n `player.speedSpotify` (ES/EN/PT) para no dejar huérfanas.
- **Verificación**: `player.spec.ts` (velocidad en local) sigue verde; detector de impeccable `[]`.
