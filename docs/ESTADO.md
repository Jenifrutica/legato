# Estado del proyecto

Actualizado: 3 de octubre de 2026 (Día 2 en curso).

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

## Estado técnico

- **Tests:** 154 unitarios + 4 E2E (Playwright) en verde.
- **Calidad:** typecheck + oxlint + Prettier + build en verde en cada commit.
- **Diseño:** paleta nueva **violeta/teal** (ya no crema/terracota) con **modo oscuro opcional** (botón sol/luna en la barra, persistido, el tema por portada se adapta a oscuro). Vinilo 2D grande con la portada completa, **mostrando ~1/4 sangrando por la izquierda**; ondas de barras y anillo **siempre animadas** (sintéticas sin datos del analizador, reales al reproducir local); controles del héroe con `flex-wrap` para no superponerse al panel derecho.
- **Fuentes:** Spotify (PKCE + previews + SDK Premium con banner), Audius y Jamendo con toggles; por defecto solo Spotify. **Errores de búsqueda visibles por proveedor** + botón "Probar conexión" en Ajustes. En resultados: agregar a playlist (guardar+agregar), crear playlist inline y **drag & drop** de resultados (Audius/Jamendo) sobre las playlists.
- **Pendiente:** verificación final de Spotify (el usuario reportó que conectó pero no veía canciones; ahora la UI muestra el error exacto), posible silencio CORS en streams externos, nueva funcionalidad del usuario, Día 4 (deploy).
- **Rediseño:** top bar sticky, vinilo 2D con la portada como disco completo (sin recorte, sin 3D), tema dinámico por portada en toda la interfaz con contraste AA, panel derecho con pestañas Biblioteca/Buscar/Playlists/Cola/Audio, controles de escenario en el héroe y mini reproductor móvil.
- **Fuentes:** Spotify (OAuth PKCE + búsqueda + previews 30 s + reproducción completa con Web Playback SDK), Audius (streaming completo gratis) y Jamendo (CC, client_id), con interruptores en Ajustes; por defecto solo Spotify activo.
- **Credenciales:** Spotify y Jamendo Client ID configurados en `.env.local`.
- **Bloqueo de cuenta AWS:** SCP bloquea Cognito/Amplify/Lambda/DynamoDB; deploy irá por S3 + CloudFront + ACM.

## Próximo paso

Probar en local con `bun run dev` (abrir `http://127.0.0.1:5173` si se va a conectar Spotify). Después: nueva funcionalidad pendiente por definir, pulido final y Día 4 (deploy S3 + CloudFront).

## Handoff

- **Contexto absoluto:** `docs/CONTEXTO-COMPLETO.md` (todo el proyecto, para continuar en una sesión nueva).
- **Prompt de arranque:** `docs/PROMPT-NUEVA-SESION.md` (copiar y pegar).
- Copia en Obsidian: `/home/jenifrutica/Downloads/asas/` → "Legato - Contexto completo.md" y "Legato - Prompt nueva sesion.md".

## Nota de desarrollo

Si tras agregar archivos nuevos la interfaz queda en blanco con un error de módulo en consola, es caché de Vite: reiniciar el servidor (`Ctrl+C`, `bun run dev`) o borrar `node_modules/.vite`. No afecta al build de producción.

## ⚠️ Pendiente #1: REDISEÑO COMPLETO DE LA INTERFAZ

**Dirección elegida:** **Duotono 62** — edición musical impresa a dos tintas (papel hueso, tinta negra y una tinta directa derivada de la portada). Plan por fases, contrato de dirección y validación en **`docs/REDISENO.md`**. Artefactos: comp aprobado y sidecar en `.impeccable/mocks/decision/b-duotono.png(.json)`, contrato en `.impeccable/surfaces/src-app-app-tsx.md`, `buildPath: comp`. Reglas: nada oscuro por defecto (oscuro opcional), la portada completa en el disco (círculo completo, nunca `clip-path`), UI teñida por el álbum, ondas de líneas planas saliendo del disco, una sola barra por vista, panel de músicos slide-over, letras diseñadas ahora (conexión LRCLIB/.lrc después) y Cápsula nostálgica con su carril reservado.
