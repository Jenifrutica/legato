# Testing

## Estrategia

```text
        ▲  E2E (Playwright)         pocos, críticos
       ███  Integración (RTL)       módulos con UI
     █████  Unitarios (Vitest)      núcleo y lógica
   ███████  Property-based          invariantes de la lista doble
```

## 1. Unitarios — lista doble (obligatorio)

- Vacía, un nodo, cabeza, cola y medio para cada operación.
- `removeNode` sobre `head`, `tail` y nodo intermedio.
- `moveNode` a la misma posición, hacia adelante y hacia atrás.
- Reconstrucción desde `order[]` y reanclaje de `currentNode` por id.
- Bucles: ninguna, una, toda (incluye lista de un solo elemento).
- Aleatorio: activar, apagar, añadir canciones con aleatorio activo, `prev` coherente.

## 2. Property-based (fast-check)

- Generar secuencias aleatorias de operaciones y verificar invariantes tras cada paso:
  - `head.prev === null`, `tail.next === null`.
  - Doble enlace consistente (`n.next.prev === n`).
  - `length` correcto y sin ciclos.
- Generar playlists aleatorias, reordenarlas y comprobar que el conjunto de canciones no cambia y no se pierden nodos.

## 3. Regresión del bug #12 (unit + E2E)

Escenario canónico:

1. Playlist `[A, B, C]`; suena `A` (nodo actual).
2. Arrastrar `C` a la posición 1.
3. **Esperado:** sigue sonando `A`; el orden es `[C, A, B]`; `next()` reproduce `B`.

Variantes:

- Arrastrar la canción actual a otra posición y verificar que sigue sonando.
- Reordenar mientras está pausado y reanudar.
- Reordenar, recargar la página y verificar la sesión.

## 4. E2E (Playwright) — smoke

- Login (Cognito o perfil local) y logout.
- Importar archivos de audio y ver la lista.
- Crear playlist, renombrar, eliminar.
- Drag & drop reordenando y el escenario #12.
- Temporizador: 1 canción / 1 minuto (con reloj acelerado).
- Recargar la página y continuar la reproducción en el mismo punto.
- Cambiar idioma ES/EN/PT y verificar textos clave.
- Páginas legales accesibles y consentimiento de cookies.

## 5. Accesibilidad

- `axe-core` en cada página principal (0 violaciones críticas).
- Navegación completa por teclado (tab, foco visible, sin trampas).
- Alternativa de teclado al drag & drop.
- Revisión manual con VoiceOver/NVDA en la pantalla principal y el reproductor.

## 6. Matriz manual

| Plataforma | Navegador | Prioridad |
|---|---|---|
| PC | Chrome | Alta |
| PC | Firefox | Media |
| PC | Edge | Media |
| Android | Chrome | Alta |
| iOS | Safari (PWA) | Alta |

## Cobertura y CI

- Umbral mínimo: 80 % en `src/core/` y `src/player/`; sin umbral global al inicio.
- CI (GitHub Actions): `lint` → `typecheck` → `test` → `build`; E2E en el pipeline de entrega.
- Los tests del núcleo **nunca** se saltan ni se eliminan para "hacer pasar" el build.
