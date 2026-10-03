# Jam en tiempo real y playlists compartidas (post-entrega)

> Estado: **diseñado, no implementado**. La cuenta AWS actual tiene una SCP que bloquea API Gateway WebSocket, Lambda y DynamoDB, y el inicio de sesión real (Cognito). Sin backend en tiempo real y sin cuentas no es posible una sesión entre usuarios reales. La interfaz `JamProvider` y este documento dejan la arquitectura lista.

## Objetivo

- Escuchar juntos tipo Spotify: todos los participantes suenan la misma canción, en la misma posición.
- Cola compartida: el anfitrión controla; los invitados ven y pueden proponer.
- Playlists compartidas entre usuarios con roles (dueño, editor, lector).

## Principio clave (audio y derechos)

La sesión **sincroniza el control, no el audio**. Cada participante reproduce una copia local de la canción (misma referencia por id/hash). Si alguien no tiene la pista, no suena para esa persona y la app se lo indica. Esto evita redistribuir música con derechos y mantiene el proyecto dentro de lo académico.

## Arquitectura propuesta

```text
Cliente A (host) ─┐
Cliente B         ├─ WebSocket (sala) ── Servidor de sesiones ── DynamoDB/Redis
Cliente C         ┘        │
                           └── estado: participantes, cola, canción, posición, isPlaying
```

Opciones de backend (elegir una al retomar):

1. **AWS API Gateway WebSocket + Lambda + DynamoDB** (la ruta natural del proyecto, bloqueada hoy por SCP).
2. **EC2 con Node + WebSocket** (permitido en la cuenta actual): más trabajo de operación, sin capa gratuita serverless.
3. **Proveedor externo** (Supabase Realtime, PartyKit, Liveblocks): rápido, pero suma un tercero y datos fuera de AWS.

Recomendación: opción 1 en una cuenta sin SCP; la opción 2 como respaldo si el plazo aprieta.

## Modelo de sincronización

- Autoridad del anfitrión: el servidor guarda `currentTrackId`, `positionSeconds`, `isPlaying` y un `updatedAt` del servidor.
- Los clientes calculan `posicionEsperada = positionSeconds + (ahora - updatedAt)` si está sonando.
- Si la deriva supera 250 ms, el cliente corrige con `seek` suave; si supera 1 s, hace `seek` directo.
- El volumen, la salida de audio, el balance, la velocidad y el karaoke son **locales** de cada persona (no se sincronizan).
- Latencia: se mide con ping/pong y se compensa al calcular la posición.

## Playlists compartidas

- Tabla de miembros: `playlistId`, `userId`, `role` (`owner` | `editor` | `viewer`), `invitedAt`.
- Invitación por enlace con token de un solo uso.
- Conflictos: última edición gana con `updatedAt` (igual que el plan de sync general); los movimientos de cola durante una sesión los manda el host.
- Privacidad: compartir una playlist es dato personal; requiere consentimiento explícito y poder salir/eliminar la compartición.

## Interfaz

`src/features/jam/types.ts` define `JamProvider` (conectar, desconectar, cola, play/pause, suscripción) y los tipos `JamSession`, `JamParticipant`. Cualquier backend debe implementar esa interfaz; la UI y el reproductor no cambian.

## Fases

1. **Control sync**: sala con host, play/pause/seek/cola sincronizados, indicador de participantes.
2. **Playlists compartidas**: membresías, roles, invitación por enlace, CRUD compartido.
3. **Social**: chat, reacciones, votación de la cola, "pedir turno".

## Riesgos

- Reloj y latencia: mitigado con servidor autoritativo y corrección por deriva.
- Derechos de autor: se sincroniza control, nunca audio.
- Costos: WebSocket idle cuesta; límites de sala y de tiempo por sesión.
