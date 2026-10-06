# Prompt para una sesión nueva

> **El prompt canónico para copiar y pegar está en `docs/PROMPT-PLAN-NUEVA-SESION.md`.** Este archivo queda como entrada rápida.

## Resumen

La próxima sesión arranca en **modo plan**: leer `docs/CONTEXTO-COMPLETO.md` y `docs/PENDIENTES.md`, verificar **325 tests unitarios + 16 E2E + build**, y planificar los pendientes antes de tocar código:

1. **Login / perfil (Firebase)**: el correo de verificación no llega (spam); decidir Google vs SMTP propio y confirmar el flujo registro → verificación → entrada → recuperación → borrado.
2. **«Error de conexión»** reportado: localizar el mensaje exacto (entrada, Ajustes → Spotify, sincronización o banner) y corregirlo.
3. **Velocidad con Spotify**: ocultar el botón cuando la fuente es Spotify (el SDK/DRM no permite cambiar velocidad); en local se mantiene 1→1.25→1.5→2→0.9→0.75→0.5.
4. **Importar playlists de Spotify** (fase A): falla con «reconnect»; diagnosticarlo en el navegador de la autora.
5. **Despliegue** (fase E): S3 + CloudFront + ACM + `app.jenilarper.dev` y **rotar la access key** expuesta.

## Entorno

- **Sin tokens**: no hay sesión de Spotify ni claves de IA en el entorno de desarrollo (la verificación se hace en el navegador de la autora, con Premium).
- **Auth**: Firebase `legato-5ba6f` en `.env.local`; respaldo local PBKDF2 en IndexedDB; E2E en `VITE_AUTH_MODE=local`, puerto **5174**.
- **Audios**: Firebase Storage exige Blaze → se guardan **troceados en Firestore** (`fileManifests` + `fileChunks`).
- Servidor: `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` → `http://127.0.0.1:5173` (no `localhost`, por Spotify).
- Si la UI queda en blanco tras agregar archivos: reiniciar el server y `rm -rf node_modules/.vite`.
- Reglas completas y comandos: `docs/PENDIENTES.md` y el prompt canónico.
