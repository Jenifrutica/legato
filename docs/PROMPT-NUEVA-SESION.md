# Prompt para una sesión nueva

> **El prompt canónico para copiar y pegar está en `docs/PROMPT-PLAN-NUEVA-SESION.md`.** Este archivo queda como entrada rápida.

## Objetivo de la próxima sesión

Arranca en **modo plan**. El **backend y las funcionalidades están completos** (v1.0.0); solo queda **rediseñar el front** para que no sea genérico y, después, **desplegar**.

1. Leer `docs/CONTEXTO-COMPLETO.md` y `docs/PENDIENTES.md`; verificar **318 unit + 17 E2E + build**.
2. **Leer los skills instalados** antes de proponer: `.agents/skills/awwwards-animations/SKILL.md`, `.agents/skills/animejs/SKILL.md`, `.agents/skills/manus/SKILL.md` (+ la skill `impeccable`).
3. Proponer **2–3 direcciones visuales** (composición, tipografía, movimiento) manteniendo el estilo **Duotono 62** y **todas** las funciones; **preguntar antes de construir**.
4. **Pendiente después**: despliegue S3 + CloudFront + ACM + `app.jenilarper.dev` y rotar la access key.

## Respaldo

- **Versión de respaldo: `v1.0.0`** (tag en git). Es la base estable previa al rediseño de front.

## Entorno

- **Sin tokens**: la verificación se hace en el navegador de la autora (Brave/Fedora).
- Servidor: `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` → `http://127.0.0.1:5173` (no `localhost`, por Spotify).
- Si la UI queda en blanco tras agregar archivos: reiniciar el server y `rm -rf node_modules/.vite`.
- Reglas completas: `docs/PENDIENTES.md` y el prompt canónico.
