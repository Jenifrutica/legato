# Legato — Contexto completo (handoff de sesión)

> **Lee este documento completo antes de tocar nada.** Está escrito para que una sesión nueva (o un agente distinto) continúe el proyecto exactamente donde quedó, sin releer toda la conversación anterior.

- **Última actualización:** 3 de octubre de 2026, sesión de tarde.
- **Último commit:** `a5cebc0` (docs) sobre `e85ffa3` (Spotify SDK). Rama `main`, árbol limpio, todo pusheado.
- **Tests:** 154 unitarios + 4 E2E en verde. typecheck/lint/build en verde.
- **Servidor de desarrollo:** corriendo en `http://127.0.0.1:5173` (importante: `127.0.0.1`, no `localhost`, por Spotify).

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

~/.bun/bin/bun run test        # 154 unitarios
~/.bun/bin/bun run test:e2e    # 4 E2E (levanta el server solo)
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
