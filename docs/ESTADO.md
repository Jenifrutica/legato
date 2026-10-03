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
| 13 | Modo estructura (visualizador DLL) | En curso |
| 14 | i18n ES/EN/PT | Pendiente |
| 15 | IndexedDB + sesión persistente | Pendiente |
| 16 | Timer + shuffle/bucles + scroll | Pendiente |
| 17 | Accesibilidad WCAG 2.2 AA | Pendiente |
| 18 | Páginas legales + cookies | Pendiente |
| 19–21 | Extras: ensayo, undo/redo, karaoke M/S | Pendiente |
| 22 | E2E smoke + regresión #12 | Pendiente |
| 23–27 | Día 4: pulido, responsive, deploy S3+CloudFront, docs, rotar key | Pendiente |
| 28–33 | Post-entrega | Pendiente |

## Estado técnico

- **Tests:** 88 en verde (núcleo, player, biblioteca, playlists y controlador).
- **Calidad:** typecheck + oxlint + Prettier + build en verde en cada commit.
- **Bloqueo de cuenta AWS:** SCP bloquea Cognito/Amplify/Lambda/DynamoDB; deploy irá por S3 + CloudFront + ACM.
- **Login:** perfil local activo; Cognito implementado y listo.

## Próximo paso

Issue #13: modo estructura — visualizador en vivo de la lista doble (nodos, punteros prev/next y nodo actual) con animaciones y navegación por teclado.
