# Prompt para la próxima sesión — MODO PLAN (copiar y pegar)

> Pega **todo el bloque de abajo** como primer mensaje de una sesión nueva **en modo plan** (no en build). Está pensado para que el agente planifique los frentes pendientes sin tocar código. El detalle de cada pendiente está en `docs/PENDIENTES.md`.

```text
Vas a continuar el proyecto Legato (reproductor de música para músicos con
listas doblemente enlazadas hechas a mano). ESTA SESIÓN EMPIEZA EN MODO PLAN:
solo leer, investigar, proponer y preguntar; no modificar archivos ni ejecutar
builds hasta que yo lo autorice.

PASO 1 (obligatorio): lee COMPLETOS estos archivos:
  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md
  /home/jenifrutica/Proyectos/legato/docs/PENDIENTES.md
También puedes consultar:
  docs/ESTADO.md, docs/AUTH.md, docs/METRONOMO.md, docs/STEMS.md,
  docs/DECISIONES.md, docs/MUSICOS.md, docs/DESPLIEGUE.md, docs/ARQUITECTURA.md,
  docs/ESTRUCTURA-DATOS.md.

PASO 2: verifica el estado real (no asumas):
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # deben pasar 325
  ~/.bun/bin/bun run test:e2e    # deben pasar 13 (modo local, puerto 5174)
  ~/.bun/bin/bun run build
  # Para probar (solo si lo pido):
  # ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
  # Abrir SIEMPRE http://127.0.0.1:5173 (no localhost, por Spotify).
Si al agregar archivos la UI queda en blanco o un módulo "no exporta X":
reiniciar el server y rm -rf node_modules/.vite (caché HMR de Vite).

PASO 3 (contexto fijo, no lo cambies sin preguntar):
- Auth: Firebase (proyecto legato-5ba6f), configurado en .env.local
  (VITE_AUTH_MODE=firebase). Correo/contraseña + Google activados, reglas de
  Firestore publicadas, 127.0.0.1 en dominios autorizados. Respaldo local
  (PBKDF2 en IndexedDB) si falta configuración; los E2E corren en modo local.
- Datos por usuario (Dexie v8 con userId + lápidas), migración de huérfanos al
  primer usuario e herencia de la cuenta local al pasar a la nube. Sin correo
  verificado NO queda sesión.
- Firebase Storage exige plan Blaze (tarjeta, rechazado): los audios se guardan
  TROCEADOS en Firestore (fileManifests + fileChunks, 700 KB, base64).
- NO HAY TOKENS de OpenAI ni sesión de Spotify en el entorno de desarrollo: la
  verificación con Firebase/Spotify se hace en mi navegador (Brave/Fedora).

PASO 4: sin tocar código, prepara un plan por fases para estos pendientes (en
este orden salvo que yo diga otra cosa) y hazme las preguntas necesarias con
el question tool:

1) LOGIN / PERFIL (Firebase, verificación manual): el correo de verificación de
   Firebase no me llega (probable spam; remitente *firebaseapp.com*). Decide con
  migo: usar Google como vía principal o configurar SMTP propio (post-demo).
   Confirma el flujo real: registro → verificación → entrada → recuperación →
   eliminar cuenta, y que sin verificar no hay sesión.

2) «ERROR DE CONEXIÓN» (bug reportado, no reproducido): al cargar la app y con
   Google no aparece en consola. Localiza el mensaje exacto (pantalla de entrada,
   Ajustes → Probar conexión Spotify, Sincronización (nube) o banner de Spotify)
   y propón la corrección. Pídeme captura/texto.

3) VELOCIDAD CON SPOTIFY: el control de velocidad no cambia la velocidad en
   Spotify (limitación del SDK/DRM). Decisión de la autora: OCULTAR el botón
   cuando la fuente es Spotify (héroe, barra móvil y sección del panel de
   ensayo); en archivos locales se mantiene 1→1.25→1.5→2→0.9→0.75→0.5. El último
   commit dejó un AVISO en vez de ocultarlo: confirmar cuál prefieres y planear.

4) IMPORTAR PLAYLISTS DE SPOTIFY (fase A): está implementado (Playlists →
   «Importar de Spotify», referencias externas sin audio), pero falla con
   «reconnect to Spotify» aunque reconecto. Propón el diagnóstico paso a paso
   conmigo (tokens en localStorage, logs [spotify-import], dashboard de Spotify,
   scopes, Redirect URI) e hipótesis/correcciones. La verificación se hace en mi
   navegador con mi cuenta Premium.

5) DESPLIEGUE (fase E, Día 4): revisión final por pantallas (390/768/1024/1280/
   1440), estados vacíos, legales; deploy S3 + CloudFront + ACM +
   app.jenilarper.dev y ROTAR la access key expuesta. NO desplegar ni rotar nada
   hasta que yo lo pida.

REGLAS DEL PROYECTO (no negociables):
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main al cerrar cada
  bloque verificado.
- Nada oscuro por defecto (el modo oscuro es opcional y conmutable).
- La portada se ve en el disco; la UI se tiñe MUCHO con los colores del álbum.
- Una sola barra de reproducción por vista; cero superposiciones.
- El núcleo académico son las LISTAS DOBLES HECHAS A MANO (punteros prev/next,
  sin métodos de frameworks): biblioteca, playlists, Lista (cola), historial,
  shuffle, undo/redo y modo Estructura. Toda función nueva de orden pasa por la
  DLL.
- Validar SIEMPRE antes de commitear: format + typecheck + oxlint + tests +
  build + E2E; y axe sin violaciones para UI.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md (y
  actualizar docs/PENDIENTES.md si cambia algún pendiente).
- Documentación al día: CONTEXTO-COMPLETO.md (sesiones 4–6), PENDIENTES.md,
  ESTADO.md, AUTH.md y los prompt de sesión.

Empieza leyendo y verificando; luego preséntame el plan por fases y tus
preguntas. No escribas código todavía.
```
