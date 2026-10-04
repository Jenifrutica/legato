# Legato — Pendientes detallados (handoff de implementación)

> Documento de trabajo para la siguiente sesión (modo plan → build). Recoge **qué falta, por qué, cómo verificarlo y qué decisiones están abiertas**. El contexto histórico completo está en `docs/CONTEXTO-COMPLETO.md`; el plan del rediseño en `docs/REDISENO.md`; y el prompt de arranque en **`docs/PROMPT-PLAN-NUEVA-SESION.md`**.

- **Fecha:** 4 de octubre de 2026 (actualizado tras la fase B de la sesión 5).
- **Estado base:** 244 unitarios + 6 E2E en verde; typecheck/lint/build OK; axe 0; detector de impeccable `[]`.
- **Orden actual:** B → C (músicos) → D (login) → A (import de Spotify, justo antes del deploy) → E (deploy).
- **Último commit:** ver `git log --oneline -1` (rama `main`, todo pusheado).
- **Tokens/entorno:** no hay tokens de OpenAI válidos; no hay sesión de Spotify en el entorno de desarrollo; la access key de AWS debe rotarse antes de terminar.

---

## 0. Resumen de lo implementado en la sesión 4 (para no repetirlo)

Rediseño **Duotono 62** completo (F0–F10), **Cápsula nostálgica** (F11), **letras reales con LRCLIB** (F12) y después:

| Bloque | Qué quedó |
|---|---|
| F13 | Lista (cola) sobre la DLL a mano: `enqueue` (`append`), `playNext` (`insertAt` tras el nodo actual), quitar, vaciar, reordenar (`moveNode`); menú por fila; drop sobre la pestaña; E2E propio |
| F14 | Playlists DnD: «Agregar a…» siempre visible, zonas resaltadas, drop sobre la pestaña, drop dentro de la playlist |
| F15 | Disco: rótulo «Lado A · 33⅓» eliminado; campo de tinta sin cruzar el disco; disco más grande (`min(46rem, 80vw, 72dvh)`) |
| F16 | Mini reproductor flotante (z-60) + **Picture-in-Picture de documento** (ventana siempre encima), arrastrable |
| F17 | Toggle de letra (héroe + panel de músicos), tira de cola cuando no hay letra, controles anclados abajo |
| F18 | Bajos (lowshelf 0–12 dB) + 4 camas de ambiente generadas (lluvia, vinilo, café, viento) |
| F19 | Video mp4: `mediaType`, motor con `<video>`, visor «Ver/Ocultar video» sincronizado |
| F20 | Dropdown propio de colección (adiós al «alo» del select nativo) |
| F21 | Cola desde búsqueda + referencias externas de Spotify en biblioteca/playlists/Lista, reproducidas por el SDK con la Lista mandando el orden |
| F22 | Ondas: líneas finas y largas, curva envolvente de puntas, detección de golpes por **flujo espectral** (medido: picos cada 497 ms con bombo a 500 ms) |
| — | Import de playlists de Spotify (soporte `item`/`items`, límites 50/20/10, 429, paginación) — **falla en la sesión de la autora, ver §1** |

---

## 1. Importar playlists de Spotify (CONFIGURAR / VERIFICAR)

**Qué hay:** en la pestaña **Playlists** → botón **«Importar de Spotify»** → lista las playlists de la cuenta (nombre + nº de pistas) → al elegir una crea una **playlist local** con esas canciones como **referencias externas** (metadatos + URI `spotify:track:...`, sin audio; se reproducen con el Web Playback SDK). Tope actual: 100 pistas por playlist; paginación de la lista hasta 200 playlists.

**Problema reportado por la autora:** el panel mostró «Could not fetch your Spotify playlists» y luego «reconnect to Spotify» incluso después de reconectar.

**Lo implementado como respuesta (en este cierre):**
- Si el *refresh token* falla, los tokens se **borran** (`disconnectSpotify`) para no fingir sesión; el panel muestra un botón **«Conectar Spotify de nuevo»**.
- La lista se pide con límites descendentes **50 → 20 → 10** (Spotify ha bajado máximos: la búsqueda pasó de 50 a 10) y un **reintento en 429**.
- Las pistas usan los mismos límites y el fallback **`/tracks` → `/items`** (renombre de campos `track`→`item`, `tracks`→`items`).
- El error muestra el **status y mensaje exactos** de Spotify (y se registra en consola como `[spotify-import]`); 401 pide reconectar y 403 pide permiso de playlists.

**Pasos de verificación para la próxima sesión (en el navegador de la autora):**
1. Abrir **`http://127.0.0.1:5173`** (Spotify no permite `localhost`).
2. Ajustes (⚙) → **Conectar Spotify** → aceptar. Luego **Probar conexión** (debe mostrar el nombre).
3. Consola del navegador: `JSON.parse(localStorage.getItem('legato.spotify.tokens'))` → revisar `expiresAt`; y los logs `[spotify-import]`.
4. Playlists → Importar de Spotify. Si falla, **anotar el mensaje exacto** que aparece.
5. En el dashboard de Spotify: Redirect URI `http://127.0.0.1:5173` registrada; la app es de desarrollo y la cuenta debe estar en la allowlist (la búsqueda ya funciona, así que probablemente sí).

