# Metrónomo — cómo funciona y qué hay que arreglar

> Documento de trabajo para una sesión específica de metrónomo. Explica **cómo se usa**, **cómo está construido** y deja lista una **lista de problemas y arreglos** con criterios de aceptación. El resto del módulo de músicos vive en `docs/MUSICOS.md`.

## 1. Cómo se usa (para la autora)

1. **Ajustes (⚙) → Modo músico** debe estar activado.
2. Abre el panel de músicos: pestaña vertical **«Estructura»** (borde derecho de la pantalla).
3. Pestaña **Práctica** (el metrónomo está debajo de «BPM y tonalidad»).
4. Controles:
   - **Iniciar / Detener**: arranca o para el clic.
   - **BPM**: tempo de 30 a 240. También se puede escribir a mano.
   - **Marcar**: tap tempo; toca 2+ veces al ritmo y el BPM se calcula solo.
   - **Compás**: 2/4, 3/4, 4/4 y 6/8 (en 6/8 se acentúan el tiempo 1 y el 4).
   - **Volumen del clic**: independiente del volumen de la música.
   - **Usar en el metrónomo** (en «BPM y tonalidad» de la pista): copia el BPM detectado de la canción al metrónomo.
5. El clic suena **encima de la música** (local o Spotify); no la pausa.
6. BPM, compás y volumen se recuerdan al recargar.

## 2. Cómo está construido

| Pieza | Archivo | Qué hace |
|---|---|---|
| Programador puro | `src/features/musician/metronome.ts` | `MetronomeScheduler`: lookahead de 120 ms, devuelve los clics a agendar; acentos (`isAccent`); al cambiar el BPM reagenda desde el último clic; si el reloj se atrasa, resincroniza sin perder la fase. |
| Motor Web Audio | `src/features/musician/metronome.ts` | `MetronomeEngine`: `setInterval` de 25 ms que pide clics al programador y los sintetiza (oscilador cuadrado, acento 1568 Hz / normal 1047 Hz, envolvente 2 ms ataque / 70 ms caída) contra **su** `AudioContext` (el del grafo de audio del reproductor). |
| Estado | `src/features/musician/metronome-store.ts` | Zustand: `running`, `bpm`, `beatsPerBar`, `volume`; persistencia en `localStorage` (`legato.metronome.v1`). |
| UI | `src/ui/MetronomePanel.tsx` | Panel dentro de la pestaña Práctica; tap tempo con `nextTap` (compartido con las ondas). |
| Integración | `src/ui/MusiciansPanel.tsx` | Pestaña Práctica; solo visible con Modo músico. |

Flujo del clic:
```
MetronomePanel → useMetronomeStore.toggle() → MetronomeEngine.start()
  → scheduler.start(context.currentTime + 0.05)
  → setInterval(25 ms) → scheduler.tick(context.currentTime)
      → clics { time, accent } → oscilador + gain → context.destination
```

Notas de diseño:
- El programador es **puro y testeado** (`metronome.test.ts`): acentos por compás, cambio de BPM, resincronización tras pausas largas, motor con contexto falso y sin contexto.
- El clic va al **mismo `AudioContext`** del grafo local (`getAnalyser().audioContext`), por eso suena junto a la música sin pasar por los efectos (no le afectan balance/karaoke/bajos).
- El metrónomo es **independiente de la pista**: no conoce la posición de la canción ni el beat real; su tempo es el que marque el usuario.

## 3. Problemas conocidos / sospechas (a verificar y arreglar)

> La autora reportó: «no entiendo bien cómo funciona». Además de la explicación de uso, hay que mejorar claridad y comportamiento.

1. **Muy poca señal visual**: no se ve el pulso. Se propone un **indicador de tiempo en vivo** (1-2-3-4 con el acento resaltado) en el propio panel, alimentado por el mismo programador (p. ej. el engine expone `onBeat(beatIndex)` o el scheduler devuelve el índice).
2. **No se sincroniza con la canción**: el clic empieza cuando pulsas, no en el tiempo 1 de la pista. Ideas:
   - **Cuenta previa** (1 compás) antes de arrancar.
   - **Sincronía por posición**: usar el BPM de la pista y su fase (`analysis.beatOffset` o los `detectedBeats` del micrófono) para alinear el primer clic con el beat actual de la reproducción.
3. **Latencia**: el clic puede percibirse ligeramente tarde respecto a la música; medir y ofrecer compensación (± ms) si se sincroniza con la pista.
4. **Salida de audio**: el clic sale por el `AudioContext` (dispositivo por defecto). Si el usuario elige otra salida con `setSinkId` en el reproductor, el clic **podría seguir sonando en la salida por defecto**. Verificar y, si pasa, enrutar el clic por el mismo elemento/salida o permitir elegir.
5. **Subdivisiones**: no hay corcheas/negras con swing; valorar «negra / corchea / tresillo».
6. **Solo clic / click sobre música**: hoy siempre suena encima; valorar botón «pausar la música al iniciar».
7. **Accesibilidad**: el botón de iniciar no anuncia el tiempo; con el indicador visual, usar `aria-live` con moderación (no en cada clic para no saturar lectores).
8. **Estados al salir**: al cerrar el panel, el metrónomo sigue sonando (por diseño). Decidir si debe parar al cerrar la pestaña Práctica o al pausar la música.

## 4. Cómo reproducir y depurar

1. `~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort` → `http://127.0.0.1:5173` (no `localhost`).
2. Ajustes → Modo músico; panel de músicos → **Práctica**:
   - Iniciar a 120 BPM, compás 4/4: debe oírse un clic por medio segundo con acento cada 4.
   - Cambiar BPM mientras suena: el siguiente clic se reagenda sin reiniciar.
   - Tap tempo: 4 toques cada 500 ms → 120 BPM.
3. Pruebas automáticas: `~/.bun/bin/bunx vitest run src/features/musician/metronome.test.ts`.
4. Si algo se queda «stale» tras editar: reiniciar el server y `rm -rf node_modules/.vite`.

## 5. Criterios de aceptación del arreglo

- Al arrancar se ve el tiempo actual **1-2-3-4** con el acento distinguido.
- Con «sincronizar con la pista» activado y una canción local analizada (BPM + fase), el acento cae con el tiempo 1 de la música (a ojo/oído).
- Cuenta previa opcional de un compás.
- El clic respeta la **salida de audio** elegida (o se documenta claramente que no puede).
- Test unitario nuevo del indicador/cuenta previa (scheduler devuelve índice de tiempo) y verificación en navegador con captura.
- Todo sigue con i18n ES/EN/PT, axe 0 y `impeccable detect` en `[]`.

## 6. Archivos que tocará la sesión de metrónomo

- `src/features/musician/metronome.ts` (scheduler/engine: índice de tiempo, cuenta previa, sincronía).
- `src/features/musician/metronome-store.ts` (opciones nuevas y persistencia).
- `src/ui/MetronomePanel.tsx` (indicador, opciones).
- `src/features/musician/metronome.test.ts` (tests nuevos).
- Este documento y `docs/ESTADO.md`/`docs/CONTEXTO-COMPLETO.md` al cerrar.
