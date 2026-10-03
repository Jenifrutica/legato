# Plan de entrega — 4 días

- **Inicio:** sábado 3 de octubre de 2026
- **Entrega objetivo:** martes 6 de octubre de 2026
- **Modalidad:** MVP con extras priorizados por tiempo disponible
- **Repositorio:** privado, commits simples sin `Co-Authored-By`

## Objetivo

Reproductor de música web para músicos que demuestre el uso **real** de listas doblemente enlazadas hechas a mano, con una interfaz visual sobresaliente y desplegado en AWS.

## Criterios de éxito (rúbrica)

| Peso | Criterio | Evidencia |
|---|---|---|
| Alto | Lista doble / estructuras | Implementación con punteros sin frameworks, suite de tests, visualizador "modo estructura" en vivo |
| Alto | UI/UX y diseño | Interfaz tipo vinilo clara, responsive PC/móvil, drag & drop, ondas reactivas |
| Alto | Despliegue | AWS Amplify en `app.jenilarper.dev` con HTTPS |

## Alcance MVP (comprometido)

### Día 1 — Base y núcleo académico
- Repo privado + documentación de planeación + issues.
- Entorno: Bun, AWS CLI, skills curadas, impeccable actualizado.
- `src/core/doubly-linked-list/`: implementación a mano + tests (borde, property-based, regresión #12).
- Tokens de diseño + shell de UI (layout vacío con zonas).
- Timebox de Cognito (correo/contraseña) con fallback a perfil local.

### Día 2 — Reproductor y UI estrella
- Player engine (Web Audio + HTMLAudioElement): play/pausa, seek, volumen, next/prev.
- Interfaz vinilo: disco girando con carátula, ondas reactivas, barra inferior, mini reproductor.
- Importar archivos y carpetas del equipo (File API), extracción de metadatos.
- CRUD de canciones y playlists (múltiples listas dobles).
- Drag & drop con corrección del bug #12 + alternativa de teclado.
- **Modo estructura**: visualizador en vivo de la lista doble (nodos, punteros, nodo actual).
- i18n ES / EN / PT.

### Día 3 — Persistencia y extras
- IndexedDB + sesión persistente (recargar y continuar).
- Temporizador (tiempos y número de canciones), velocidad, shuffle/bucles, scroll de canciones.
- Panel de accesibilidad + páginas legales/cookies (plantillas 3 idiomas).
- Extras por prioridad: herramientas de ensayo → undo/redo → karaoke M/S.
- Tests E2E smoke + regresión #12.

### Día 4 — Pulido y despliegue
- Pasada de `impeccable` / `review-animations` para pulir UI.
- Responsive PC/móvil (touch targets, gestos).
- Deploy AWS Amplify + `app.jenilarper.dev` + CNAME en name.com.
- README, docs finales y demo.

## Extras priorizados (si el tiempo alcanza)

1. **Modo estructura** — visualizador de la lista doble (mayor impacto en rúbrica).
2. **Herramientas de ensayo** — loop A–B + control de velocidad (0.5x–2x).
3. **Undo/redo** — pila de comandos sobre operaciones de la lista.
4. **Karaoke M/S** — cancelación de fase para atenuar voz.

## Fuera de alcance (post-entrega)

- Sync multi-dispositivo con S3 + DynamoDB y resolución de conflictos (última edición gana).
- IdP de Google en Cognito (Google Cloud quedó diferido).
- ACRCloud (búsqueda tipo Shazam por micrófono).
- Spotify (solo metadata/preview).
- Demucs (separación real de instrumentos) y transcodificación de audio.
- Analítica (decisión: ninguna).

## Riesgos y mitigación

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Cognito no queda en el timebox | Medio | Fallback a perfil local con interfaz `AuthProvider` |
| DNS del dominio en name.com | Alto el Día 4 | CNAME manual con TTL 300; verificar temprano |
| iOS Safari (cuota, formatos, autoplay) | Medio | Validación con aviso, IndexedDB, Media Session |
| Bug de orden al arrastrar canción en reproducción | Alto | `currentNode` por puntero, tests de regresión #12 |
| Tiempo insuficiente | Alto | Extras priorizados y recortables en orden inverso |

## Definición de terminado (DoD)

- [ ] Tests unitarios y E2E smoke en verde.
- [ ] Build de producción sin errores ni warnings críticos.
- [ ] App accesible por HTTPS en `app.jenilarper.dev`.
- [ ] README y docs actualizados.
- [ ] Sin secretos en el repositorio.
- [ ] Repositorio privado con historial de commits legible.
