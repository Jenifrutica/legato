# Rediseño de interfaz — Duotono 62

> Documento de trabajo del rediseño completo de la capa visual de Legato. Todo lo funcional se conserva; esta capa se rehace. Fuente de verdad del proceso: flujo **impeccable** (context → new-work → roll → comps → direction contract → build → detect → finish review).

- **Fecha de decisión:** 3 de octubre de 2026 (sesión 3).
- **Dirección ganadora:** **Duotono 62** (elección de la autora tras ver cuatro comps).
- **Aprobación registrada:** `.impeccable/mocks/decision/b-duotono.png.json` (`"approved": true`).
- **Contrato de dirección:** `.impeccable/surfaces/src-app-app-tsx.md`.
- **Build path:** `comp` (`.impeccable/config.json`).
- **Comp aprobado:** `.impeccable/mocks/decision/b-duotono.png` (mock HTML local capturado con Playwright 1440×1024; la key de OpenAI estaba vencida, así que no hubo generación por API).

## 1. Qué es Duotono 62

Una **edición musical impresa a dos tintas**: papel hueso, tinta negra y UNA tinta directa que sale de la portada del álbum que suena. La cola de reproducción se dibuja como una partitura (barras cuya longitud es la duración, `prev`/`next` a cada lado de un eje), y el panel de músicos se desliza como una hoja sobre la interfaz cuando se explora.

THESIS: una edición musical impresa a dos tintas donde la portada del álbum dicta el color y la cola es una partitura viva; se rechaza el reproductor oscuro de tarjetas, el gradiente decorativo y el glow.

STORY: al abrir se entiende que la música manda: media luna de vinilo arriba con la portada completa, título monumental y letra como cartel; la cola se lee como partitura y el panel de músicos se desliza solo cuando se explora.

## 2. Paleta y roles

Roles de tokens (Tailwind v4 `@theme`):

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `--color-bg` | `#F1EDE4` papel | `#0B0E14` | Fondo de página |
| `--color-surface` | `#FBF8F1` | `#12161F` | Paneles y hojas |
| `--color-surface-2` | `#E7E1D3` | `#1A202B` | Barras, filas, insets |
| `--color-ink` | `#13100C` | `#F4EFE6` | Texto y controles primarios |
| `--color-ink-muted` | `#5C5548` | `#A79E8E` | Texto secundario |
| `--color-border` | `#C7BFAE` | `#4A4438` | Reglas suaves |
| `--color-rule` | `#13100C` | `#F4EFE6` | Reglas duras de impresión |
| `--color-primary` | tinta (`#13100C`) | papel (`#F4EFE6`) | Acciones primarias (botón play, foco) |
| `--color-accent` | tinta directa del álbum (def. `#FF5B2E`) | tinta directa aclarada | Tinta directa: selección, progreso, banda de letra |
| `--color-accent-soft` | `#FBE0D6` | `#3A2218` | Tinte de la tinta directa (bandas, filas) |
| `--color-on-accent` | tinta o papel, según contraste | — | Texto sobre superficies de tinta directa |
| `--color-success` / `--color-danger` | `#2F7D4F` / `#C62828` | — | Estados |

**Derivación desde la portada** (motor `features/theme`): `paper = mix(blanco, dominante, ~0.06)`, `ink = casi negro con AA ≥ 7`, `spot = color más vibrante con AA ≥ 3 sobre papel`, `onAccent = tinta o papel con AA ≥ 4.5`. En oscuro: `bg/ink` invertidos y `spot` reajustado con AA sobre el fondo oscuro. El modo alto contraste de accesibilidad gana sobre el tema.

**Material:** radios 0, sombras duras con offset de 4–8 px (sin blur), bordes de 2 px, trama halftone sutil, desregistro de 2 px en display, sin gradientes decorativos, sin glow.

## 3. Tipografía

- **Archivo variable** (`wdth` 62–125, `wght` 100–900): display y UI. El ancho es el recurso expresivo (titular expandido, palabras condensadas en la misma frase).
- **Source Serif 4 variable**: notación, letras y panel de músicos.
- **JetBrains Mono variable**: tiempos, códigos de nodo, métricas.
- OpenDyslexic se mantiene para la opción de accesibilidad (gana sobre `--font-body`).

## 4. Héroe, vinilo y ondas

- **Héroe:** barra superior de tinta a 64 px; media luna de vinilo arriba al centro — **círculo completo posicionado fuera de pantalla, nunca recortado con `clip-path`**, para que el giro siempre sea correcto — sobre un campo plano de la tinta directa; titular Archivo hasta 88 px mezclando anchos; slug mono; letra activa en banda de tinta directa cruzando un pentagrama; progreso y transporte planos con sombra dura; carril de burbujas de la Cápsula reservado.
- **Vinilo:** la portada llena el disco; anillo de 2 px; etiqueta central con código de nodo `N-xx` y microtexto; giro respetando `prefers-reduced-motion`.
- **Ondas:** líneas planas que salen del disco, en las dos tintas del álbum, con grosores alternados al estilo de la tipografía (sin glow, sin blur), analizador real en local y beat sintético en streaming; 30 fps; se pausan con la pestaña oculta.

