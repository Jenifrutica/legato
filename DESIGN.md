---
name: Legato
description: Reproductor de música para músicos, impreso a dos tintas y teñido por la portada.
colors:
  paper: '#f1ede4'
  surface: '#fbf8f1'
  surface-2: '#e7e1d3'
  ink: '#13100c'
  ink-muted: '#5c5548'
  rule: '#13100c'
  border: '#c7bfae'
  spot: '#e14a1f'
  spot-ink: '#b23a12'
  spot-soft: '#fbe0d6'
  on-spot: '#13100c'
  on-ink: '#fbf8f1'
  success: '#2f7d4f'
  danger: '#c62828'
  night: '#0b0e14'
  night-surface: '#12161f'
  night-ink: '#f4efe6'
typography:
  display:
    fontFamily: 'Archivo Variable, Archivo, system-ui, sans-serif'
    fontSize: 'clamp(2.6rem, 7.5vw, 5.5rem)'
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: '-0.01em'
    fontVariation: 'wdth 115%'
  headline:
    fontFamily: 'Archivo Variable, Archivo, system-ui, sans-serif'
    fontSize: '1.5rem'
    fontWeight: 900
    lineHeight: 1
    letterSpacing: '0.02em'
  body:
    fontFamily: 'Archivo Variable, Archivo, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.5
  score:
    fontFamily: 'Source Serif 4 Variable, Georgia, serif'
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: 'JetBrains Mono Variable, ui-monospace, monospace'
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: '0.16em'
rounded:
  none: '0px'
  disc: '9999px'
spacing:
  xs: '4px'
  sm: '8px'
  md: '16px'
  lg: '24px'
  xl: '32px'
components:
  button-spot:
    backgroundColor: '{colors.spot}'
    textColor: '{colors.on-spot}'
    rounded: '{rounded.none}'
    padding: '0'
    size: '64px'
  button-ink:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.on-ink}'
    rounded: '{rounded.none}'
    padding: '8px 16px'
  button-ghost:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '6px 14px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '8px 12px'
  tab-active:
    backgroundColor: '{colors.spot}'
    textColor: '{colors.on-spot}'
    rounded: '{rounded.none}'
    padding: '6px 12px'
  lyric-band:
    backgroundColor: '{colors.spot}'
    textColor: '{colors.on-spot}'
    rounded: '{rounded.none}'
    padding: '8px 16px'
  score-bar:
    backgroundColor: '{colors.surface-2}'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.none}'
    height: '12px'
  disc:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.on-ink}'
    rounded: '{rounded.disc}'
    size: 'min(42rem, 78vw, 70dvh)'
---

# Design System: Legato

## Overview

**Creative North Star: "El Disco de Dos Tintas"**

Legato se diseña como una publicación musical impresa: papel hueso, tinta negra y una sola tinta directa. La interfaz no imita un reproductor oscuro de tarjetas: se comporta como una hoja grabada donde la portada que suena manda. La densidad es de partitura (mono para datos, versalitas para rótulos) y la expresividad es tipográfica (el eje de ancho de Archivo mezcla titulares expandidos y condensados en la misma frase).

Toda la paleta se deriva de la portada en reproducción: papel, tinta y tinta directa salen del álbum con contraste AA garantizado, y el modo oscuro es una inversión opcional, nunca la vista por defecto. El movimiento es material, no decorativo: el disco gira, las ondas son líneas que salen del borde y el resto permanece quieto.

**Key Characteristics:**

- Una sola tinta directa derivada de la portada, usada en campos grandes y selección.
- Radios en cero; el círculo pertenece al vinilo y al disco de reproducción.
- Sombras duras con offset, sin desenfoque; los bordes hacen el trabajo.
- Pentagramas, barras de duración y códigos de nodo como lenguaje de datos.
- Claro por defecto; oscuro conmutable; alto contraste gana sobre el tema.

## Colors

La paleta es una edición a dos tintas: papel y tinta fijos, más una tinta directa que cambia con cada portada.

