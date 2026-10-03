# Legato — Pendientes detallados (handoff de implementación)

> Documento de trabajo para la siguiente sesión (modo plan → build). Recoge **qué falta, por qué, cómo verificarlo y qué decisiones están abiertas**. El contexto histórico completo está en `docs/CONTEXTO-COMPLETO.md`; el plan del rediseño en `docs/REDISENO.md`.

- **Fecha:** 4 de octubre de 2026.
- **Estado base:** 191 unitarios + 6 E2E en verde; typecheck/lint/build OK; axe 0; detector de impeccable `[]`.
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

## 2. Ondas al ritmo de los golpes (AFINAR / VERIFICAR CON MÚSICA REAL)

**Qué hay:** las ondas son líneas finas (1.4–3.2 px) que salen del disco, con longitud, opacidad y un **pop radial** disparados por un detector de **flujo espectral** de la banda del bombo (primeros bins), umbral adaptativo (`flujo > promedio × 1.6`), **periodo refractario de 180 ms** y envolvente con vida media de 130 ms medida en milisegundos. La curva envolvente de las puntas también se ilumina con el golpe.

**Estados:** reposo/pausa → anillo corto y quieto (0% de variación medido); sonando local → onsets reales (picos cada **497 ms** con un bombo de 500 ms, 57% de variación); sonando Spotify/streaming → **pulso sintético a 120 BPM** (el audio del SDK no se puede analizar por DRM).

**Pendiente:**
- Probar con **música real** (no solo el fixture de kicks) y afinar: umbral base (0.05), factor adaptativo (1.6), refractario (180 ms), vida media (130 ms).
- Evaluar exponer un **control de sensibilidad** en la pestaña Audio (suave/normal/agresivo).
- Evaluar para streaming: control manual de **BPM** o detección por otro medio (imposible con el SDK por DRM).
- Revisar rendimiento con muchos segmentos (110) y 30 fps.

**Criterio de cierre:** con una canción con beat claro, los picos caen en los golpes a ojo de la autora; pausa quieto.

**Archivos:** `src/ui/WaveRing.tsx`, `src/player/audio-graph.ts` (smoothing 0.68). Scripts de medición en `.impeccable/review/measure-rhythm.mjs` (local, ignorado por git).

---

## 3. Módulo para músicos (IMPLEMENTAR)

**Qué hay ya:** letras sincronizadas (LRCLIB + atribución; parser LRC propio), karaoke M/S, velocidad (1×/0.9/0.75/0.5), loop A–B, panel de músicos slide-over con el modo Estructura (DLL), crossfade, bajos y ambientes.

**Pendiente (según `docs/MUSICOS.md`):**

| Función | Notas de diseño |
|---|---|
| **Metrónomo** | Click sintético con Web Audio (oscillator + envelope), BPM 30–240, compases 2/4-3/4-4/4, acento en el 1; opción «solo click» o «click sobre la música»; encaja en el panel de músicos |
| **BPM/tonalidad** | BPM manual por pista (persistido) + estimación por análisis (Web Audio: autocorrelación de onsets); tonalidad manual; sin backend |
| **ChordPro** | Parser `[Acorde]` + letra; vista de acordes sobre la letra; archivos `.cho`/`.pro` importables; sincronía opcional |
| **Transposición** | ±11 semitonos sobre ChordPro/LRC, con enarmonía correcta |
| **LRC local** | Cargar `.lrc` junto al audio (File System Access API o input) y usarlo antes que LRCLIB |
| **Pitch shift** | Cambiar tono sin cambiar tempo (fase/vocoder; considerar librería o `detune` con trade-offs); UI en el panel |
| **Setlists** | Orden de ensayo sobre las playlists (otra DLL): reordenar, marcar tocadas |
| **Notas** | Notas por pista/playlist en IndexedDB |
| **Stems (Demucs)** | Post-entrega (requiere servidor/Python); dejado documentado |

**Orden sugerido:** metrónomo → BPM/tonalidad manual → ChordPro + transposición → notas/setlists → LRC local → pitch shift → stems.
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
~/.bun/bin/bun run test        # 191 unitarios
~/.bun/bin/bun run test:e2e    # 6 E2E
~/.bun/bin/bun run build
~/.bun/bin/bun run typecheck && ~/.bun/bin/bun run lint
/home/jenifrutica/.config/opencode/skills/impeccable/scripts/impeccable detect --json src
```