## 5. Panel de músicos (partitura)

Superpuesto como una **hoja deslizante con pestaña arrastrable**: minimizar, maximizar y cerrar; estado persistido; focus trap y cierre con Escape. Dentro vive la cola como partitura (barras = duración, eje central, `prev` a la izquierda y `next` a la derecha) y el **modo Estructura** de la lista doble. Es una capa para quien explora la música, no la vista por defecto.

## 6. Exploraciones descartadas

| Carta | Mundo | Resultado |
|---|---|---|
| A · Círculo armónico | Rueda de teoría/dial radial; cola circular | Descartada: motor radial más complejo de responsive |
| C · Partitura | Notación labanotation en toda la UI | Descartada como mundo completo: austera y teñido de álbum sutil; su notación vive ahora dentro del panel de músicos de Duotono |
| D · Dos tintas | Fusión B+C a dos planchas | Descartada: la autora prefirió la fuerza pura de Duotono |

## 7. Plan por fases

| Fase | Contenido | Gate |
|---|---|---|
| F0 | Tokens Duotono + fuentes + tema derivado de portada | typecheck + unit tema + build |
| F1 | Shell y barra superior | 4 E2E verdes |
| F2 | Héroe + vinilo (media luna, portada completa) | capturas 1440/390 sin superposición |
| F3 | Ondas de líneas estilo tipográfico | sin trabones; captura sonando |
| F4 | Panel derecho + partitura slide-over | a11y (focus) + E2E DnD/#12 |
| F5 | Barras móvil y navegación | 390/768 sin superposiciones |
| F6 | Playlists estrella + estructura | E2E undo/redo + #12 |
| F7 | Letras (diseño + datos de ejemplo) | tests de timing |
| F8 | Responsive 390/768/1024/1280/1440 | capturas de los 5 anchos |
| F9 | Vacíos, oscuro, legales, a11y | axe 0 violaciones |
| F10 | Validación final + docs + commits | 154 unit + 4 E2E + build + detect |
| F11 | Cápsula nostálgica (nueva funcionalidad) | por definir al arrancar |
| F12 | Letras funcionales (LRCLIB + etiquetas/.lrc) | por definir al arrancar |

## 8. Validación

- `bun run format && bun run typecheck && bun run lint && bun run test` (154 unitarios; se actualizan los tests de tokens/tema si cambian roles).
- `bun run test:e2e` (4 E2E; los selectores por `aria-label` se conservan o se actualizan junto con `tests/e2e`).
- `bun run build`.
- `impeccable detect --json <archivos cambiados>` sin hallazgos y revisión final con capturas Playwright (390/768/1024/1280/1440).
- Commits en inglés, simples, sin `Co-Authored-By`; push a `main` al cerrar cada bloque verificado.

## 9. Fuera de este rediseño

Cápsula nostálgica (F11), letras funcionales con LRCLIB/.lrc (F12), deploy del Día 4 y rotación de la access key. Nada toca el despliegue hasta que la autora lo pida.

## 10. Bitácora