### Primary

- **Tinta Directa (spot, #e14a1f por defecto; derivada de la portada en runtime):** campos, barras activas, banda de la letra, pestaña activa y botón de reproducción. En modo oscuro se aclara.
- **Tinta Directa de Texto (spot-ink, #b23a12):** toda tinta directa en texto pequeño (numerales, rótulos mono, microtexto). El campo vívido queda solo para cuerpos grandes.

### Neutral

- **Papel (paper, #f1ede4):** fondo de página. En oscuro, `#0b0e14`.
- **Hoja (surface, #fbf8f1):** paneles, tarjetas, hojas deslizantes. En oscuro, `#12161f`.
- **Papel 2 (surface-2, #e7e1d3):** insets, pistas de barras, filas alternas.
- **Tinta (ink, #13100c):** texto y controles primarios; también barra superior. En oscuro, `#f4efe6`.
- **Tinta Suave (ink-muted, #5c5548):** texto secundario y metadatos.
- **Regla (rule, #13100c):** reglas duras de 2px y contornos de controles.
- **Borde (border, #c7bfae):** hairlines suaves y pentagramas.
- **Éxito / Peligro:** `#2f7d4f` y `#c62828`, solo estados.

### Named Rules

**The Two-Ink Rule.** La interfaz usa papel, tinta y exactamente una tinta directa. Cualquier cuarto color es un estado (éxito/peligro) o la portada misma.

**The Field-vs-Ink Rule.** La tinta directa vívida nunca escribe texto pequeño. Los campos usan la tinta vívida; las letras pequeñas usan la tinta directa oscura (`spot-ink`, AA 4.5).

## Typography

**Display Font:** Archivo Variable (con Archivo, system-ui)
**Body Font:** Archivo Variable (con Archivo, system-ui)
**Score Font:** Source Serif 4 Variable (con Georgia)
**Label/Mono Font:** JetBrains Mono Variable

**Character:** Una grotesca de cartel con eje de ancho para el gesto, una serif de grabados para la notación y las letras, y una mono para datos y códigos de nodo. La combinación se lee como una edición impresa, no como una app.

### Hierarchy

- **Display** (900, `clamp(2.6rem, 7.5vw, 5.5rem)`, 0.9): titular del héroe; mezcla anchos (115% / 62%) y la última palabra va en tinta directa.
- **Headline** (900, 1.5rem, 1): títulos de panel y de playlist, en mayúsculas.
- **Title** (600, 1rem, 1.3): títulos de pista y nodos.
- **Body** (400, 1rem, 1.5): texto corrido, descripciones, estados vacíos.
- **Label** (600, 0.6875rem, 0.16em, mayúsculas): metadatos, tiempos, códigos de nodo, pestañas.

### Named Rules

**The Width-Mix Rule.** Un titular puede combinar una palabra expandida con una condensada; esa mezcla es la firma tipográfica, no un capricho.

**The Mono-Data Rule.** Tiempos, códigos de nodo, tamaños y matrices se escriben en JetBrains Mono; nunca en la display.

## Layout

Rejilla de dos columnas en escritorio: escenario flexible y panel de 25rem (`lg`) / 27rem (`xl`). El escenario contiene la media luna del vinilo (círculo completo posicionado fuera de pantalla, jamás recortado con `clip-path`) sobre un campo de tinta directa, y debajo el bloque de reproducción alineado a la izquierda. El panel es una hoja fija con pestañas y contenido con scroll propio.

Breakpoints observados: 390 (móvil: disco arriba, una sola barra inferior + navegación), 768 (apilado), 1024 (panel lateral), 1280 (medida completa) y 1440 (comp aprobado). Una sola barra de reproducción por vista; el panel de músicos vive en la costura escenario/panel como pestaña arrastrable y hoja deslizante, para no superponerse a los controles.

## Elevation & Depth

El sistema es plano: no hay sombras difuminadas ni glows. La profundidad se comunica con sombras duras de imprenta con offset y con reglas de 2px.

### Shadow Vocabulary

- **Reposo de controles** (`box-shadow: 3px 3px 0 var(--color-rule)`): botones secundarios, chips, filas destacadas.
- **Acción primaria** (`box-shadow: 6px 6px 0 var(--color-rule)`): botón de reproducción y CTA.
- **Disco** (`box-shadow: 10px 10px 0 var(--color-rule)`): el vinilo y su campo.
- **Barra móvil** (`box-shadow: 0 -4px 0 var(--color-rule)`): borde duro de la barra inferior.

### Named Rules

**The Hard-Offset Rule.** Si algo se eleva, proyecta una sombra sólida desplazada; nunca se difumina.

**The No-Glow Rule.** Prohibido `box-shadow` con blur, gradientes de resplandor y `backdrop-filter`.

## Shapes

Radios en cero en todo el sistema; la excepción es el círculo, reservado al vinilo, su botón de reproducción y la etiqueta central. Los controles llevan contorno de 2px en tinta o borde suave; las separaciones internas son hairlines de 1px. No hay esquinas redondeadas decorativas ni píldoras.

## Components

### Buttons

- **Shape:** rectángulos sin radio, contorno de 2px y sombra dura al reposo.
- **Primary (tinta directa):** fondo `spot`, icono en `on-spot`, 64px para reproducción; es el único botón con sombra de 6px.
- **Ink:** fondo `ink` con texto `on-ink`; acciones principales de formularios y ajustes.
- **Ghost:** fondo `surface`, borde `rule/40`; acciones secundarias y de panel.
- **Hover / Focus:** se elevan 2px y la sombra se acorta al presionar; foco visible de 3px en tinta directa.

### Tabs

- **Style:** rótulos mono en mayúsculas; la pestaña activa es un bloque sólido de tinta directa con texto `on-spot`.

### Cards / Containers

- **Corner Style:** sin radio.
- **Background:** `surface` sobre `paper`.
- **Shadow Strategy:** sombra dura de reposo; ver Elevation.
- **Border:** 2px `rule` en paneles; `rule/30` en filas suaves.
- **Internal Padding:** escala `sm`/`md`/`lg`.

### Inputs / Fields

- **Style:** borde de 2px, fondo `surface`, sin radio.
- **Focus:** el borde pasa a tinta directa.
- **Range:** pista de 12px con contorno y pulgar cuadrado en tinta directa.

### Navigation

Barra superior de tinta con logomarca en tinta directa, wordmark Archivo negro expandido y controles en color papel. En móvil, navegación inferior de tres destinos con regla superior que se tiñe en el destino activo.

### Disc (signature component)

El vinilo: círculo completo con la portada dentro, anillo de 2px, etiqueta central con código de nodo (`N-01`) y microtexto, girando 6s lineales mientras suena. Las **ondas** son líneas planas que salen del borde en las dos tintas del álbum, con grosores alternados, sin glow.

### Queue Score (signature component)

La cola se dibuja como partitura: numeral mono, título, barra cuya longitud es proporcional a la duración y tiempo en mono. La fila que suena va sobre tinta directa suave con la barra rellena.

## Do's and Don'ts

### Do:

- **Do** posicionar el disco completo fuera de pantalla para la media luna; el giro siempre es real.
- **Do** derivar papel, tinta y tinta directa de la portada con contraste AA.
- **Do** usar `spot-ink` para texto pequeño y `spot` solo en campos y cuerpos grandes.
- **Do** mantener una sola barra de reproducción por vista y reservar la costura escenario/panel para el panel de músicos.
- **Do** escribir tiempos, nodos y métricas en mono.

### Don't:

- **Don't** recortar el disco con `clip-path` ni tapar la portada.
- **Don't** usar radios decorativos, sombras difuminadas, glows ni gradientes de fondo.
- **Don't** escribir texto pequeño en la tinta directa vívida.
- **Don't** apilar dos barras ni superponer el panel de músicos a los controles.
- **Don't** usar el tema oscuro por defecto.
