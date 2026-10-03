# Prompt para una sesión nueva (copiar y pegar)

```text
Vas a continuar el proyecto Legato (reproductor de música con listas doblemente
enlazadas hechas a mano). El contexto absoluto está en:

  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md

PASO 1 (obligatorio): lee ese archivo COMPLETO antes de tocar nada. También
puedes consultar docs/ESTADO.md, docs/DECISIONES.md, docs/ARQUITECTURA.md,
docs/ESTRUCTURA-DATOS.md, docs/DESPLIEGUE.md y docs/JAM.md.

PASO 2: verifica el estado real:
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # deben pasar 154 unitarios
  ~/.bun/bin/bun run test:e2e    # deben pasar 4 E2E
  ~/.bun/bin/bun run build
Si algo falla, arréglalo antes de seguir. Si la UI sale en blanco, es caché de
Vite: reinicia el server y borra node_modules/.vite.

PASO 3: arranca el entorno para el usuario:
  ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
El usuario abre http://127.0.0.1:5173 (SIEMPRE 127.0.0.1, no localhost, por el
redirect de Spotify).

REGLAS DEL PROYECTO (no negociables):
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main cuando el
  usuario lo pida o al cerrar un bloque verificado.
- Interfaz clara, nunca oscura; estética premium tipo vinilo; la portada debe
  verse completa en el disco (sin recortes) y la UI se tiñe con los colores
  del álbum.
- Validar todo: typecheck + oxlint + tests + build antes de cada commit;
  documentar lo hecho en docs/ESTADO.md y en el doc que corresponda.
- El usuario habla español; el código y los commits en inglés.
- El despliegue está reservado para el "Día 4" (S3 + CloudFront +
  app.jenilarper.dev); no desplegar hasta que el usuario lo pida.

PASO 4: el usuario tiene una FUNCIONALIDAD NUEVA pendiente de especificar.
Pregúntale cuál es antes de planificar. Luego entrega: lista de
funcionalidades, plan por fases, decisiones técnicas y preguntas pertinentes.

CONTEXTO EXPRESS (por si acaso, pero igual lee el doc completo):
- Stack: Bun + Vite + React 19 + TS 6 + Tailwind v4 + Vitest + Playwright +
  Dexie + Zustand + dnd-kit + i18next. Sin three.js (se retiró el 3D).
- Núcleo: src/core/doubly-linked-list (a mano) + src/player (motor, cola,
  crossfade, A-B, karaoke, timer, salida de audio).
- Persistencia: IndexedDB con biblioteca/playlists/sesión y reanudación.
- Fuentes: Spotify (PKCE + previews + Web Playback SDK Premium), Audius y
  Jamendo, con toggles en Ajustes (por defecto solo Spotify).
- Legal/cookies/accesibilidad/PWA ya implementados.
- Repo: https://github.com/Jenifrutica/legato (privado), rama main.
- Último commit: a5cebc0. Todo en verde al cierre de la sesión anterior.
```
