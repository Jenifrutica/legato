# Legato — Pendientes detallados (handoff de implementación)

> Documento de trabajo para la siguiente sesión (modo plan → build). Recoge **qué falta, por qué, cómo verificarlo y qué decisiones están abiertas**. El contexto histórico completo está en `docs/CONTEXTO-COMPLETO.md`; el plan del rediseño en `docs/REDISENO.md`; y el prompt de arranque en **`docs/PROMPT-PLAN-NUEVA-SESION.md`**.

- **Fecha:** 4 de octubre de 2026 (sesión 6: cierre de login/sincronización y arreglos de reproductor).
- **Estado base:** 325 unitarios + 17 E2E en verde; typecheck/lint/build OK; axe 0; detector de impeccable `[]`.
- **Orden actual:** B → C (músicos) → D (login) → **N (sync, hecho)** → A (import de Spotify, justo antes del deploy) → E (deploy). B, C, D y N están cerrados; solo quedan A, E y las verificaciones manuales de login.
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

**Diagnóstico confirmado (sesión 7, con la cuenta real):**
- `/me/playlists` responde **200** (la lista de playlists carga) pero `/playlists/{id}/tracks` responde **403** al importar.
- La app está en **Development mode** y **User Management está vacío (`0/5 added`)**: en ese estado Spotify bloquea la lectura de pistas a apps nuevas. La solución principal es **añadir la cuenta** en `developer.spotify.com → app Legato → User Management → Add user`. Es una acción en el dashboard (la autora), no en el código.
- Fallback de código: si el 403 persistiera (scope), el panel ahora ofrece un botón de **reconexión limpia** (`reconnectSpotify` borra tokens y vuelve a autorizar) e indica el caso Development mode.

**Cómo añadir una cuenta en User Management (paso a paso):**
1. Entra a **https://developer.spotify.com/dashboard** e inicia sesión con la cuenta **dueña de la app** (`Chenife`).
2. Abre la app **Legato** (`Client ID af94497d…`).
3. Pestaña **User Management**.
4. En **Full Name** escribe el nombre; en **Email**, el correo **de la cuenta de Spotify** que quieres autorizar (la tuya o la de tu profe).
5. Pulsa **Add user**. Debe aparecer en la tabla y el contador subir a **1/5**, **2/5**…
6. En la app: recarga (`Ctrl+Shift+R`) y **Playlists → Importar de Spotify**. El import ya funciona **exacto** (por ID).
- **Límite:** 5 cuentas. Para uso abierto sin lista, en la misma app pide **Extended Quota** (revisión de Spotify, tarda días).
- Importante: la cuenta que autoriza la app (login de Spotify en la app) **debe** estar en esta lista, si no, `/playlists/{id}/tracks` da 403.

**Arreglo aplicado (código):**
- `fetchWithRetry` reintenta una vez tras el refresco del token ante **401** (reloj desfasado), no solo en 429.
- `reconnectSpotify()` fuerza autorización limpia para garantizar `playlist-read-private`.
- El panel distingue 403 (permiso / Development) de 401 y muestra el **error crudo** de Spotify + pista de User Management.
- **Fallback por búsqueda (opción B) — verificado y descartado**: se intentó leer los nombres de las pistas por `/playlists/{id}?fields=…` y resolverlos con `/search`. Con la cuenta real el resultado fue **`nombres leídos = 0`**: Spotify **también bloquea** esa vía en Development mode. Se retiró la búsqueda por nombre de playlist (traía temas que no eran); ahora se lanza `dev-mode-restricted` y el panel explica que hay que **añadir la cuenta en User Management** (hasta 5) o pedir **Extended Quota** (uso abierto, tarda días). 3 tests del fallback (nombres, forma nueva, restricción).

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
- Pistas de prueba fuera del repo: `~/Downloads/legato-ritmo-120bpm.wav`, `~/Downloads/legato-ritmo-100bpm.wav` y `~/Downloads/legato-acordes.wav` (C·G·Am·F, 8 s).
- **Spotify (C7)**: se consulta `/v1/audio-analysis` de la pista para obtener la rejilla de beats (ondas exactas) y el croma (acordes con la letra); el pulso sintético ya queda anclado a la posición de la pista. **Verificado con la cuenta: 403**, así que se añadió fallback por preview de 30 s; si no hay preview, en Spotify quedan **tap tempo con fase** (BPM y anclaje por pista) y el editor ChordPro.

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
| **Metrónomo** | **Hecho (C1), con arreglo pendiente**: motor Web Audio con lookahead, BPM 30–240, compases 2/4 · 3/4 · 4/4 · 6/8 (acento en 1 y 4), tap tempo, volumen; pestaña Práctica. La autora no entiende bien su uso y falta indicador visual/sincronía con la pista: **plan detallado en `docs/METRONOMO.md`** |
| **BPM/tonalidad** | **Hecho (C2)**: estimador propio (paso-bajos + envolvente de ataques + autocorrelación), BPM manual y tonalidad manual persistidos por pista (IndexedDB, tabla `analysis`), botón «Usar en el metrónomo». Verificado con las pistas de prueba (120/100 exactos) |
| **ChordPro** | **Hecho (C3/R)**: editor manual con importación `.cho/.pro`, transporte y guía visible; la **detección automática quedó archivada** tras la bandera `legato.chords.auto` (no daba acordes fiables) |
| **Transposición** | **Hecho (C3)**: ±11 semitonos sobre ChordPro (acordes con barra y enarmonía correcta); solo cambia la vista, la hoja original no se toca |
| **LRC local** | **Hecho (C5)**: cargar `.lrc` por pista desde la pestaña Notas, con prioridad sobre LRCLIB y persistencia en IndexedDB (`lyrics`, Dexie v5) |
| **Pitch shift** | Cambiar tono sin cambiar tempo (fase/vocoder; considerar librería o `detune` con trade-offs); UI en el panel |
| **Setlists** | **Hecho (C4)**: otra DLL del núcleo; crear vacía o desde playlist, reordenar con `moveNode`, marcar tocadas, quitar, duración total y reproducir; persistidas en IndexedDB (`setlists`, Dexie v4) |
| **Notas** | **Hecho (C4)**: notas por pista y por playlist en IndexedDB (`notes`, clave compuesta) con autoguardado; pendiente post-entrega lo de marcas de tiempo por sección |
| **Stems (Demucs)** | **Hecho (S)**: `scripts/practice-mix.sh` con Docker separa y genera mezclas de práctica («sin voz», «sin guitarra», «solo batería», «solo bajo»); ver `docs/STEMS.md`. La integración dentro de la web con servidor local queda como mejora futura; aproximaciones DSP (karaoke M/S, canales, bajos) siguen disponibles |

