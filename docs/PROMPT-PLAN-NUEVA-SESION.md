# Prompt completo para NUEVA SESIÓN EN MODO PLAN (copiar y pegar)

> Pega TODO el bloque de abajo como primer mensaje de una sesión nueva **en modo plan** (no en build). Está pensado para que el agente planifique el rediseño completo sin tocar código todavía.

```text
Estoy retomando el proyecto Legato y esta sesión es SOLO DE PLANEACIÓN
(modo plan: no modifiques archivos, no ejecutes builds, solo lee, investiga,
propón y pregunta).

## Contexto obligatorio
Lee COMPLETO antes de proponer nada:
  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md
  (la sección final "PRIORIDAD NÚMERO 1: REDISEÑAR TODA LA INTERFAZ" es lo más importante)
También puedes consultar:
  docs/ESTADO.md, docs/DECISIONES.md, docs/ARQUITECTURA.md,
  docs/ESTRUCTURA-DATOS.md, docs/UI-UX.md, docs/MUSICOS.md,
  docs/AUTH.md, docs/DESPLIEGUE.md, docs/JAM.md,
  docs/PROMPT-NUEVA-SESION.md

## Qué es Legato
Reproductor de música web para músicos (proyecto académico sin fines de lucro,
Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia). El núcleo
académico son LISTAS DOBLEMENTE ENLAZADAS HECHAS A MANO (sin métodos de
frameworks): biblioteca, playlists múltiples, cola de reproducción, historial,
shuffle, undo/redo y un visualizador "Modo Estructura".

## Estado real al cierre de la sesión anterior (todo funcional)
- Repo privado: https://github.com/Jenifrutica/legato (rama main, último commit
  aa9bc78). Local: /home/jenifrutica/Proyectos/legato
- 154 tests unitarios + 4 E2E (Playwright) en verde; typecheck/lint/build OK.
- Stack: Bun + Vite 8 + React 19 + TS 6 + Tailwind v4 + Vitest + Playwright +
  Dexie + Zustand + dnd-kit + i18next. Sin three.js (el 3D se retiró).
- Reproductor: local (Web Audio con balance L/R, karaoke M/S, aislamiento de
  canales, analizador) y streaming (segundo elemento de audio directo para
  Spotify/Audius/Jamendo, sin grafo, por CORS).
- Spotify: OAuth PKCE + búsqueda + previews + Web Playback SDK (Premium) con
  banner; credenciales en .env.local (Client ID público). Audius gratis y
  Jamendo con client_id, activables en Ajustes (por defecto solo Spotify).
- Persistencia: IndexedDB (biblioteca con blobs, playlists, sesión) con
  reanudación al recargar. PWA offline en producción.
- UI actual: tema claro "Hi-Fi", paleta violeta/teal, tema dinámico por portada
  (funciona también con Spotify), vinilo 2D con la portada, ondas canvas
  alrededor del disco, panel derecho con pestañas Biblioteca/Buscar/Playlists/
  Cola/Audio, barra móvil + navegación inferior, modo oscuro opcional, i18n
  ES/EN/PT, accesibilidad WCAG 2.2 AA + panel, legales + cookies.

## LO QUE QUIERO (prioridad número 1): REDISEÑAR TODA LA INTERFAZ
Considero que la interfaz actual está FEA. No es un ajuste: es un rediseño
completo. Todo lo funcional se conserva; la capa visual se rehace.

Problemas concretos que veo:
1. Composición general pobre: espacio desperdiciado, secciones que no dialogan.
2. El vinilo: recortes/tamaño/posición no convencen; giro y brazo básicos.
3. Las ondas: se recortan, se salen o quedan tapadas; color y ritmo no sorprenden.
4. Barras duplicadas y superposiciones en responsive (ya se iteró, pero sigue
   sintiéndose frágil).
5. Slider de volumen poco intuitivo.
6. Botones con jerarquía débil.
7. El tema por portada funciona pero es sutil; quiero un cambio MUCHO más
   notorio, con detalles (halo, superficies, textura, tipografía).
8. La paleta violeta/teal no me convence.
9. Playlists debe sentirse la funcionalidad estrella (listas dobles).

## Cómo quiero que planees (flujo impeccable)
1. Ejecuta el flujo de impeccable: primero `context` (script en
   ~/.config/opencode/skills/impeccable/scripts/impeccable) y lee
   reference/new-work.md.
2. Propón 2-3 DIRECCIONES VISUALES concretas y genuinamente distintas, cada una
   con: paleta exacta (claro y oscuro), tipografías, composición del héroe
   (dónde va el vinilo, tamaño, sangrado), estilo del vinilo y de las ondas,
   superficies/efectos, y una referencia descriptiva. Que ninguna parezca la
   actual.
3. Usa el question tool para que yo elija la dirección (y para cualquier
   decisión abierta). No asumas.
4. Recién con la dirección elegida, escribe el plan por fases: tokens, héroe,
   vinilo, ondas, panel, barras, responsive 390/768/1024/1280/1440, estados
   vacíos, modo oscuro, legales y accesibilidad.
5. Incluye cómo validar: tests actuales deben seguir en verde (154 unit + 4
   E2E), axe sin violaciones, capturas con Playwright.

## Reglas del proyecto (no negociables)
- Modo plan en ESTA sesión: no edites archivos ni ejecutes comandos que
  modifiquen nada. Solo lectura/investigación y preguntas.
- Cuando pasemos a build: commits en inglés, simples, SIN "Co-Authored-By",
  push a main al cerrar cada bloque verificado.
- Nada oscuro por defecto (el modo oscuro es opcional y conmutable).
- La portada debe verse en el disco; la UI se tiñe con los colores del álbum
  (notorio). Las ondas rodean el disco y usan la paleta del álbum.
- Una sola barra de reproducción por vista; cero superposiciones.
- Validar todo antes de commitear: typecheck + oxlint + tests + build + E2E.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md.
- El despliegue es para el "Día 4" (S3 + CloudFront + app.jenilarper.dev);
  no desplegar hasta que yo lo pida. La access key expuesta debe rotarse antes
  de terminar la entrega.

## Pendientes funcionales (después del rediseño)
- La NUEVA FUNCIONALIDAD que aún no te he especificado: pregúntame cuál es.
- Verificar end-to-end el Web Playback SDK de Spotify (Premium).
- Funciones para músicos (docs/MUSICOS.md): ChordPro, transposición, LRC,
  BPM/tonalidad, metrónomo, pitch shift, stems (Demucs), setlists, notas.
- Login: perfil local activo; Cognito correo/contraseña implementado y
  bloqueado por la SCP de AWS; Google IdP y eliminación/exportación de cuenta
  pendientes (docs/AUTH.md).
- Día 4: deploy S3 + CloudFront + dominio + rotar access key.

## Cómo verificar el estado (solo lectura, cuando lo indique)
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # deben pasar 154
  ~/.bun/bin/bun run test:e2e    # deben pasar 4
  ~/.bun/bin/bun run build
  # Servidor (no lo levantes en modo plan salvo que yo lo pida):
  # ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
  # Spotify exige abrir http://127.0.0.1:5173 (no localhost).
  # Si la UI queda en blanco tras agregar archivos: reiniciar server y
  # borrar node_modules/.vite (caché HMR de Vite).

Empieza: lee el contexto completo y luego propón las direcciones visuales con
preguntas. No escribas código todavía.
```