| Fecha | Fase | Cambios | Verificación |
|---|---|---|---|
| 3 oct 2026 | Docs + F0 | Dirección Duotono 62 documentada (este archivo, ESTADO, DECISIONES D43–D52, CONTEXTO sesión 3). Tokens reescritos a papel/tinta/tinta directa con `rule`, `on-primary`, `on-accent`; fuentes Archivo (eje de ancho), Source Serif 4 y JetBrains Mono; fuera Fraunces/Inter; motor de tema deriva el trío con AA y variantes oscuras; mocks y comp aprobado versionados. | typecheck + lint + 154 unit + build |
| 3 oct 2026 | F1–F4 + F7 visual | Shell y TopBar de tinta; héroe con media luna (círculo completo fuera de pantalla, sin `clip-path`), titular Archivo mezclando anchos, letra activa en banda de tinta directa sobre pentagrama y pentagrama grabado; vinilo con etiqueta de nodo y ondas de líneas planas estilo tipográfico; panel con pestañas bloque naranja, cola con numerales y fila activa; pestaña «Estructura» arrastrable que abre el panel de músicos como hoja deslizante (Escape, foco, estado persistido); barra móvil y nav con bordes duros. Letra diseñada con bandera de demo local `legato.lyrics.demo` (nunca por defecto). | typecheck + lint + 154 unit + 4 E2E + build + capturas 1440/390 |
| 3 oct 2026 | F8 base + detector | Capturas 390/768/1024/1280/1440 y modo oscuro; pestañas del panel con `flex-wrap` (sin cortes en 1024); pestaña del panel de músicos movida a la costura escenario/panel para no tapar controles (el intento de gutter `pr-8` rompió un E2E y se revirtió). `impeccable detect` en cero hallazgos: se eliminaron los dos `border-l-4` (banda de letra y fila activa de la cola) por ser tells de UI generada. | typecheck + lint + 154 unit + 4 E2E + build + detect `[]` |
| 3 oct 2026 | F6 + F9 + F10 | Playlists como catálogo numerado con borde duro y cabecera tipo portada; cola dibujada como partitura (barras proporcionales a la duración); vacíos de cola y playlists en estilo impreso; tinta directa separada en campo vívido (`accent`) y texto oscuro (`accent-ink`) derivada también del álbum; auditoría **axe 0 violaciones** en claro, oscuro, móvil 390 y legales. Escritos `DESIGN.md` (formato spec con frontmatter de tokens) y `.impeccable/design.json` (rampas, sombras, movimiento, componentes y narrativa). | typecheck + lint + 154 unit + 4 E2E + build + axe 0 + detect `[]` |
| 3 oct 2026 | F11 Cápsula nostálgica | Feature diaria tipo historias: DTOs (`NostalgiaCapsule` + `CapsuleSlide`), registro local de escuchas (`legato.plays.v1`), generador determinista por fecha/usuario con contextos (obsesión, olvidada, hace un año, recién llegada), carril de tarjetas en el héroe, visor a pantalla completa (portal), 15 s por tarjeta, fragmento desde el segundo ~30, mantener para pausar, teclado (Esc/flechas/espacio), «Escuchar completa» y «Guardar en Favoritos» (playlist automática). El degradado dinámico del pedido se tradujo a **banda dura de tinta directa** para respetar la regla de no-gradientes. | typecheck + lint + 161 unit + 4 E2E + build + axe 0 + detect `[]` |
| 3 oct 2026 | F12 Letras reales | Módulo `features/lyrics`: parser LRC propio (offsets, etiquetas múltiples, metadatos), proveedor **LRCLIB** (`/api/get` con respaldo `/api/search` por duración), hook con caché, timeout de 8 s y aborto al cambiar de pista; letra activa sobre el pentagrama con atribución visible. Decisión de la autora: **siempre activo con aviso legal**; la política de privacidad (ES/EN/PT) declara el envío de título/artista/álbum a lrclib.net. El visor usa letras sincronizadas; las no sincronizadas se descartan. | typecheck + lint + 172 unit + 4 E2E + build + axe 0 + detect `[]` + captura con API interceptada |
| 4 oct 2026 | F13 Cola con punteros | `PlaybackQueue.enqueue` (`append`), `insertAfterCurrent` (`insertAt(currentIndex+1)`), `remove` y `move`; acciones nuevas en controller/store (`enqueue`, `playNext`, `removeFromQueue`, `clearQueue`, `moveInQueue`). UI: menú «＋» por fila (Biblioteca/Playlists) y en la Cápsula con «Añadir al final»/«Reproducir siguiente»; pestaña Cola con contador, «Vaciar», quitar y arrastre (`moveNode`); soltar sobre la pestaña Cola encola. Duplicados permitidos. | typecheck + lint + 178 unit + 5 E2E + build + capturas |
| 4 oct 2026 | F14 Playlists DnD | «Agregar a…» siempre visible con opción «＋ Nueva playlist» (nombre por defecto y agrega la pista); soltar sobre la pestaña Playlists agrega a la seleccionada; drop resaltado dentro de la playlist abierta aceptando biblioteca y resultados de búsqueda; reordenar interno sigue con `moveNode`. E2E nuevo de creación al vuelo. | typecheck + lint + 178 unit + 6 E2E + build + axe 0 + detect `[]` |
| 4 oct 2026 | F15–F18 | F15: rótulo del vinilo oculto con portada, campo de tinta hasta el fondo y zona más alta. F16: mini reproductor flotante arrastrable. F17: toggle de letra (héroe + panel de músicos), tira de cola cuando no hay letra y controles anclados. F18: bajos low-shelf + 4 camas de ambiente generadas. | typecheck + lint + 180 unit + 6 E2E + build + axe 0 |
| 4 oct 2026 | F19 Video mp4 | `mediaType` en la pista (compatibilidad con registros viejos), importación de mp4/mov, motor local con elemento `<video>`, visor «Ver/Ocultar video» con imagen sincronizada y audio del motor. Verificado con un mp4 real generado con ffmpeg. | typecheck + lint + 183 unit + 6 E2E + build + captura |
| 4 oct 2026 | F20 Selector de colección | Dropdown propio (botón + listbox Duotono) con truncado correcto, estado activo en bloque de tinta directa y `title` con el nombre completo; adiós al `<select>` nativo que mostraba «alo». | typecheck + lint + 183 unit + 6 E2E + captura |