**Orden:** ~~metrónomo (C1, hecho)~~ → ~~BPM/tonalidad (C2, hecho)~~ → ~~ChordPro + transposición (C3, hecho)~~ → ~~notas/setlists (C4, hecho)~~ → ~~LRC local (C5, hecho)~~. **Módulo de músicos completo** (+ C6: acordes automáticos con la letra); pitch shift y stems, post-entrega.
**Criterio:** cada función en el panel de músicos, con i18n, persistencia y tests.

---

## 4. Login obligatorio con base de datos (IMPLEMENTADO)

> **Hecho (D)**: Firebase Auth (correo/contraseña + Google, verificación y recuperación) con respaldo local PBKDF2 en IndexedDB; puerta obligatoria, datos por usuario con migración al primero, tokens de Spotify por usuario, eliminar cuenta. Configuración paso a paso en **`docs/AUTH.md`**.
>
> **Hecho (N)**: sincronización en la nube por usuario en Firestore; audios/portadas **troceados en Firestore** (`fileManifests` + `fileChunks`, 700 KB) porque Storage exige el plan Blaze; fusión por `updatedAt` + lápidas, subida con debounce, bajada al entrar (con progreso) y toggle en Ajustes.
>
> **Resuelto en la sesión 7 (Google principal):** el correo de verificación de Firebase no llega (spam, remitente `*firebaseapp.com`), así que **Google pasa a ser la acción principal** del login y la **pantalla de verificación** (reenviar / «ya lo confirmé» / Google) ahora sí es alcanzable al crear cuenta o entrar con correo sin confirmar. Configurar SMTP propio queda post-demo. El «error de conexión» reportado **no se pudo reproducir y la autora lo descartó**. Pendiente solo la verificación manual del flujo con la cuenta real (Google, recuperación, cambio de cuenta y eliminación).

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

## 4b. Ocultar el control de velocidad en Spotify (HECHO)

**Motivo:** el Web Playback SDK de Spotify reproduce por DRM y **no permite cambiar la velocidad**; el control nunca surte efecto en una pista de Spotify.

**Hecho:** el control de velocidad se **oculta** cuando la fuente es Spotify (`!spotifyActive`) en `src/ui/Hero.tsx`, `src/ui/PlayerBar.tsx` (barra móvil) y la sección de velocidad de `src/ui/PracticePanel.tsx`; en archivos locales se mantiene el ciclo **1→1.25→1.5→2→0.9→0.75→0.5**. Se retiraron el estado `speedNotice` y la clave i18n `player.speedSpotify` (ES/EN/PT). Verificado con los E2E de velocidad en local y detector `[]`.

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
~/.bun/bin/bun run test        # 325 unitarios
~/.bun/bin/bun run test:e2e    # 13 E2E (modo local, puerto 5174)
~/.bun/bin/bun run build
~/.bun/bin/bun run typecheck && ~/.bun/bin/bun run lint
/home/jenifrutica/.config/opencode/skills/impeccable/scripts/impeccable detect --json src
```
