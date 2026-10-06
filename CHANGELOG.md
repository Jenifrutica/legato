# Changelog

## v0.2.0 — 5 de octubre de 2026

Cierre de reproductor, import de Spotify, herramientas de biblioteca y base para el rediseño móvil.
Base: **325 tests unitarios + 16 E2E** en verde, typecheck/oxlint/build OK, axe 0, detector de impeccable `[]`.

### Reproductor

- **Crossfade real con solape** en audio local (segundo deck enrutado por el grafo) y **fundido de volumen** en Spotify/streams (el SDK no permite solapar).
- Arreglado el **«golpe»** al cambiar de pista: el volumen de arranque se fija explícitamente (`0` si hay fundido de entrada).
- El volumen del usuario **no se pisa** durante los fundidos (Spotify ya no queda mudo).
- **Velocidad**: hasta 2× y oculta en Spotify (el SDK/DRM no la permite).
- **La Lista (cola) se guarda y restaura** por sesión (se corregía que `teardownSession` pisaba la sesión al montar).

### Música / fuentes

- **Import de playlists de Spotify** por lotes con **barra de progreso**; trae **todas** las pistas a la playlist (aunque ya estén en la biblioteca) y evita duplicar en la biblioteca.
- Pista de contacto en el panel para **pedir acceso** (User Management) con nombre y correo de Spotify.
- **Import funciona en Development mode** sin `Add user` cuando Spotify expone los datos (`?fields=`), con paginación.

### Autenticación y sincronización

- Login obligatorio con **Firebase** (correo/Google, verificación) y **respaldo local**; **Google como vía principal**.
- Pantalla de verificación alcanzable (reenviar / «ya lo confirmé» / Google).
- Sincronización por usuario en Firestore con audios **troceados** en Firestore (sin plan Blaze).
- La puerta de entrada **no se cuelga** si la red bloquea Firebase (timeout).

### Biblioteca y playlists

- Botón directo **«Añadir a la Lista»** en cada fila + menú (añadir al final / reproducir siguiente).
- **«Eliminar todo»** la biblioteca con **confirmación en línea**; limpia análisis/acordes/letras/notas y deja las **playlists a 0**.
- Borrar playlist con confirmación en línea (sin `window.confirm`).

### Interfaz

- **Selector de idioma** legible en el login y en la barra.
- **Metrónomo**: BPM editable (permite escribir, no solo flechas).
- **Ondas**: más rango dinámico (golpes fuertes más marcados, suaves más suaves).
- **Letras**: sin retraso (cambio de línea ligeramente anticipado) y **no desaparecen al pausar**.
- Zona del vinilo (cuadrado de tinta) más contenida.

### Infra / entorno

- Listas largas con render por tramos («Mostrar más») para no congelar el navegador.
- `?reset=1` para recuperar la app borrando datos locales.

## v0.1.0

- Versión inicial: núcleo de listas doblemente enlazadas a mano, reproductor, biblioteca, playlists, rediseño Duotono 62, cápsula nostálgica, letras (LRCLIB), PWA y proveedores de música.
