# Prompt para una sesión nueva

> **El prompt canónico para copiar y pegar está en `docs/PROMPT-PLAN-NUEVA-SESION.md`.** Este archivo queda como entrada rápida.

## Resumen

La próxima sesión arranca en **modo plan**: leer `docs/CONTEXTO-COMPLETO.md` y `docs/PENDIENTES.md`, verificar **191 tests unitarios + 6 E2E + build**, y planificar los cinco frentes pendientes antes de tocar código:

1. **Importar playlists de Spotify** (está implementado; falla con «reconnect» y hay que diagnosticarlo con la autora).
2. **Ondas al ritmo de los golpes** (detector por flujo espectral; falta validar con música real y afinar).
3. **Módulo para músicos** (`docs/MUSICOS.md`: metrónomo, BPM/tonalidad, ChordPro, transposición, LRC, pitch shift, setlists, notas).
4. **Login obligatorio con base de datos** (probable auth local en IndexedDB con PBKDF2; Cognito bloqueado por la SCP de AWS).
5. **Refinar + desplegar** (Día 4: S3 + CloudFront + `app.jenilarper.dev`) y **rotar la access key** expuesta.

## Entorno

- **Sin tokens**: la key de OpenAI está vencida y no hay sesión de Spotify en el entorno de desarrollo (la verificación se hace en el navegador de la autora, con Premium).
- Servidor: `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` → `http://127.0.0.1:5173` (no `localhost`, por Spotify).
- Si la UI queda en blanco tras agregar archivos: reiniciar el server y `rm -rf node_modules/.vite`.
- Reglas completas y comandos: `docs/PENDIENTES.md` y el prompt canónico.
