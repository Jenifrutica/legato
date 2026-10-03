# Funcionalidades

Leyenda: **[MVP]** comprometido para la entrega · **[EXTRA]** si el tiempo alcanza · **[POST]** post-entrega.

## 1. Núcleo académico — lista doblemente enlazada

- **[MVP]** `DoublyLinkedList<T>` genérica implementada a mano: nodos `{ prev, next, value }`, `head`, `tail`, `length`.
- **[MVP]** Operaciones: `prepend`, `append`, `insertAt`, `removeAt`, `removeNode`, `removeFirst/Last`, `find`, `nodeAt`, `moveNode`, `swapNodes`, `reverse`, `iterator`, `forEach`, `toArray` (solo para render).
- **[MVP]** Invariantes verificadas por tests: `head.prev === null`, `tail.next === null`, `n.next.prev === n`, sin ciclos, `length` correcto.
- **[MVP]** Playlist = lista doble de canciones; cola, historial (atrás/adelante) y orden aleatorio también como listas dobles.
- **[MVP]** Varias playlists independientes (cada una su propia lista doble).
- **[EXTRA]** Undo/redo mediante pila de comandos sobre operaciones de lista.
- **[EXTRA]** Visualizador "modo estructura": nodos, punteros y nodo actual en vivo.

## 2. Reproductor

- **[MVP]** Play/pausa, seek, volumen, mute.
- **[MVP]** Adelantar/retroceder canción (next/prev) con historial real.
- **[MVP]** Bucles: ninguna, una, toda.
- **[MVP]** Aleatorio con orden persistente y "atrás" coherente.
- **[MVP]** Velocidad 0.5x–2.0x con presets de ensayo.
- **[MVP]** Temporizador: 15/30/45/60/90 min, "al terminar N canciones", "al terminar la actual".
- **[MVP]** Media Session (controles del sistema/pantalla de bloqueo).
- **[MVP]** Mini reproductor y PWA instalable.
- **[EXTRA]** Loop A–B para practicar.
- **[POST]** Crossfade/gapless, ecualizador avanzado, normalización LUFS.

## 3. Biblioteca y CRUD (sin canciones hardcodeadas)

- **[MVP]** Importar archivos y carpetas del equipo (File API; fallback en iOS).
- **[MVP]** Extracción de metadatos (título, artista, álbum, duración, carátula).
- **[MVP]** CRUD de canciones: editar metadatos, eliminar, mover.
- **[MVP]** CRUD de playlists: crear, renombrar, duplicar, eliminar.
- **[MVP]** Búsqueda/filtro por título, artista y álbum.
- **[MVP]** Lista con scroll.
- **[POST]** Favoritos, calificaciones, export/import JSON y M3U, ordenamientos avanzados.

## 4. Drag & drop

- **[MVP]** Reordenar canciones dentro de una playlist.
- **[MVP]** Mover canciones entre playlists.
- **[MVP]** Semántica correcta: la canción en reproducción se identifica por **puntero** (`currentNode`), no por índice (corrige el bug #12).
- **[MVP]** Alternativa accesible por teclado (mover arriba/abajo) y botones.
- **[MVP]** Soporte táctil (móvil) con dnd-kit.

## 5. Interfaz (PC y móvil)

- **[MVP]** Estética vinilo/tocadiscos en tema claro (sin tema oscuro por defecto).
- **[MVP]** Disco girando con carátula, brazo y ondas reactivas al audio.
- **[MVP]** Barra inferior de reproducción con onda; fondo tipo vinilo.
- **[MVP]** Responsive con targets táctiles ≥ 44 px.
- **[MVP]** i18n ES / EN / PT.
- **[MVP]** Estados vacíos, de error y de carga cuidados.
- **[MVP]** Panel de accesibilidad (ver documento propio).
- **[EXTRA]** Animaciones pulidas con las skills de diseño.

## 6. Modo músico

- **[MVP]** Ajuste de velocidad sin perder el hilo del ensayo.
- **[EXTRA]** Loop A–B.
- **[EXTRA]** Karaoke M/S (atenuar voz por cancelación de fase).
- **[POST]** Letras y acordes (ChordPro), transposición, diagramas, LRC, BPM/tonalidad, notas por canción, setlists.

## 7. Persistencia y sesión

- **[MVP]** IndexedDB: audio, metadatos, playlists y ajustes.
- **[MVP]** Sesión persistente: canción actual, posición, orden, modo, velocidad y timer; se reanuda al recargar.
- **[POST]** Sync S3 + DynamoDB y continuidad entre dispositivos (última edición gana).

## 8. Cuenta y plataforma

- **[MVP]** Login Cognito correo/contraseña (timebox) o perfil local como fallback.
- **[MVP]** Legales: privacidad, términos, cookies y consentimiento granular (ES/EN/PT).
- **[MVP]** Deploy AWS Amplify en `app.jenilarper.dev` con HTTPS.
- **[POST]** IdP de Google, ACRCloud (tipo Shazam), Spotify (metadata), Demucs, transcodificación.

## 9. IA (post-entrega)

- **[POST]** ACRCloud: identificar canción por micrófono (proxy en backend).
- **[POST]** Spotify: búsqueda e importación de metadata (solo previews de 30 s; sin streaming completo).
- **[POST]** Demucs: separación de instrumentos (interfaz `StemProvider`).
- **[EXTRA]** Karaoke M/S como aproximación inmediata sin IA.
