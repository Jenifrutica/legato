# Arquitectura

## Visión general

```text
┌──────────────────────────── Legato (web PWA) ────────────────────────────┐
│                                                                          │
│  UI (React)                                                              │
│  ├─ features/library      importar archivos, metadatos, búsqueda         │
│  ├─ features/playlists    CRUD de playlists (varias listas dobles)       │
│  ├─ features/dnd          drag & drop con dnd-kit                        │
│  ├─ features/player       vinilo, ondas, barra, mini reproductor         │
│  ├─ features/structure    visualizador en vivo de la lista doble         │
│  ├─ features/session      reanudar al recargar                           │
│  ├─ features/legal        privacidad, términos, cookies                  │
│  ├─ features/a11y         panel de accesibilidad                         │
│  └─ features/i18n         ES / EN / PT                                   │
│                                                                          │
│  Núcleo                                                                  │
│  ├─ core/doubly-linked-list   lista doble a mano (0 dependencias)        │
│  └─ player/                   motor de audio y cola                      │
│                                                                          │
│  Persistencia local: IndexedDB (Dexie) + localStorage (ajustes)          │
└──────────────────────────────────────────────────────────────────────────┘
                 │ (post-entrega)
                 ▼
┌──────────────────────── AWS (us-east-1) ─────────────────────────────────┐
│  Amplify Hosting (S3 + CloudFront)  →  app.jenilarper.dev                │
│  Cognito User Pool                  →  correo/contraseña (Google después)│
│  [POST] S3 audio + Lambda + DynamoDB + ACRCloud proxy                    │
└──────────────────────────────────────────────────────────────────────────┘
```

## Estructura de carpetas objetivo

```text
legato/
├─ docs/                          # esta documentación
├─ public/                        # iconos, manifest PWA, fuentes
├─ src/
│  ├─ core/
│  │  └─ doubly-linked-list/      # estructura pura + tests
│  ├─ player/                     # motor de audio, cola, historial, visualizador
│  ├─ features/
│  │  ├─ auth/                    # AuthProvider (Cognito | local)
│  │  ├─ library/                 # importación y CRUD de canciones
│  │  ├─ playlists/               # CRUD de playlists
│  │  ├─ dnd/                     # drag & drop y alternativa de teclado
│  │  ├─ session/                 # persistencia de sesión
│  │  ├─ structure/               # visualizador de la lista doble
│  │  ├─ legal/                   # páginas y consentimiento de cookies
│  │  ├─ a11y/                    # panel de accesibilidad
│  │  └─ i18n/                    # traducciones ES/EN/PT
│  ├─ ui/                         # componentes y tokens de diseño
│  ├─ app/                        # composición, rutas, providers
│  └─ styles/                     # Tailwind y tokens
└─ tests/e2e/                     # Playwright
```

## Módulos, contratos y tests

| Módulo | Responsabilidad | Contrato clave | Tests |
|---|---|---|---|
| `core/doubly-linked-list` | Estructura de datos pura | `insertAt`, `removeNode`, `moveNode`, `iterator` | Unit + property-based |
| `player/engine` | Audio, seek, volumen, velocidad | `play`, `pause`, `seek`, `setRate` | Unit + integración |
| `player/queue` | Orden, historial, shuffle, bucles | `next`, `prev`, `setMode` | Unit (semántica #12) |
| `features/library` | Importar y editar canciones | `importFiles`, `updateSong`, `deleteSong` | Unit + E2E |
| `features/playlists` | CRUD de listas dobles | `create`, `rename`, `duplicate`, `remove` | Unit + E2E |
| `features/dnd` | Reordenar y mover canciones | `moveNode(node, target)` | Unit + E2E (#12) |
| `features/session` | Reanudar reproducción | `save`, `restore` | Unit + E2E |
| `features/legal` | Páginas y consentimiento | `consentVersion`, `getPreferences` | Unit + E2E |
| `features/a11y` | Preferencias de accesibilidad | `setPreference` | Unit + axe |
| `features/structure` | Visualizar la lista doble | `snapshot()` | Unit |

## Flujo de datos (MVP)

```text
Archivo local → File API → metadatos (music-metadata) → IndexedDB (blob + info)
     → nodo de la lista doble de la playlist → player engine (Web Audio)
     → visualizador (AnalyserNode) + UI
```

## Modelo de datos

### IndexedDB (MVP)

| Tabla | Clave | Contenido |
|---|---|---|
| `songs` | `id` | metadatos, blob de audio, portada, hash |
| `playlists` | `id` | nombre, orden (`songIds[]`), timestamps |
| `session` | `key` | canción actual, posición, modo, velocidad, timer |
| `settings` | `key` | idioma, preferencias de accesibilidad, consentimiento |

> El orden se guarda como lista de ids (formato de disco). Al cargar, se **reconstruye la lista doble** con punteros en memoria. La estructura en memoria es siempre la implementación propia.

### DynamoDB (post-entrega, single-table)

| PK | SK | Item |
|---|---|---|
| `USER#<sub>` | `SONG#<id>` | metadatos de canción + `s3Key` |
| `USER#<sub>` | `PLAYLIST#<id>` | nombre + `order[]` + `updatedAt` |
| `USER#<sub>` | `SESSION#current` | sesión para continuidad entre dispositivos |

## Autenticación

- Interfaz `AuthProvider` con dos implementaciones: `CognitoAuthProvider` (timebox del Día 1) y `LocalAuthProvider` (fallback sin backend).
- Cognito: User Pool en `us-east-1`, login correo/contraseña; IdP de Google se agrega después.
- El resto de la app consume solo la interfaz; cambiar de proveedor no toca la UI.

## Modo local (`VITE_LOCAL_MODE`)

Permite desarrollar y evaluar sin AWS: auth local, persistencia en IndexedDB y audio desde blobs. El despliegue en Amplify usa el mismo build con variables de entorno distintas.

## Seguridad

- Secretos en `.env.local` / `~/.aws`; `.gitignore` bloquea `.env*` y `legato-keys.txt`.
- Validación con Zod en formularios, importaciones y límites de archivos.
- Sanitización de textos editables (letras/notas) para evitar XSS.
- Sin analítica ni terceros en el MVP.
- Al terminar la entrega: rotar la access key compartida en el chat.

## Convenciones

- TypeScript estricto, componentes funcionales, nombres en inglés para código y en español para documentación.
- Commits simples, sin `Co-Authored-By`.
- Cada módulo expone su API por `index.ts` y no importa internals de otro módulo.
