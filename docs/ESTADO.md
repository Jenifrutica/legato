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
| 39 | Rediseño Hi-Fi vivo + vinilo 3D + tema por portada | Cerrado |
| 40 | Fuentes conmutables (Spotify por defecto, Jamendo, Audius) + Ajustes | En curso |

## Estado técnico

- **Tests:** 149 unitarios + 4 E2E (Playwright) en verde.
- **Calidad:** typecheck + oxlint + Prettier + build en verde en cada commit.
- **Rediseño:** top bar sticky, vinilo 3D sangrando por la izquierda (R3F lazy, 242 kB gzip, fallback CSS y reduced-motion), tema dinámico por portada en toda la interfaz con contraste AA, panel derecho con pestañas Biblioteca/Playlists/Cola/Audio, controles de escenario en el héroe y mini reproductor móvil.
- **Bloqueo de cuenta AWS:** SCP bloquea Cognito/Amplify/Lambda/DynamoDB; deploy irá por S3 + CloudFront + ACM.
- **Credenciales listas:** Spotify Client ID + Jamendo Client ID en `.env.local` (se crearán al ejecutar el Bloque B).

## Próximo paso

Bloque B: proveedores de música conmutables. `MusicSource` + Ajustes (Spotify activado por defecto, Audius y Jamendo), OAuth PKCE de Spotify (búsqueda + previews + Web Playback SDK Premium), Audius sin credenciales, Jamendo con client_id. Luego Bloque C (integrar pistas online con las listas dobles) y cierre local. Despliegue: Día 4.
