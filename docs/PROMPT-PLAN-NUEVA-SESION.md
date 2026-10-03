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
  docs/REDISENO.md (dirección visual Duotono 62 y bitácora), docs/ESTADO.md,
  docs/DECISIONES.md, docs/MUSICOS.md, docs/AUTH.md, docs/DESPLIEGUE.md,
  docs/ARQUITECTURA.md, docs/ESTRUCTURA-DATOS.md.

PASO 2: verifica el estado real (no asumas):
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # deben pasar 191
  ~/.bun/bin/bun run test:e2e    # deben pasar 6
  ~/.bun/bin/bun run build
  # Para probar (solo si lo pido):
  # ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
  # Abrir SIEMPRE http://127.0.0.1:5173 (no localhost, por Spotify).
Si al agregar archivos la UI queda en blanco o un módulo "no exporta X":
reiniciar el server y rm -rf node_modules/.vite (caché HMR de Vite).

PASO 3: sin tocar código, prepara un plan por fases para estos pendientes (en
este orden salvo que yo diga otra cosa) y hazme las preguntas necesarias con
el question tool:

A) IMPORTAR PLAYLISTS DE SPOTIFY: está implementado (pestaña Playlists →
   «Importar de Spotify», referencias externas sin audio), pero me falla con
   «reconnect to Spotify» aunque reconecto. Propón el diagnóstico paso a paso
   conmigo (tokens en localStorage, logs [spotify-import], dashboard de
   Spotify, scopes, Redirect URI) e hipótesis/correcciones. NO hay tokens en
   el entorno de desarrollo: la verificación se hace en mi navegador con mi
   cuenta Premium.

B) ONDAS AL RITMO DE LOS GOLPES: hay detector por flujo espectral de la banda
   del bombo (medido: picos cada 497 ms con bombo de 500 ms; reposo quieto,
   sonando late, Spotify con pulso sintético 120 BPM). Quiero validarlo con
   música real y afinar sensibilidad (quizá un control suave/normal/agresivo).
   Propón plan y pruébalo conmigo.

C) MÓDULO PARA MÚSICOS (docs/MUSICOS.md): metrónomo, BPM/tonalidad (manual y
   estimada), ChordPro, transposición, LRC local, pitch shift, setlists y
   notas; stems (Demucs) queda post-entrega. Propón orden, alcance por fase,
   criterios de aceptación y qué se muestra en el panel de músicos.

D) LOGIN OBLIGATORIO CON BASE DE DATOS: para usar la app hay que iniciar
   sesión y los usuarios quedan en la base de datos. La SCP de AWS bloquea
   Cognito/Amplify/Lambda/DynamoDB, así que probablemente sea auth local en
   IndexedDB (PBKDF2-SHA256 con WebCrypto) sobre el AuthProvider existente.
   Decisiones abiertas: biblioteca existente sin usuario, bibliotecas por
   usuario en el mismo navegador, recuperación de contraseña sin backend,
   migración del perfil local actual. Pregúntame antes de planificar en firme.

E) REFINAR + DESPLIEGUE (Día 4): revisión final por pantallas
   (390/768/1024/1280/1440), estados vacíos, modo oscuro y legales;
   verificación end-to-end del Web Playback SDK de Spotify; E2E nuevos de
   búsqueda/proveedores; deploy S3 + CloudFront + ACM + app.jenilarper.dev y
   ROTAR la access key expuesta. No desplegar ni rotar nada hasta que yo lo
   pida.

REGLAS DEL PROYECTO (no negociables):
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main al cerrar cada
  bloque verificado.
- Nada oscuro por defecto (el modo oscuro es opcional y conmutable).
- La portada se ve en el disco; la UI se tiñe MUCHO con los colores del álbum.
- Una sola barra de reproducción por vista; cero superposiciones.
- El núcleo académico son las LISTAS DOBLES HECHAS A MANO (punteros prev/next,
  sin métodos de frameworks): biblioteca, playlists, Lista (cola), historial,
  shuffle, undo/redo y modo Estructura. Toda función nueva de orden pasa por
  la DLL.
- Validar SIEMPRE antes de commitear: format + typecheck + oxlint + tests +
  build + E2E; y axe sin violaciones para UI.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md (y
  actualizar docs/PENDIENTES.md si cambia algún pendiente).
- No hay tokens de OpenAI válidos y no hay sesión de Spotify en el entorno de
  desarrollo: pídeme lo que necesites para verificar.
- Documentación total ya está hecha: PENDIENTES.md, CONTEXTO-COMPLETO.md
  (sesión 4), DECISIONES D100–D102 y PROMPT-NUEVA-SESION.md (índice).

Empieza leyendo y verificando; luego preséntame el plan por fases y tus
preguntas. No escribas código todavía.
```
