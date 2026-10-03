# Accesibilidad

Objetivo: cumplir **WCAG 2.2 nivel AA** en las pantallas principales y ofrecer un panel de opciones para personas con discapacidad. La accesibilidad se implementa desde el inicio, no como parche.

## Requisitos base

| Área | Requisito |
|---|---|
| Imágenes | **Texto alternativo** en carátulas, avatares e íconos decorativos (`alt=""` cuando son decorativos) |
| Teclado | Todo operable con teclado; foco visible; orden lógico; sin trampas de foco |
| Mouse/táctil | Targets ≥ 44×44 px; gestos con alternativa por botón |
| Formularios | `label` asociado, errores con `aria-describedby`, sin depender solo del color |
| Semántica | Landmarks (`header`, `nav`, `main`, `footer`), jerarquía de encabezados correcta |
| Contraste | ≥ 4.5:1 texto normal; ≥ 3:1 texto grande y componentes |
| Idioma | `lang` correcto y actualizado al cambiar de idioma |
| Navegación | Skip-link "Saltar al contenido"; atajos documentados |
| Estados | Anuncios `aria-live` para "cambiando de canción", "temporizador activo", errores |

## Drag & drop accesible

- Cada canción tiene acciones **Mover arriba / Mover abajo / Mover a playlist**.
- Atajos: `Alt + ↑/↓` mueve la canción enfocada.
- Anuncio del resultado: "Canción movida a la posición 2 de 8".
- El modo estructura también es navegable por teclado.

## Panel de opciones para discapacidad

Preferencias persistentes (IndexedDB/localStorage) y aplicadas al instante:

| Opción | Qué hace |
|---|---|
| Tamaño de texto | Escala 100 % – 200 % sin romper el layout |
| Tipografía para dislexia | Activa OpenDyslexic (fuente incluida) |
| Alto contraste | Paleta con contraste AAA y bordes marcados |
| Reducir movimiento | Desactiva giro del vinilo, ondas animadas y transiciones; respeta `prefers-reduced-motion` |
| Modo daltonismo | Paletas seguras para deuteranopia/protanopia |
| Controles grandes | Aumenta tamaño de botones y áreas táctiles |
| Modo lector de pantalla | Etiquetas extendidas, menos decoración, anuncios más verbosos |
| Velocidad de animación | Normal / lenta / ninguna |

## Pruebas

- `axe-core` en cada página principal (objetivo: 0 violaciones críticas).
- Recorrido completo solo con teclado en: importar, reproducir, reordenar, crear playlist, cambiar ajustes.
- Revisión manual con **VoiceOver** (macOS/iOS) y **NVDA** (Windows).
- Verificación de contraste con herramienta dedicada.
- Test automático del panel: activar cada opción y comprobar que persiste tras recargar.

## Declaración de accesibilidad

- Página `/legal/accesibilidad` en ES/EN/PT con: nivel objetivo, medidas tomadas, limitaciones conocidas y **canal de reporte** (correo de contacto).
- Compromiso: corregir barreras reportadas durante el proyecto.

## Nota legal

En Colombia, la Ley 1618 de 2013 y la Ley 1712 de 2014 promueven accesibilidad en servicios digitales; WCAG 2.2 AA es el estándar técnico adoptado por el proyecto. Esta sección es informativa y no constituye asesoría legal.
