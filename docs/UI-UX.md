# UI/UX

> Interfaz temporal bien implementada: la dirección visual final se definirá con la autora. Todo se construye sobre **tokens de diseño** para que el rediseño sea barato.

## Concepto

**"Vinyl Studio claro"**: la sensación de un tocadiscos cálido y luminoso, sin tema oscuro. El disco gira con la carátula, el brazo acompaña, y las ondas del audio viven en la barra inferior y alrededor del vinilo.

## Principios

1. **Claridad primero**: jerarquía tipográfica fuerte, nada de decoración que estorbe.
2. **El vinilo es el héroe**: la carátula manda; la lista es densa pero legible.
3. **Movimiento con propósito**: animaciones cortas y naturales (skills de Emil Kowalski), nunca bloqueantes.
4. **Claro, no infantil**: cálido, con textura sutil de papel/madera clara.
5. **PC y móvil de verdad**: no es un desktop encogido; el móvil tiene su propio flujo.

## Tokens (propuesta inicial)

```css
:root {
  --color-bg: #FAF6F0;          /* crema */
  --color-surface: #FFFFFF;
  --color-surface-2: #F3ECE3;
  --color-ink: #2B2622;         /* texto principal */
  --color-ink-muted: #6E645D;   /* contraste >= 4.5:1 */
  --color-border: #E6DDD2;
  --color-primary: #E4572E;     /* coral/terracota */
  --color-primary-strong: #A93A19;
  --color-primary-soft: #FBE4DC;
  --color-accent: #1F7A8C;      /* teal */
  --color-accent-soft: #DCEEF1;
  --color-wood: #D9B382;        /* detalles */
  --color-success: #3E8E5A;
  --color-danger: #C0392B;

  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 24px;

  --shadow-soft: 0 6px 24px rgb(43 38 34 / 0.08);
  --shadow-disc: 0 24px 60px rgb(43 38 34 / 0.18);
  --shadow-bar: 0 -8px 30px rgb(43 38 34 / 0.06);

  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-6: 24px; --space-8: 32px;

  --font-display: "Fraunces Variable", serif;      /* títulos */
  --font-body: "Inter Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}
```

Los tokens se implementan en Tailwind v4 (`@theme` en `src/styles/index.css`) y las tipografías se autoalojan con `@fontsource-variable` (sin peticiones a terceros).

Tipografía: `Fraunces` (display, cálida) + `Inter` (cuerpo) + mono para el modo estructura.

## Layout

### Escritorio

```text
┌───────────────┬──────────────────────────────────────────┐
│ Sidebar       │  Zona central                            │
│ · Carpetas    │  ┌───────────────┐  ┌─────────────────┐  │
│ · Playlists   │  │ Vinilo +      │  │ Cola / lista    │  │
│ · Ajustes     │  │ ondas         │  │ con scroll      │  │
│ · Accesibilidad│ └───────────────┘  │ drag & drop     │  │
│               │  Controles + letra │                 │  │
├───────────────┴────────────────────┴─────────────────┴──┤
│ Barra inferior: carátula · título · onda · controles    │
│ progreso · volumen · velocidad · timer · mini player    │
└──────────────────────────────────────────────────────────┘
```

### Móvil

- Una columna; navegación inferior con 3 pestañas (Biblioteca, Playlists, Ajustes).
- **Now Playing** a pantalla completa con vinilo, gesto de deslizar para cambiar canción.
- Barra mini persistente al navegar; se expande al tocarla.
- Drag & drop con pulsación larga y feedback táctil.

## Componentes clave

| Componente | Descripción |
|---|---|
| `VinylDisc` | Disco que gira ligado al estado de reproducción; carátula o patrón si no hay |
| `Tonearm` | Brazo decorativo que se posa al reproducir |
| `WaveformBar` | Onda en la barra inferior (AnalyserNode) + progreso |
| `WaveRing` | Anillos de onda alrededor del vinilo |
| `SongList` | Lista virtualizada con scroll, drag & drop y fila "sonando" |
| `MiniPlayer` | Versión compacta flotante |
| `TimerPanel` | Tiempos y número de canciones |
| `StructureView` | Visualizador de nodos y punteros de la lista doble |
| `A11yPanel` | Opciones de accesibilidad |
| `CookieConsent` | Banner granular |

## Modo estructura (extra estrella)

- Vista tipo diagrama: cada nodo es una tarjeta con su canción; flechas `prev`/`next`; el nodo actual resaltado.
- Animación al insertar, eliminar, mover y cambiar de canción.
- Toggle "pausar animaciones" y versión de alto contraste.
- Contador visible: `length`, índice del actual.

## Motion (guía)

- Duraciones: 120–200 ms micro-interacciones; 300–400 ms transiciones de vista.
- Easing: springs suaves para arrastrar; `ease-out` para entradas.
- Regla de oro: el movimiento no bloquea la interacción ni retrasa el audio.
- `prefers-reduced-motion` y toggle propio desactivan giros y ondas animadas.

## Estados

- **Vacío**: portada ilustrada + "Importa tus primeras canciones".
- **Cargando**: esqueletos suaves; nunca spinners eternos.
- **Error**: mensaje claro + acción de reintento; errores de archivo con motivo.
- **Sin permisos** (micrófono/cookies): explicación y alternativa.

## Responsive

| Breakpoint | Comportamiento |
|---|---|
| `< 640px` | Una columna, nav inferior, now playing completo |
| `640–1024px` | Sidebar colapsable, vinilo mediano |
| `> 1024px` | Layout de tres zonas con barra inferior completa |

## Skills de diseño a usar

- `impeccable` (4.5.0) — auditoría y pulido de UI.
- `animate`, `improve-animations`, `review-animations`, `apple-design`, `animation-vocabulary` — calidad de animaciones.
- `design-taste-frontend`, `high-end-visual-design`, `minimalist-ui` — dirección estética anti-genérica.
