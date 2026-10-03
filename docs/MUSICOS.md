# Funciones para músicos — estado y especificación

> **Estado: NO implementado todavía** (salvo lo marcado como listo). Esta sección es la visión completa para la fase post-entrega. Se activará desde el perfil: al crear la cuenta/perfil la app pregunta **"¿Quieres experimentar las funciones para músicos?"** y habilita el "Modo músico" (conmutable en Ajustes).

## Ya listo (sirve a músicos hoy)

| Función | Dónde | Estado |
|---|---|---|
| Velocidad de reproducción 0.5x–1x (mantiene el tono si se implementa SoundTouch) | Panel de ensayo | Listo (cambia tono con el motor nativo) |
| Bucle A–B para repetir un pasaje | Panel de ensayo | Listo |
| Karaoke M/S (atenuar voz por cancelación de fase) | Panel de ensayo | Listo |
| Aislamiento de canal L/R y mono | Pestaña Audio | Listo |
| Balance L/R | Pestaña Audio | Listo |
| Crossfade configurable 0–12 s | Panel de ensayo | Listo |
| Temporizador | Barra / héroe | Listo |

## Por implementar (fase músicos)

### 1. Letras y acordes
- Formato **ChordPro** (`.cho`/`.pro`) y letras `.lrc` sincronizadas.
- Parser con `chordsheetjs`: render de acordes sobre la letra, **transposición** ± semitonos, diagramas de acordes por instrumento (guitarra/ukelele/piano).
- Fuente de letras: LRCLIB (libre) o archivos del usuario; nunca scraping con derechos.
- UI: panel lateral de letra con auto-scroll sincronizado y tamaño ajustable.

### 2. Análisis musical
- **BPM y tonalidad** estimados (Web Audio + modelo tipo `essentia.js`/`aubiojs`) y editables por el usuario.
- **Metrónomo** con acento de compás y clic sincronizado a la pista.
- **Cuenta de compases** y marcadores de sección (intro/verso/coro) guardados por canción.

### 3. Herramientas de ensayo avanzadas
- **Velocidad sin cambiar el tono** (SoundTouch o `Tone.GrainPlayer`), con presets 0.5/0.75/0.9/1.
- **Pitch shift** ±12 semitonos independiente de la velocidad.
- **Loop A–B con precisión de compás** (imán a beats) y repeticiones con incremento de velocidad (práctica progresiva).
- **Setlist**: orden de concierto por playlist con notas y duración total.

### 4. Separación de instrumentos (stems)
- Interfaz `StemProvider` (ya diseñada conceptualmente): local (Demucs en backend) o API externa.
- UI por pista: toggles para voz/batería/bajo/otros, mezcla de stems, exportar stem.
- Nota: el karaoke M/S actual es la aproximación inmediata; Demucs es la solución real (post-entrega).

### 5. Notas y anotaciones
- Notas por canción y por sección, con marcas de tiempo.
- Etiquetas: "para ensayar", "lista para concierto", tonalidad, dificultad.
- Compartir setlist (post-entrega junto con playlists compartidas, ver `docs/JAM.md`).

## Arquitectura prevista
- Módulo `src/features/musician/` con submódulos `chords/`, `lyrics/`, `analysis/`, `stems/`, `notes/`.
- Persistencia en IndexedDB (`chords`, `lyrics`, `analysis`, `notes`) y sync posterior a DynamoDB.
- El modo músico no altera el núcleo de listas dobles: solo añade paneles y metadatos por canción.
