# Registro de decisiones

Todas las decisiones se tomaron entre el 2 y el 3 de octubre de 2026, antes de escribir código de aplicación.

## Producto y alcance

| # | Decisión | Razón |
|---|---|---|
| D01 | Reproductor de música web (PC y móvil) para músicos | Requisito del taller |
| D02 | Nombre temporal **Legato**; logo pendiente | El nombre definitivo y el icono los define la autora |
| D03 | Alcance MVP en **4 días** | Fecha real de entrega |
| D04 | Extras priorizados: modo estructura → ensayo → undo/redo → karaoke M/S | Maximizar rúbrica sin comprometer el MVP |
| D05 | Post-entrega: sync, Google IdP, ACRCloud, Spotify, Demucs, transcodificación | No caben en el plazo |

## Técnicas

| # | Decisión | Razón |
|---|---|---|
| D06 | TypeScript en todo el proyecto | Requisito del taller y seguridad de tipos |
| D07 | React + Vite + Tailwind | Ecosistema maduro para UI, DnD, i18n y PWA |
| D08 | **Bun** como gestor de paquetes | Elección de la autora; rapidez |
| D09 | Repo simple modular (sin monorepo pesado) | "Repo simplecito, no saturar" |
| D10 | Lista doblemente enlazada a mano (sin métodos de frameworks) | Núcleo académico del taller |
| D11 | `currentNode` como puntero, nunca índice | Corrige el bug #12 de reordenamiento |
| D12 | Visualizador "modo estructura" | Evidencia visual del uso real de la estructura |
| D13 | Undo/redo con pila de comandos | Refuerza el uso de estructuras de datos |
| D14 | Persistencia local con IndexedDB + sesión persistente | Recargar y continuar sin backend |
| D15 | Sin analítica de ningún tipo | Minimización de datos |
| D16 | i18n ES / EN / PT con i18next | Requisito del taller |
| D17 | Tests: Vitest + Testing Library + fast-check + Playwright + axe-core | Calidad y regresión del bug #12 |

## Plataforma y despliegue

| # | Decisión | Razón |
|---|---|---|
| D18 | AWS con cuenta nueva (Free plan: hasta $200 en créditos, 6 meses) | Requisito de despliegue |
| D19 | AWS Amplify Hosting + Cognito en `us-east-1` | Ruta más rápida a HTTPS con dominio propio |
| D20 | Dominio `app.jenilarper.dev` (ya propio) | `legato.dev/.app/.fm` están ocupados y no existen dominios gratis registrables |
| D21 | DNS manual con **CNAME en name.com** (pestaña DNS Records) | No tocar nameservers; sin costo |
| D22 | Login: **Cognito correo/contraseña** en el timebox; Google IdP después | Google Cloud quedó diferido; evita riesgo en el plazo |
| D23 | Fallback de login: perfil local con interfaz `AuthProvider` | No frenar el MVP si Cognito falla |
| D24 | S3 + DynamoDB + sync multi-dispositivo: post-entrega | No cabe en 4 días |
| D25 | Conflictos de sync: última edición gana (`updatedAt`) | Simple y predecible (cuando se implemente) |
| D26 | Sin monitoreo de errores externo | Sin terceros ni datos personales |

## Cumplimiento y accesibilidad

| # | Decisión | Razón |
|---|---|---|
| D27 | Cookies: solo esenciales + **consentimiento granular** | Colombia (Ley 1581) y UE (GDPR/ePrivacy) |
| D28 | Páginas de privacidad, términos y cookies en ES/EN/PT | Requisito del taller |
| D29 | Accesibilidad WCAG 2.2 AA + panel de opciones para discapacidad | Requisito del taller |
| D30 | Textos legales redactados como plantilla revisable | Proyecto académico; no sustituyen asesoría legal |
| D31 | Sin fines de lucro; biblioteca privada; responsabilidad del usuario sobre su contenido | Derechos de autor |

## Seguridad

| # | Decisión | Razón |
|---|---|---|
| D32 | Secretos solo en `.env`/`~/.aws`, nunca en el repo | Buenas prácticas |
| D33 | Rotar/desactivar la access key compartida al terminar la entrega | La llave quedó expuesta en el chat |
| D34 | Validación con Zod en formularios, API e importaciones | Robustez |
| D35 | Rate limits y cuotas (post-entrega en la nube) | Evitar abuso y costos |

## Descubrimientos de infraestructura (3 oct 2026)