**Causas posibles si persiste:**
- Refresh token revocado → se soluciona reconectando (ahora la app limpia los tokens viejos).
- Reloj del sistema desfasado (PKCE/expiración).
- Límite de la API distinto o endpoint cambiado de nuevo → ajustar en `src/features/sources/spotify.ts`.
- Scope `playlist-read-private` no concedido en el token actual → reconectar y verificar los scopes en la URL de autorización.

**Criterio de cierre:** importar una playlist real de 3+ pistas y ver: (a) la playlist local creada, (b) cada pista como referencia `SPOTIFY` en la Lista, (c) reproducción por el SDK al pulsar play.

**Archivos:** `src/features/sources/spotify.ts` (API), `save-track.ts` (referencias externas), `src/ui/RightPanel.tsx` (panel), tests en `src/features/sources/spotify-playlists.test.ts`.

---

## 2. Ondas al ritmo de los golpes (VERIFICAR CON LA AUTORA)

**Qué hay (fase B, cerrada en código):**
- Detector puro `BeatDetector` (`src/player/beat-detector.ts`): flujo espectral de la banda del bombo con umbral adaptativo, refractario y envolvente con vida media en ms; presets **suave / normal / agresiva**.
- Analizador dedicado al bombo en `audio-graph.ts` (`fftSize` 1024, `smoothing` 0, banda 40–150 Hz calculada por `sampleRate`) separado del analizador de dibujo (`fftSize` 256, `smoothing` 0.68).
- Control de **sensibilidad** y **BPM manual con tap tempo** en la pestaña Audio (persistidos en `legato.waves.v1`); con Spotify/DRM el pulso es sintético al BPM manual (120 por defecto).
- Pistas de prueba fuera del repo: `~/Downloads/legato-ritmo-120bpm.wav` y `~/Downloads/legato-ritmo-100bpm.wav` (bombo + bajo + pad, 36 s).

**Pendiente (solo verificación con la autora):**
- Importar las pistas de prueba (o música real local) y confirmar a ojo que los picos caen en los golpes; reposo/pausa quieto.
- Ajustar presets si su oído pide más/menos sensibilidad (`BEAT_PRESETS`).
- Revisar rendimiento con 110 segmentos a 30 fps mientras suena.

**Criterio de cierre:** con las pistas de prueba los picos caen en los golpes a ojo de la autora; pausa quieto.

**Archivos:** `src/player/beat-detector.ts`, `src/player/waves-store.ts`, `src/player/audio-graph.ts`, `src/ui/WaveRing.tsx`, `src/ui/AudioQualityPanel.tsx` y tests `src/player/beat-detector.test.ts` / `waves-store.test.ts`.

---

## 3. Módulo para músicos (IMPLEMENTAR)

**Qué hay ya:** letras sincronizadas (LRCLIB + atribución; parser LRC propio), karaoke M/S, velocidad (1×/0.9/0.75/0.5), loop A–B, panel de músicos slide-over con el modo Estructura (DLL), crossfade, bajos y ambientes.

**Pendiente (según `docs/MUSICOS.md`):**

| Función | Notas de diseño |
|---|---|
| **Metrónomo** | **Hecho (C1)**: motor Web Audio con lookahead, BPM 30–240, compases 2/4 · 3/4 · 4/4 · 6/8 (acento en 1 y 4), tap tempo, volumen; pestaña Práctica del panel de músicos; toggle «Modo músico» en Ajustes. Verificado y con tests |
| **BPM/tonalidad** | **Hecho (C2)**: estimador propio (paso-bajos + envolvente de ataques + autocorrelación), BPM manual y tonalidad manual persistidos por pista (IndexedDB, tabla `analysis`), botón «Usar en el metrónomo». Verificado con las pistas de prueba (120/100 exactos) |
| **ChordPro** | **Hecho (C3)**: parser propio `[Acorde]` + letra, directivas/secciones/comentarios; archivos `.cho`/`.pro` importables o pegados; editor con autoguardado y vista `<ruby>`; sin sincronía con audio (opcional, no pedida) |
| **Transposición** | **Hecho (C3)**: ±11 semitonos sobre ChordPro (acordes con barra y enarmonía correcta); solo cambia la vista, la hoja original no se toca |
| **LRC local** | Cargar `.lrc` junto al audio (File System Access API o input) y usarlo antes que LRCLIB |
| **Pitch shift** | Cambiar tono sin cambiar tempo (fase/vocoder; considerar librería o `detune` con trade-offs); UI en el panel |
| **Setlists** | **Hecho (C4)**: otra DLL del núcleo; crear vacía o desde playlist, reordenar con `moveNode`, marcar tocadas, quitar, duración total y reproducir; persistidas en IndexedDB (`setlists`, Dexie v4) |
| **Notas** | **Hecho (C4)**: notas por pista y por playlist en IndexedDB (`notes`, clave compuesta) con autoguardado; pendiente post-entrega lo de marcas de tiempo por sección |
| **Stems (Demucs)** | Post-entrega (requiere servidor/Python); dejado documentado |

