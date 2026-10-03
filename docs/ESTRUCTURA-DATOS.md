# Estructura de datos — lista doblemente enlazada

Este es el núcleo académico del proyecto. La lista se implementa **a mano**, con punteros `prev`/`next`, sin usar arrays internos ni métodos de frameworks que hagan el trabajo.

## Nodo

```ts
interface Node<T> {
  value: T;
  prev: Node<T> | null;
  next: Node<T> | null;
}
```

## Lista

```ts
class DoublyLinkedList<T> {
  head: Node<T> | null;
  tail: Node<T> | null;
  length: number;
}
```

### Invariantes (verificadas en tests)

1. `head.prev === null` y `tail.next === null`.
2. Para todo nodo `n`: `n.next?.prev === n` y `n.prev?.next === n`.
3. `length` coincide con el recorrido real.
4. Sin ciclos: el recorrido desde `head` termina y su longitud es `length`.

## Operaciones y complejidad

| Operación | Descripción | Complejidad |
|---|---|---|
| `prepend(value)` | Inserta al inicio | O(1) |
| `append(value)` | Inserta al final | O(1) |
| `insertAt(index, value)` | Inserta en posición | O(n) |
| `removeFirst()` / `removeLast()` | Elimina extremos | O(1) |
| `removeAt(index)` | Elimina por posición | O(n) |
| `removeNode(node)` | Elimina por referencia | O(1) |
| `find(predicate)` | Busca por valor | O(n) |
| `nodeAt(index)` | Acceso por índice | O(n) |
| `moveNode(node, targetIndex)` | Reordena por punteros | O(n) |
| `swapNodes(a, b)` | Intercambia nodos | O(1) |
| `reverse()` | Invierte la lista | O(n) |
| `iterator()` | Recorrido bidireccional | O(1) por paso |

## Semántica del reproductor

- La reproducción se ancla a un **nodo**, no a un índice: `currentNode: Node<Song> | null`.
- `next()` → `currentNode.next` (o `head` si bucle "toda"; o repite si bucle "una").
- `prev()` → `currentNode.prev`.
- Historial de atrás/adelante: listas dobles separadas para que "anterior" funcione como en un navegador.
- Aleatorio: se construye una lista doble paralela `playOrder` con los mismos nodos en orden aleatorio (Fisher–Yates implementado a mano sobre la lista). Apagarlo vuelve al orden original **desde el nodo actual**.
- Añadir canciones con aleatorio activo: se insertan también en `playOrder`.

## Bug #12 — orden de reproducción al arrastrar

**Síntoma reportado:** si suena la canción 1 y se arrastra la 3 a la posición 1, la reproducción "salta" a la canción 3 en lugar de seguir con la 1.

**Causa raíz:** guardar la posición actual como **índice**. Al reordenar, el índice 0 pasa a apuntar a otra canción.

**Solución:** guardar `currentNode` como **puntero**.

```text
Antes:  [1*] → [2] → [3]        (* = suena)
Acción: mover [3] a la posición 1

Con índice (mal):  currentIndex = 0  → ahora apunta a [3]  ✗
Con puntero (bien): currentNode = nodo(1) → sigue sonando [1]  ✓

Resultado:  [3] → [1*] → [2]
```

- `moveNode` solo re-enlaza `prev`/`next`; el nodo actual conserva su identidad.
- Al guardar la sesión se persiste el **id** de la canción actual y el orden; al restaurar se reconstruye la lista y se reancla `currentNode` por id.
- Tests unitarios y E2E cubren exactamente este escenario.

## Serialización y sesión

```ts
interface PlaylistSnapshot {
  id: string;
  name: string;
  order: string[];       // ids de canciones, en orden
  updatedAt: number;
  schemaVersion: number; // migraciones futuras
}
```

Al restaurar: se crean los nodos en el orden guardado y `currentNode = find(songIdActual)`.

## Undo/redo (extra)

Pila de comandos (`CommandStack`) con `do`/`undo` sobre operaciones de la lista:

- `InsertCommand`, `RemoveCommand`, `MoveCommand`, `RenameCommand`.
- Cada comando guarda lo necesario para revertirse sin copiar toda la lista.
- Deshacer/rehacer usa dos pilas (una doblemente enlazada, para mantener el espíritu del taller).

## Benchmark (evidencia académica)

Script que mide y documenta:

| Operación | Lista doble | Array |
|---|---|---|
| Insertar al inicio | O(1) | O(n) |
| Insertar al final | O(1) | O(1) amortizado |
| Insertar en medio (puntero) | O(1) | O(n) |
| Eliminar por referencia | O(1) | O(n) |
| Acceso por índice | O(n) | O(1) |

Resultado esperado: la lista doble gana en inserciones/eliminaciones por referencia (el caso real del reproductor) y pierde en acceso aleatorio por índice.

## Tests requeridos

- Lista vacía: `removeFirst`, `removeLast`, `removeAt`, `next`, `prev`.
- Un solo nodo: eliminar el actual, mover a la misma posición.
- Cabeza, cola y medio en todas las operaciones.
- `moveNode` del nodo actual a cualquier posición → la reproducción no cambia.
- `moveNode` a la misma posición, hacia adelante y hacia atrás.
- Aleatorio activado/desactivado y con canciones añadidas.
- Restauración de sesión con la canción actual en medio.
- Property-based: miles de operaciones aleatorias mantienen los invariantes.
