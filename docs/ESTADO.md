# Estado del proyecto

Actualizado: 4 de octubre de 2026 (sesión 6, cierre de login/sincronización y arreglos de reproductor).

## Issues

| # | Tarea | Estado |
|---|---|---|
| 1 | Repo, documentación e issues | Cerrado |
| 2 | Entorno: Bun, AWS CLI, credenciales y skills | Cerrado |
| 3 | Scaffold Vite + React + TS + Tailwind | Cerrado |
| 4 | DoublyLinkedList a mano | Cerrado |
| 5 | Tests de la lista doble (borde, property-based, #12) | Cerrado |
| 6 | Tokens de diseño + shell de UI | Cerrado |
| 7 | AuthProvider + Cognito (timebox, fallback local) | Cerrado |
| 8 | Player engine + cola sobre lista doble | Cerrado |
| 9 | Importar archivos/carpetas + metadatos | Cerrado |
| 10 | CRUD canciones y playlists | Cerrado |
| 11 | Drag & drop con fix #12 + teclado | Cerrado |
| 12 | UI vinilo + ondas + mini player | Cerrado |
| 13 | Modo estructura (visualizador DLL) | Cerrado |
| 14 | i18n ES/EN/PT | Cerrado |
| 15 | IndexedDB + sesión persistente | Cerrado |
| 16 | Timer + shuffle/bucles + scroll | Cerrado |
| 17 | Accesibilidad WCAG 2.2 AA | Cerrado |
| 18 | Páginas legales + cookies | Cerrado |
| 19–21 | Extras: ensayo, undo/redo, karaoke M/S | Cerrado |
| 22 | E2E smoke + regresión #12 | Cerrado |
| 23–27 | Día 4: pulido, responsive, deploy S3+CloudFront, docs, rotar key | Pendiente |
| 28–33 | Post-entrega | Pendiente |
| 34 | Calidad de audio premium + balance/aislamiento L-R | Cerrado |
| 35 | Selección de dispositivo de salida | Cerrado |
| 36 | Jam en tiempo real y playlists compartidas | Post-entrega (diseñado en docs/JAM.md) |
| 37 | Modo offline (PWA) | Cerrado |
| 38 | Crossfade configurable | Cerrado |
| 39 | Rediseño Hi-Fi vivo + vinilo 3D + tema por portada | Cerrado (vinilo ahora 2D con portada completa, sin recorte) |
| 40 | Fuentes conmutables (Spotify por defecto, Jamendo, Audius) + Ajustes | Cerrado |
| 41 | Integración de pistas online con listas dobles | Cerrado (reproducir desde la búsqueda y guardar Audius/Jamendo en biblioteca) |
| 42 | Web Playback SDK de Spotify (reproducción completa Premium) | Cerrado (banner de control; el audio lo maneja Spotify, no pasa por nuestro DSP) |
| 43 | Nueva paleta violeta/teal + modo oscuro opcional | Cerrado |
| 44 | Vinilo grande mostrando ~1/4 sangrando por la izquierda | Cerrado |
| 45 | Ondas gráficas siempre vivas (sintéticas sin datos, reales al reproducir) | Cerrado |
| 46 | Diagnóstico de Spotify (errores visibles + probar conexión) | Cerrado |
| 47 | Agregar a playlist desde la búsqueda + crear playlist + drag & drop | Cerrado |
| 48 | Rediseño completo de interfaz — dirección **Duotono 62** (plan en `docs/REDISENO.md`) | Rediseño cerrado (F0–F10): 154 unit + 4 E2E, axe 0, detector 0. F12 letras reales pendiente |
| 49 | **Cápsula nostálgica** (nueva funcionalidad): carrusel diario tipo historias con fragmentos, etiquetas de contexto y favoritos | Cerrada: 161 unit + 4 E2E, axe 0, detector 0 |
| 50 | **Letras reales**: parser LRC propio + LRCLIB (siempre activo con aviso legal en privacidad), atribución visible y estados de carga/vacío | Cerrada: 172 unit + 4 E2E, axe 0, detector 0 |
| 51 | **Cola intuitiva (F13)**: añadir al final / reproducir siguiente desde cada fila y la cápsula, quitar, reordenar por arrastre, vaciar y soltar sobre la pestaña Cola | Cerrada: 178 unit + 5 E2E, axe 0, detector 0 |
| 52 | **Playlists DnD (F14)**: «Agregar a…» siempre visible con «＋ Nueva playlist» al vuelo, zonas de drop resaltadas, soltar sobre la pestaña Playlists y drop de búsqueda/biblioteca dentro de la playlist | Cerrada: 178 unit + 6 E2E, axe 0, detector 0 |
| 53 | **Disco (F15)**: rótulo «Lado A · 33⅓» oculto cuando hay portada; campo de tinta extendido hasta el fondo (sin banda que cruce el disco); zona más alta y ondas contenidas | Cerrada: 178 unit + 6 E2E + build |
| 54 | **Mini reproductor (F16)**: vinilo flotante abajo-derecha en escritorio cuando hay pista, arrastrable (posición persistida), clic = play/pausa, teclado accesible | Cerrada: 178 unit + 6 E2E + captura |
| 55 | **Letras y hueco (F17)**: toggle «Letra» en héroe y panel de músicos (persistido), tira de cola (anterior · sonando · siguiente) cuando no hay letra y controles anclados al fondo del héroe | Cerrada: 178 unit + 6 E2E, axe 0, detector 0 |
| 56 | **Bajos y ambiente (F18)**: refuerzo low-shelf 0–12 dB en el grafo + 4 camas generadas (lluvia, vinilo, café, viento) con volumen propio, apagadas por defecto y persistidas | Cerrada: 180 unit, sin errores al activar |
| 57 | **Video mp4 (F19)**: importación con `mediaType`, motor local basado en `<video>`, visor con «Ver/Ocultar video» sincronizado (imagen) y audio por el motor | Cerrada: 183 unit + 6 E2E, axe 0, detector 0, captura con mp4 real |
| 58 | **Selector de colección (F20)**: dropdown propio con truncado correcto y lista de biblioteca + playlists (reemplaza el select nativo que mostraba «alo») | Cerrada: typecheck + lint + 183 unit + 6 E2E + captura |
| 59 | **Ajustes de feedback**: íconos de anterior/siguiente corregidos (estaban espejados), ondas de líneas más grandes y rítmicas (tinta + agujas de acento), mini reproductor por encima de cualquier pantalla (widget, z-60), botón «＋» de playlists con lista desplegable en filas de biblioteca y resultados descargables | Cerrada: 183 unit + 6 E2E, axe 0, detector 0 |
| 60 | **Cola desde búsqueda y mini flotante real (F21)**: botón de cola en cada resultado (guardar+`enqueue` en la DLL para Audius/Jamendo; cola de Spotify vía API si hay sesión), `PlaylistPicker` también en las filas de la cola, y **Picture-in-Picture de documento** para el mini reproductor (ventana siempre encima, fuera del navegador) | Cerrada: 183 unit + 6 E2E, axe 0, detector 0, PiP verificado en Chromium |
| 61 | **Cola de Spotify arreglada**: la API exige dispositivo; ahora se envía el `device_id` del SDK, y si no existe se inicializa el reproductor y se reintenta; mensajes específicos (Premium, sesión, sin dispositivo) | Cerrada: 183 unit + 6 E2E + build |
| 62 | **La cola es «Lista» (DLL local)**: Spotify solo reproduce la canción (sin cola de Spotify); la pestaña se renombra a Lista con leyenda «doble enlace», y solo se alimenta de tus estructuras (biblioteca guardada, Audius/Jamendo, arrastres) | Cerrada: 183 unit + 6 E2E, axe 0, detector 0 |
| 63 | **Referencias de Spotify en tus estructuras**: los botones «＋ playlist» y «Lista» aparecen también en resultados de Spotify; la pista se guarda como referencia externa (metadatos + URI, sin audio) en biblioteca/playlists/Lista, y al sonar la reproduce el SDK con la Lista mandando el orden y avanzando al terminar | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 64 | **Ajustes finos**: «Nueva playlist» abre una ventanita para escribir el nombre (no auto-crea), la canción pulsada en Spotify suena primero (no la primera de la búsqueda), crossfade visible en el panel de Audio (0–12 s) y ondas más grandes (líneas de hasta 9 px, longitud ×2.2, zona más alta) | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 65 | **Arreglos de reproducción**: el avance automático reanuda el AudioContext (antes podía avanzar en silencio), el slider de progreso ya no se traba (estado local de arrastre en héroe y barra móvil) y las ondas pasan a **líneas finas y largas** (1.4–3.2 px, papel sobre el campo naranja, tinta fuera) | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 66 | **Ondas v5 y disco más grande**: disco `min(46rem, 80vw, 72dvh)`, zona 0.72, lienas hasta 0.19× con respuesta suavizada (raíz) y una **curva fina que envuelve las puntas** (trazada con curvas cuadráticas), en papel sobre el campo y tinta fuera | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 67 | **Playlists de Spotify + ritmo real**: botón «Importar de Spotify» en Playlists (trae tus playlists de la cuenta como referencias externas, tope 100 pistas), rótulo «Lado A · 33⅓» eliminado y ondas dirigidas por **detección de golpes** (audio local) o **pulso a 120 BPM** (streaming) | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 68 | **Detección de golpes sensible**: sin umbral fijo sobre el promedio (cualquier subida del bajo cuenta), ganancia ×5 con envolvente rápida (decaimiento 0.82), analizador más reactivo (smoothing 0.68) y **el golpe multiplica toda la línea** (hasta ×2.6), la opacidad y un **pop radial** de la ronda | Cerrada: 187 unit + 6 E2E, axe 0, detector 0 |
| 69 | **Ondas en el estado correcto**: reposo dibuja un anillo quieto (0% de variación), al sonar late (42–52% medido) y al pausar vuelve exactamente al reposo; el modo sintético (Spotify) solo se usa **mientras suena y sin señal real** | Cerrada: 190 unit + 6 E2E, axe 0, detector 0 |
| 70 | **Import de playlists de Spotify arreglado**: Spotify renombró `track`/`tracks` a `item`/`items`; se leen ambas formas, se cae de `/tracks` a `/items` en 400/404 y el mapeo es defensivo (álbum, artistas, URL externa) | Cerrada: 190 unit (3 tests nuevos del parser) |
| 71 | **Ondas sincronizadas al golpe**: detector por **flujo espectral** de la banda del bombo con umbral adaptativo y periodo refractario (180 ms), envolvente de vida media 130 ms medida en milisegundos y el golpe dominando largo/opacidad/pop. Medido con bombo a 500 ms: picos cada 497 ms y 57% de variación | Cerrada: 190 unit + 6 E2E, axe 0, detector 0 |
| 72 | **Import de playlists resistente**: límites descendentes (50→20→10) como en la búsqueda, reintento en 429, paginación hasta 200 playlists y **mensaje de error exacto** con pistas para 401/403 | Cerrada: 191 unit + 6 E2E, axe 0, detector 0 |
| 73 | **Cierre y handoff de la sesión 4**: documentación total (`docs/PENDIENTES.md`), prompt de próxima sesión en modo plan, limpieza de tokens de Spotify al fallar el refresh y botón «Conectar Spotify de nuevo» en el panel de import | Cerrada: 191 unit + 6 E2E, axe 0, detector 0 |
| 74 | **Ondas v6 (fase B)**: detector dedicado al bombo (40–150 Hz, `fftSize` 1024 sin suavizado) separado del analizador de dibujo; control **suave / normal / agresiva** persistido; **BPM manual con tap tempo** para streaming (Spotify por DRM usa pulso sintético); pistas de prueba generadas con ffmpeg para validar | Cerrada: 202 unit + 6 E2E, build, axe 0, detector 0; pendiente validación auditiva de la autora |
| 75 | **Metrónomo (C1)**: motor Web Audio con lookahead (30–240 BPM, compases 2/4 · 3/4 · 4/4 · 6/8 con acento en el 1 y el 4, volumen propio), programador puro con tests, tap tempo; **toggle «Modo músico» en Ajustes** y pestaña **Práctica** en el panel de músicos | Cerrada: 211 unit + 6 E2E, build, detector 0, verificado en navegador |
| 76 | **BPM y tonalidad por pista (C2)**: estimador propio (paso-bajos 150 Hz + envolvente de ataques + autocorrelación con corrección de octava) que acierta 120/100 en las pistas de prueba; edición manual; persistencia por pista en IndexedDB (tabla `analysis`, Dexie v2) y botón «Usar en el metrónomo» | Cerrada: 220 unit + 6 E2E, build, detector 0, verificado en navegador (detecta 120 y persiste tras recargar) |
| 77 | **ChordPro propio (C3)**: parser de directivas, secciones, comentarios y `[Acorde]letra`; transposición ±11 semitonos con enarmonía y bajo de acordes con barra; pestaña **Acordes** con importación `.cho/.pro`, editor, vista de acordes sobre la letra (`<ruby>`) y hojas persistidas por pista (tabla `chords`, Dexie v3) | Cerrada: 232 unit + 6 E2E, build, detector 0, verificado en navegador (G→A y persiste tras recargar) |
| 78 | **Setlists y notas (C4)**: setlists sobre otra **DLL del núcleo** (crear vacía o desde playlist, reordenar con `moveNode`, marcar tocadas, quitar, duración total, reproducir), notas por pista y por playlist con autoguardado; pestañas **Setlist** y **Notas**; persistencia en IndexedDB (tablas `setlists` y `notes`, Dexie v4) | Cerrada: 244 unit + 6 E2E, build, detector 0, verificado en navegador (reordenar, tocada y notas persisten tras recargar) |
| 79 | **Letra local .lrc (C5)**: carga de `.lrc` por pista con prioridad sobre LRCLIB, atribución «Letra local» en el héroe, editor en la pestaña Notas y persistencia en IndexedDB (tabla `lyrics`, Dexie v5) | Cerrada: 248 unit + 6 E2E, build, detector 0, verificado en navegador (prioridad y persistencia tras recargar) |
| 80 | **Acordes automáticos con la letra (C6)**: detección desde el audio sin trabajo manual (FFT propia + perfil cromático + 24 tríadas mayores/menores + suavizado temporal), guardada por pista y alineada línea a línea con la letra local/LRCLIB; editor manual ChordPro queda plegado como opción avanzada; bajos ahora también atenúan (−12..12 dB) como aislamiento aproximado | Cerrada: 255 unit + 6 E2E, build, detector 0, verificado en navegador (progresión C·G·Am·F sobre la letra) |
| 81 | **Spotify: análisis de beats y acordes (C7)**: se consulta `/v1/audio-analysis` de la pista para obtener la **rejilla de golpes** (ondas perfectas) y el **croma por segmento** (acordes con la letra, reutilizando el detector); también rellena BPM y tonalidad; el pulso sintético queda **anclado a la posición de la pista** (interpolada entre sondeos) y el panel muestra el error exacto si Spotify ya no expone el análisis | Cerrada: 262 unit + 6 E2E, build, detector 0; verificado con la cuenta (403) y **fallback por preview de 30 s** |
| 82 | **Tap tempo con fase + diagnóstico de audio (C8)**: los toques fijan **BPM y fase** (las ondas pegan donde marcas) y se guardan **por pista** en Spotify (`beatOffset`); el preview usa `market=from_token` y el panel distingue «sin preview» de «preview no analizable»; el grafo avisa en consola si no puede crearse y `window.__legato` queda como enganche de depuración solo-dev | Cerrada: 265 unit + 6 E2E (tras limpiar caché de Vite), build, detector 0 |
| 83 | **Acorde en vivo (C9)**: indicador grande del **acorde vigente + siguiente** sincronizado a la posición (local o Spotify), resaltado de la línea de letra y de la fila de la línea de tiempo; aviso para cargar `.lrc` cuando no hay letra; `activeChordIndex` puro con tests | Cerrada: 267 unit + 6 E2E, build, detector 0, verificado en navegador (C→G→Am→F en vivo) |
| 84 | **Modo micrófono (C10)**: la app escucha la sala (permiso, audio 100 % local) y en vivo estima **acordes** (croma + voto mayoritario) y **golpes** (banda del bombo con `BeatDetector`, compensación de latencia 80 ms); las ondas latan con el beat real; al detener guarda por pista BPM, fase, beats y acordes (origen `mic`) sin pisar el análisis de archivo local; disponible siempre (pestaña Audio y Acordes) | Cerrada: 279 unit + 7 E2E (micrófono falso de Chromium), build, detector 0 |
| 85 | **Rollback de acordes automáticos (R)**: tras comprobar que el detector clásico no da acordes fiables en música real, la detección automática (local, Spotify y micrófono) queda **archivada tras la bandera `legato.chords.auto`** (apagada por defecto); la pestaña Acordes queda con el **editor manual ChordPro** como contenido principal y una **guía visible de importación/formato/guardado**; el micrófono conserva beats, BPM y fase para las ondas; el intento de análisis de Spotify también queda tras la bandera | Cerrada: 281 unit + 7 E2E, build, detector 0, verificado en navegador (solo editor + ayuda) |
| 90 | **Audio en Firestore (sin Storage)**: Firebase Storage exige Blaze (tarjeta), así que los archivos se guardan **troceados** en Firestore (`fileManifests` + `fileChunks`, trozos de 700 KB, base64) tras la misma abstracción de backend; el panel pasa a **«Pendiente de configurar»** si Firestore/reglas no están listos; E2E con proveedor local en el puerto 5174 | Cerrada: 305 unit + 10 E2E, build, detector 0 |
| 89 | **Sincronización en la nube (N)**: cada usuario tiene sus datos en **Firestore** (canciones, playlists, sesión, análisis, acordes, letras, setlists, notas) y sus **audios/portadas troceados en Firestore** (`fileManifests` + `fileChunks`, porque Storage exige Blaze); fusión por registro con `updatedAt` + **lápidas** de borrado, subida con debounce, bajada al iniciar sesión (con progreso) y **toggle en Ajustes**; funciona solo con Firebase configurado. Diseño, backend y tests con backend en memoria | Cerrada: 300 unit + 10 E2E, build, detector 0 |
| 88 | **Login obligatorio (D)**: puerta de entrada con **Firebase** (correo/contraseña + Google, verificación por email y recuperación real) y **respaldo local** con cuentas en IndexedDB (PBKDF2-SHA256 310k, sesiones opacas de 7 días); datos **por usuario** (biblioteca, playlists, sesión, análisis, acordes, letras, setlists, notas, tokens de Spotify y cápsula) con **migración de los datos actuales al primer usuario**; eliminar cuenta; E2E con login. Configuración de Firebase guiada en `docs/AUTH.md` | Cerrada: 290 unit + **9 E2E**, build, detector 0, axe 0 (incluye la pantalla de acceso) |
| 87 | **Ondas: margen dinámico del bombo**: los analizadores (local y micrófono) pasan a `-90..-10 dB`; con el rango por defecto (`-100..-30`) un bajo continuo saturaba la banda y aplastaba el flujo del golpe. Medido: pista de 120 BPM → 15 golpes/6 s (antes 13 con banda saturada al 98 %); pista sin bombo → 0. Pulso de golpe más visible (×3). Añadida pista en la pestaña Audio sobre cuándo siguen el beat real | Cerrada: 281 unit + 7 E2E, build, detector 0, medido en navegador |
| 86 | **Stems con Demucs (S)**: script `scripts/practice-mix.sh` con Docker (imagen CPU propia `legato-demucs` + caché de modelos, etiquetas `:z` para SELinux de Fedora) que separa y deja **mezclas listas para importar**: «sin voz» (4 stems) y con `--guitar` «sin voz», «sin guitarra», «solo batería» y «solo bajo» (6 stems); `docs/STEMS.md` con uso y práctica en Legato | Cerrada: probado end-to-end con un clip (separación en ~6 s, MP3s con audio verificado); 281 unit + 7 E2E, build, detector 0 |
| 91 | **Volumen y velocidad con Spotify en móvil**: el volumen se conecta al Web Playback SDK (no al DSP local) y el control de volumen/velocidad aparece en la barra inferior móvil | Cerrada: +1 test de volumen (`spotify-store`), typecheck + lint + build |
| 92 | **Velocidades más rápidas**: ciclo del control a **1→1.25→1.5→2→0.9→0.75→0.5** (antes máximo 1×); el panel de ensayo lista todas las tasas | Cerrada: typecheck + lint + build |
| 93 | **Local no confundido con Spotify**: con Spotify en pausa y una pista local sonando, `spotifyActive` dependía del proveedor y no de la pista externa real; ahora solo las referencias externas cuentan | Cerrada: +1 test (`external-track`), typecheck + lint + build |
| 94 | **Aviso de velocidad en Spotify**: el SDK/DRM no permite cambiar la velocidad; en vez de dejar el control deshabilitado sin explicación, se muestra un aviso | Cerrada: 312 unit + 13 E2E, build, detector 0 (pendiente decidir si se **oculta** el control en Spotify, pedido de la autora) |
| 95 | **Google como vía principal + verificación alcanzable (D)**: el botón de Google pasa a ser la acción principal con nota «sin correo de verificación»; al crear cuenta o entrar con correo sin confirmar se mantiene la sesión y se muestra la pantalla de verificación (reenviar, «ya lo confirmé», Google) en lugar de cerrar la sesión. axe de la pantalla de verificación añadido | Cerrada: 313 unit (axe nuevo) + typecheck + lint + build + E2E, detector 0 |
| 97 | **Cuadrado del disco, ondas y letras**: campo de tinta a `1.08×` y zona recortada por abajo a `0.62×` (ondas sin chocar); ondas con más rango dinámico (suavizado 0.65, gamma `^1.55`, pulso ×3.4); la letra cambia de línea 0.25 s antes de su marca y el héroe enseña la siguiente en los huecos para quitar el retraso; la letra se mantiene al pausar (solo se oculta si no hay líneas) | Cerrada: 317 unit + 13 E2E, build, detector 0 |
| 96 | **Ocultar la velocidad en Spotify**: el control de velocidad desaparece en héroe, barra móvil y panel de ensayo cuando la fuente es Spotify (el SDK/DRM no permite cambiarla); en archivos locales se mantiene el ciclo 1→1.25→1.5→2→0.9→0.75→0.5. Se retira el aviso y la clave i18n huérfana | Cerrada: 313 unit + typecheck + lint + build + E2E, detector 0 |

## Estado técnico

- **Tests:** 317 unitarios + 13 E2E (Playwright) en verde.
- **Calidad:** typecheck + oxlint + Prettier + build en verde en cada commit.
- **Diseño:** paleta nueva **violeta/teal** (ya no crema/terracota) con **modo oscuro opcional** (botón sol/luna en la barra, persistido, el tema por portada se adapta a oscuro). Vinilo 2D grande con la portada completa, **mostrando ~1/4 sangrando por la izquierda**; ondas de barras y anillo **siempre animadas** (sintéticas sin datos del analizador, reales al reproducir local); controles del héroe con `flex-wrap` para no superponerse al panel derecho.
- **Fuentes:** Spotify (PKCE + previews + SDK Premium con banner), Audius y Jamendo con toggles; por defecto solo Spotify. **Errores de búsqueda visibles por proveedor** + botón "Probar conexión" en Ajustes. En resultados: agregar a playlist (guardar+agregar), crear playlist inline y **drag & drop** de resultados (Audius/Jamendo) sobre las playlists.
- **Pendiente:** verificación final de Spotify (el usuario reportó que conectó pero no veía canciones; ahora la UI muestra el error exacto), posible silencio CORS en streams externos, nueva funcionalidad del usuario, Día 4 (deploy).
- **Rediseño:** top bar sticky, vinilo 2D con la portada como disco completo (sin recorte, sin 3D), tema dinámico por portada en toda la interfaz con contraste AA, panel derecho con pestañas Biblioteca/Buscar/Playlists/Cola/Audio, controles de escenario en el héroe y mini reproductor móvil.
- **Fuentes:** Spotify (OAuth PKCE + búsqueda + previews 30 s + reproducción completa con Web Playback SDK), Audius (streaming completo gratis) y Jamendo (CC, client_id), con interruptores en Ajustes; por defecto solo Spotify activo.
- **Credenciales:** Spotify y Jamendo Client ID configurados en `.env.local`.
- **Bloqueo de cuenta AWS:** SCP bloquea Cognito/Amplify/Lambda/DynamoDB; deploy irá por S3 + CloudFront + ACM.

## Próximo paso

Pendiente: (1) **fase A**: diagnosticar el import de playlists de Spotify en el navegador de la autora (403 scope / 401 refresh); (2) **fase E**: refinar + deploy S3/CloudFront + `app.jenilarper.dev` y rotar la access key. La verificación de login con Firebase se resuelve con **Google** como vía principal (el correo propio queda post-demo). El «error de conexión» reportado no se pudo reproducir y la autora lo dio por descartado. Detalle en **`docs/PENDIENTES.md`**.

## Handoff

- **Contexto absoluto:** `docs/CONTEXTO-COMPLETO.md` (todo el proyecto, para continuar en una sesión nueva).
- **Prompt de arranque:** `docs/PROMPT-NUEVA-SESION.md` (copiar y pegar).
- Copia en Obsidian: `/home/jenifrutica/Downloads/asas/` → "Legato - Contexto completo.md" y "Legato - Prompt nueva sesion.md".

## Nota de desarrollo

Si tras agregar archivos nuevos la interfaz queda en blanco con un error de módulo en consola, es caché de Vite: reiniciar el servidor (`Ctrl+C`, `bun run dev`) o borrar `node_modules/.vite`. No afecta al build de producción.

## ⚠️ Pendiente #1: REDISEÑO COMPLETO DE LA INTERFAZ

**Dirección elegida:** **Duotono 62** — edición musical impresa a dos tintas (papel hueso, tinta negra y una tinta directa derivada de la portada). Plan por fases, contrato de dirección y validación en **`docs/REDISENO.md`**. Artefactos: comp aprobado y sidecar en `.impeccable/mocks/decision/b-duotono.png(.json)`, contrato en `.impeccable/surfaces/src-app-app-tsx.md`, `buildPath: comp`. Reglas: nada oscuro por defecto (oscuro opcional), la portada completa en el disco (círculo completo, nunca `clip-path`), UI teñida por el álbum, ondas de líneas planas saliendo del disco, una sola barra por vista, panel de músicos slide-over, letras diseñadas ahora (conexión LRCLIB/.lrc después) y Cápsula nostálgica con su carril reservado.