| # | Decisión | Razón |
|---|---|---|
| D36 | La cuenta AWS está en una organización con **SCP** que bloquea Cognito, Amplify, Lambda y DynamoDB | Verificado con errores `AccessDeniedException` explícitos; disponibles S3, CloudFront, ACM, Route 53, EC2 e IAM |
| D37 | Login del MVP: **perfil local**; `CognitoAuthProvider` implementado y listo para una cuenta sin SCP | Cumple el fallback del timebox sin bloquear el MVP |
| D38 | Despliegue del Día 4 cambia a **S3 + CloudFront + ACM** en vez de Amplify | Amplify está bloqueado; S3/CloudFront/ACM están permitidos |
| D39 | Crossfade **secuencial** (fade-out + fade-in) por defecto 2 s, rango 0–12 s | Sin doble deck en el MVP; el solape real con dos elementos de audio queda post-entrega |
| D40 | Salida de audio con **setSinkId** solo donde el navegador lo soporta (Chromium); fallback silencioso | Firefox/Safari no lo implementan |
| D41 | Modo offline con **service worker en producción** (app shell) + IndexedDB local | No interfiere con el desarrollo; `sw.js` debe servirse sin caché en CloudFront |
| D42 | Jam en tiempo real y playlists compartidas: **post-entrega** con interfaz `JamProvider` y diseño en `docs/JAM.md` | Requiere backend WebSocket y cuentas, bloqueados por la SCP; se sincroniza control, nunca audio |

## Rediseño visual (3 oct 2026, sesión 3)

| # | Decisión | Razón |
|---|---|---|
| D43 | Rediseño completo de la capa visual usando el flujo de **impeccable** (context → new-work → roll → comps → direction contract → build → detect → finish review) y elección de dirección con la autora antes de construir | No volver a iterar a ciegas sobre la UI |
| D44 | Dirección elegida: **Duotono 62** (edición musical impresa a dos tintas: papel hueso, tinta negra y una tinta directa del álbum) | Máxima fuerza gráfica y tipográfica; conserva la portada como protagonista |
| D45 | Se descartan las cartas A (Círculo armónico), C (Partitura) y D (Dos tintas); la notación de C vive dentro del panel de músicos de Duotono | Una sola coherencia visual; la fusión no superó a la dirección pura |
| D46 | Tema por portada redefinido a **tres tintas derivadas** (papel, tinta y tinta directa) con contraste AA y variante oscura; el alto contraste de a11y gana | El pedido es que la UI se tiña de forma notoria sin perder legibilidad |
| D47 | Tipografías: **Archivo variable** (display/UI, eje de ancho), **Source Serif 4** (notación y letras) y **JetBrains Mono** (datos); se retiran Fraunces e Inter | La tipografía es el material gráfico principal |
| D48 | Ondas de **líneas planas** saliendo del disco, en las dos tintas del álbum, grosores alternados estilo tipográfico, sin glow; 30 fps y respeto a `prefers-reduced-motion` | El pedido textual: ondas tipo líneas siguiendo el estilo de la fuente |
| D49 | Panel de músicos (partitura + modo Estructura) como **slide-over con pestaña arrastrable**, minimizable/maximizable y estado persistido | Es una capa para quien explora; no debe cargar la vista por defecto |
| D50 | Letras: diseño e interacción ahora con datos de ejemplo; conexión **LRCLIB + etiquetas/.lrc** en la fase funcional siguiente | No acoplar el rediseño a una API externa |
| D51 | Carril de burbujas reservado en el héroe para la **Cápsula nostálgica** (nueva funcionalidad); se implementa después del rediseño | La funcionalidad anunciada necesita hogar visual desde el inicio |
| D52 | `buildPath: comp` registrado en `.impeccable/config.json`; los comps se produjeron como **mocks HTML locales** capturados con Playwright porque la key de OpenAI estaba vencida (401) | Verificación visual real sin coste ni dependencias |
| D53 | Cápsula nostálgica: generador **determinista** por fecha + usuario sobre la biblioteca local, registro de escuchas en `localStorage` (`legato.plays.v1`), contextos (obsesión/olvidada/hace un año/recién llegada) y «Favoritos» como playlist creada al guardar | Sin backend ni cuentas; el mismo día produce la misma cápsula |
| D54 | El «fondo degradado dinámico» de la cápsula se traduce a **banda dura de tinta directa** detrás de la tarjeta | La regla del mundo prohíbe gradientes decorativos; se conserva el efecto dinámico con dos tintas |
| D55 | Letras con **LRCLIB siempre activo** (título, artista y álbum al reproducir), declarado en la política de privacidad en ES/EN/PT; parser LRC propio y solo letras **sincronizadas** | Decisión de la autora; LRCLIB responde con CORS abierto y no requiere clave |
| D56 | Atribución visible «Letra vía LRCLIB» junto a la línea activa | Respeto al servicio y transparencia para el usuario |

## Cola y playlists (4 oct 2026, sesión 4)

