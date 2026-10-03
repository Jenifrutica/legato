# Prompt para una sesión nueva (copiar y pegar)

```text
Vas a continuar el proyecto Legato (reproductor de música para músicos con
listas doblemente enlazadas hechas a mano). ESTA SESIÓN EMPIEZA EN MODO PLAN:
solo leer, investigar, proponer y preguntar; no modificar archivos hasta que
yo lo autorice.

PASO 1 (obligatorio): lee COMPLETOS estos dos archivos:
  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md
  /home/jenifrutica/Proyectos/legato/docs/PENDIENTES.md   ← pendientes detallados
También: docs/REDISENO.md (dirección visual Duotono 62 y bitácora), docs/MUSICOS.md,
docs/AUTH.md, docs/DESPLIEGUE.md.

PASO 2: verifica el estado real (no asumas):
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # deben pasar 191
  ~/.bun/bin/bun run test:e2e    # deben pasar 6
  ~/.bun/bin/bun run build
  (para probar: ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
   y abrir SIEMPRE http://127.0.0.1:5173, no localhost, por Spotify)
Si al agregar archivos la UI queda en blanco: reiniciar el server y
rm -rf node_modules/.vite (caché HMR de Vite).

PASO 3: sin tocar código, prepara un plan por fases para ESTOS pendientes (en
este orden, salvo que yo diga otra cosa) y hazme las preguntas que hagan falta
con el question tool:

A) IMPORTAR PLAYLISTS DE SPOTIFY: está implementado (pestaña Playlists →
   «Importar de Spotify»), pero a mí me falla con «reconnect to Spotify» aunque
   reconecto. El plan debe incluir cómo diagnosticarlo conmigo paso a paso
   (revisar tokens en localStorage, logs [spotify-import], dashboard de
   Spotify), y las hipótesis/correcciones posibles. Contexto: no hay tokens en
   el entorno de desarrollo; la verificación se hace en mi navegador con mi
   cuenta Premium.

B) ONDAS AL RITMO DE LOS GOLPES: hay detector por flujo espectral (medido:
   picos cada 497 ms con bombo de 500 ms) pero quiero afinarlo/validarlo con
   música real y quizá un control de sensibilidad. Propón plan y pruébalo
   conmigo.

C) MÓDULO PARA MÚSICOS (docs/MUSICOS.md): metrónomo, BPM/tonalidad (manual y
   estimada), ChordPro, transposición, LRC local, pitch shift, setlists, notas
   y stems (Demucs queda post-entrega). Propón orden, alcance por fase y
   criterios de aceptación.

D) LOGIN OBLIGATORIO CON BASE DE DATOS: para usar la app hay que iniciar
   sesión y los usuarios deben quedar en la base de datos. La SCP de AWS
   bloquea Cognito/Amplify/Lambda/DynamoDB, así que probablemente sea auth
   local en IndexedDB (PBKDF2-SHA256) con AuthProvider. Hay decisiones
   abiertas: biblioteca existente, bibliotecas por usuario, recuperación de
   contraseña, migración del perfil local. Pregúntame antes de planificar en
   firme.

E) REFINAR + DESPLIEGUE (Día 4): revisión final por pantallas, verificación
   end-to-end del Web Playback SDK de Spotify, E2E nuevos, deploy S3 +
   CloudFront + ACM + app.jenilarper.dev y ROTAR la access key expuesta. No
   desplegar ni rotar nada hasta que yo lo pida.

REGLAS DEL PROYECTO (no negociables):
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main al cerrar cada
  bloque verificado.
- Nada oscuro por defecto (el modo oscuro es opcional y conmutable).
- La portada se ve en el disco; la UI se tiñe MUCHO con los colores del álbum.
- Una sola barra de reproducción por vista; cero superposiciones.
- El núcleo académico son las LISTAS DOBLES HECHAS A MANO (punteros prev/next,
  sin métodos de frameworks): biblioteca, playlists, Lista (cola), historial,
  shuffle, undo/redo y modo Estructura. Cualquier función nueva de orden debe
  pasar por la DLL.
- Validar SIEMPRE antes de commitear: format + typecheck + oxlint + tests +
  build + E2E. Y axe sin violaciones para UI.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md (y en
  docs/PENDIENTES.md si cambia algún pendiente).
- No hay tokens de OpenAI válidos y no hay sesión de Spotify en el entorno:
  avísame y pídeme lo que necesites para verificar.

Empieza leyendo y verificando; luego preséntame el plan por fases y tus
preguntas. No escribas código todavía.
```