**Orden:** ~~metrónomo (C1, hecho)~~ → ~~BPM/tonalidad (C2, hecho)~~ → ~~ChordPro + transposición (C3, hecho)~~ → ~~notas/setlists (C4, hecho)~~ → LRC local (C5); pitch shift y stems, post-entrega.
**Criterio:** cada función en el panel de músicos, con i18n, persistencia y tests.

---

## 4. Login obligatorio con base de datos (DECISIÓN + IMPLEMENTAR)

**Requisito de la autora:** para usar la app **debe iniciarse sesión**; los usuarios quedan en **la base de datos**.

**Restricción real:** la SCP de AWS bloquea Cognito/Amplify/Lambda/DynamoDB; el despliegue es estático (S3+CloudFront). `CognitoAuthProvider` ya está implementado pero no se puede usar en esta cuenta.

**Opciones (decidir en modo plan):**
- **A. Auth local en IndexedDB (recomendada para la entrega):** tabla `users` (id, email, nombre, `passwordHash`, `salt`, `createdAt`, `updatedAt`), hashing **PBKDF2-SHA256** con WebCrypto (≥150k iteraciones), sesión en `localStorage` con token opaco y expiración, gate de login antes del shell (sin sesión no se ve el reproductor), logout, eliminar/exportar cuenta. Todo offline, sin backend, cumple «queda en la database» (IndexedDB).
- **B. Cognito:** cuando la cuenta AWS lo permita; `AuthProvider` ya tiene la interfaz.
- **C. Google IdP:** diferido.

**Decisiones abiertas (preguntar en plan):**
1. ¿La biblioteca existente sin usuario se conserva y se asigna al primer usuario, o se pide importar de nuevo?
2. ¿Bibliotecas separadas por usuario en el mismo navegador (clave por `userId`) o una sola compartida?
3. ¿Recuperación de contraseña? Sin backend no hay correo: opciones: pregunta secreta, código de recuperación mostrado al registrarse, o «solo local, sin recuperación».
4. ¿Se exige también para Spotify (la conexión al SDK) o solo para entrar?
5. ¿El perfil local actual (sin contraseña) se migra a usuario con contraseña?

**Criterio de cierre:** sin sesión no se accede a la app; registro/login/logout funcionan; la contraseña nunca se guarda en claro; tests de hash/verify y de gate; i18n ES/EN/PT.

**Archivos:** `src/features/auth/` (AuthProvider, AccountChip), nuevo `src/features/auth/local-auth.ts` + store, `src/features/persistence/db.ts` (tabla `users`), `src/app/App.tsx` (gate).

---

## 5. Refinar y desplegar (Día 4)

- **Refinamiento visual/funcional:** revisión final por pantallas (390/768/1024/1280/1440), estados vacíos, modo oscuro, legales, capturas comparadas con el comp.
- **Spotify:** verificar end-to-end el Web Playback SDK con la cuenta Premium (reproducción completa, cola propia con referencias, banner).
- **E2E nuevos:** búsqueda/proveedores y referencias de Spotify (con mocks), import de playlists con mocks.
- **Despliegue:** `bun run build` → bucket S3 privado → CloudFront con OAC → ACM en `us-east-1` → CNAME `app.jenilarper.dev` en name.com (pestaña DNS Records) → error 403/404 → `/index.html` 200 (SPA) → `sw.js` y `manifest.webmanifest` con `Cache-Control: no-cache`. **No desplegar hasta que la autora lo pida.**
- **Seguridad:** **rotar/desactivar la access key** expuesta (issue #27) antes de terminar.

---

## 6. Entorno y tokens (importante)

- **OpenAI:** la key de `~/.bashrc` está **vencida** (401): no se pueden generar comps con IA; se usaron mocks HTML locales.
- **Spotify:** **no hay sesión/tokens en el entorno de desarrollo**; la verificación del import y del SDK requiere el navegador de la autora (127.0.0.1) y cuenta Premium.
- **AWS:** access key expuesta en chat → rotar (#27); credenciales en `~/.aws/credentials`.
- **Audius:** no requiere token. **Jamendo:** solo `client_id` público. **LRCLIB:** no requiere token.
- **Vite:** tras agregar archivos, si la UI queda en blanco o un módulo «no exporta X»: reiniciar el server y `rm -rf node_modules/.vite` (ya pasó varias veces).

## 7. Comandos útiles

```bash
cd /home/jenifrutica/Proyectos/legato
~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort   # abrir http://127.0.0.1:5173
~/.bun/bin/bun run test        # 244 unitarios
~/.bun/bin/bun run test:e2e    # 6 E2E
~/.bun/bin/bun run build
~/.bun/bin/bun run typecheck && ~/.bun/bin/bun run lint
/home/jenifrutica/.config/opencode/skills/impeccable/scripts/impeccable detect --json src
```