| # | Decisión | Razón |
|---|---|---|
| D57 | Cola con acciones explícitas: `enqueue` (`append`), `playNext` (`insertAt` después del nodo actual), `remove`, `move` y `clear`, todo sobre la lista doble a mano; `currentNode` sigue siendo puntero | El bug #12 no se toca y la cola deja de ser un efecto secundario de reproducir |
| D58 | Se permiten **duplicados** en la cola (encolar una pista ya presente la agrega otra vez) | Comportamiento estándar de una cola de reproducción |
| D59 | Soltar una pista de la biblioteca sobre la pestaña **Cola** encola y abre la pestaña | Gesto directo, sin digitar posiciones |
| D60 | Al quitar la pista que suena, la reproducción salta a la siguiente; si la cola queda vacía, se pausa | Evita que el motor siga con un nodo que ya no está en la lista |
| D61 | «Agregar a…» siempre visible; la opción «＋ Nueva playlist» crea una lista con nombre por defecto («Mi lista») y agrega la pista | DnD y agregado sin salir de la fila, aun sin playlists |
| D62 | Soltar sobre la pestaña **Playlists** agrega a la lista seleccionada (o a la primera); soltar dentro de una playlist abierta acepta biblioteca y resultados de búsqueda y resalta la zona | Un solo gesto para agregar, con feedback visible |
| D63 | El rótulo central del vinilo («Lado A · 33⅓» + nodo) solo se muestra cuando la pista **no tiene portada**; con portada el centro queda limpio | La carátula manda; el rótulo era el detalle que «se iba» encima del arte |
| D64 | El campo de tinta del héroe se extiende hasta el fondo de la zona del disco en vez de terminar sobre él | Su borde inferior y sombra cruzaban el disco y parecía recortado |
| D65 | Mini reproductor flotante abajo-derecha en escritorio, visible siempre que haya pista, arrastrable con posición persistida; en móvil no se muestra (ya está la barra) | En escritorio la página casi no hace scroll, así que «aparecer al salir el disco» nunca se vería |
| D66 | Bajos con **lowshelf a 180 Hz (0–12 dB)** dentro del grafo Web Audio, después del merger y antes del analizador | Control real con headroom; no distorsiona como un boost crudo |
| D67 | Ambiente con **ruido filtrado generado** (lluvia, vinilo, café, viento) conectado directo a la salida, una cama a la vez, apagado por defecto y persistido | Sin archivos con licencia ni terceros; el usuario decide si y cuál |
| D68 | Video mp4: el motor local usa un `<video>` como elemento multimedia; la imagen se muestra en un visor con botón «Ver/Ocultar video» (video silenciado y sincronizado) y el audio sale del motor; `mediaType` viaja en la pista con compatibilidad para registros antiguos | Un solo motor para audio y video, sin duplicar decodificación de audio |
| D69 | El selector de colección pasa a **dropdown propio** (botón + listbox con truncado y `title`) en lugar del `<select>` nativo | El control nativo recortaba el nombre y mostraba solo el final («alo») |
| D70 | Se corrigen los paths de `SkipBackIcon`/`SkipForwardIcon`: estaban espejados (el botón de anterior dibujaba el de siguiente) | Bug visual reportado con captura |
| D71 | Ondas v2: más segmentos (110), líneas de 2–7 px en tinta con agujas de acento, longitud hasta ~1.9× con el pulso de bajos/beat y recorte proporcional hacia abajo para no chocar con el borde de la zona | Se pedían ondas notorias y al ritmo de la música |
| D72 | El mini reproductor pasa a `z-60`, por encima de cápsula, visores y páginas legales: se comporta como widget persistente y arrastrable | Pedido textual: «flotante por encima de otras pantallas» |
| D73 | Nuevo componente `PlaylistPicker`: botón «＋» con lista desplegable de playlists existentes + «＋ Nueva playlist»; reemplaza los `<select>` nativos en biblioteca y resultados descargables de búsqueda | «Necesito un botón que me deje meter a playlist que se desplieguen las que haya» |
| D74 | Cola desde la búsqueda: para Audius/Jamendo se guarda la pista y se hace `enqueue` en la lista doble; para Spotify se usa `POST /me/player/queue` (requiere sesión/Premium) | «Al buscarla, aparte de reproducirla, que salga agregar a cola y se agregue usando lo de listas dobles» |
| D75 | El mini reproductor se puede **sacar del navegador** con Document Picture-in-Picture (ventana siempre encima) y un mini reproductor en página; el botón solo aparece si el navegador soporta la API | «Que flote como tal en el compu»: un widget real sobre otras ventanas |
| D76 | Los estilos del documento principal se clonan dentro de la ventana PiP para que el widget use el mismo mundo Duotono | Una sola hoja de estilos, sin CSS duplicado |
| D77 | La cola de Spotify envía `device_id` (el del SDK) y, si no hay dispositivo, inicializa el reproductor del SDK y reintenta; errores mapeados a mensajes claros (403 Premium, 401 sesión, 404 sin dispositivo) | La API fallaba con «No se pudo guardar la pista» porque no había dispositivo activo |
| D78 | **Revierte** D74/D77: se elimina la cola de Spotify. Spotify aporta **solo la canción** (reproducir); la cola se alimenta únicamente de la **lista doble local** (biblioteca guardada y Audius/Jamendo descargados y guardados) | Pedido de la autora: la cola debe ser la estructura hecha a mano, no la del proveedor |
| D79 | La cola se llama **«Lista»** en la interfaz (ES/EN/PT) y muestra la leyenda «doble enlace»; claves internas siguen en `queue.*` | Refuerza que es la DLL del núcleo académico |
| D80 | Los resultados de Spotify se guardan como **referencia externa** (`external: true`, `sourceUrl = spotify:track:...`, sin blob; `externalUrl` persistido en IndexedDB) y entran a biblioteca, playlists y Lista como cualquier nodo | El botón de playlist/lista debía existir también al buscar en Spotify |
| D81 | El controlador admite un **reproductor externo**: las pistas externas pausan el motor local y se reproducen con el SDK; al cambiar a una local se detiene Spotify, y al terminar la externa la Lista avanza sola | La Lista (doble enlace) sigue mandando el orden, con Spotify solo como fuente de la canción |
| D82 | Los botones siguiente/anterior usan la Lista (no el SDK) cuando la pista actual es externa; las filas de la Lista marcan `SPOTIFY` | Evita que el SDK navegue por su cuenta y mantiene la estructura a mano como fuente de verdad |
| D83 | «Nueva playlist» abre un campo de nombre dentro del propio menú (con botón Crear) en vez de auto-crear con nombre por defecto | La autora quiere nombrar la lista al momento de crearla |
| D84 | Al pulsar una pista de Spotify se reproduce **esa** primero y el resto de la búsqueda después | Antes sonaba la primera de la búsqueda por pasar todas las URIs en orden |
| D85 | El crossfade (0–12 s, secuencial) se expone también en el panel de Audio, además del panel de ensayo | Hacerlo visible/fácil de encontrar; el solape real con doble deck sigue post-entrega |
| D86 | Ondas v3: líneas de 2.4–9 px, longitud hasta 0.14× con pulso ×2.2 y zona del disco más alta (0.68) | Pedido textual: «más notorias, más grandes» |
| D87 | El avance automático reanuda el `AudioContext` desde la suscripción del store (estado `playing`), no solo al pulsar play | Si el navegador suspendía el contexto, la siguiente canción avanzaba sin sonido |
| D88 | El slider de progreso usa estado local de arrastre (`scrub`) mientras se mueve y libera al soltar | Antes el valor controlado rebotaba al `currentTime` del store y se trababa |
| D89 | Ondas v4: líneas finas y largas (1.4–3.2 px, longitud 0.16× con pulso), **papel sobre el campo de tinta directa** y tinta/acento fuera; sin anillo oscuro | «Le pusiste algo negro y se ve feo»: se eliminan los bloques gruesos y el aro |
| D90 | Ondas v5: disco más grande (`min(46rem, 80vw, 72dvh)`, zona 0.72), respuesta espectral suavizada con raíz y longitud hasta 0.19×; la línea fina vuelve como **curva envolvente de las puntas** (cuadráticas) | «Aún más grandes, más notorias, y la línea fina que se adapte a las ondas y forme curvas» |
| D91 | Importar playlists de Spotify desde la pestaña Playlists: `GET /me/playlists` + `/playlists/{id}/tracks` (tope 100 pistas), guardadas como referencias externas en una playlist local | La autora pidió traer sus playlists de la cuenta Premium |
| D92 | Se elimina el rótulo «Lado A · 33⅓» del disco (solo queda el código de nodo cuando no hay portada) | Seguía apareciendo en pistas sin carátula y se veía como error de interfaz |
| D93 | Ondas dirigidas por **onsets de bajos** (promedio móvil + envolvente de energía) para audio local y **pulso sintético a 120 BPM** cuando no hay analizador (Spotify/streaming) | «Las ondas no van al ritmo de la música»; el audio del SDK no se puede analizar por DRM |
| D94 | Sensibilidad de golpes: sin umbral (cualquier subida sobre el promedio dispara), desviación ×5, envolvente con decaimiento 0.82, analizador con smoothing 0.68 | «Más sensible la detección de golpes, no es lo suficiente» |
| D95 | El golpe multiplica **toda** la línea (base incluida) hasta ×2.6, sube la opacidad (0.2→0.9) y hace un **pop radial** (+3.5% del canvas); medido 47.7% de variación de área | «Que en cada golpe sea bien notorio» |
