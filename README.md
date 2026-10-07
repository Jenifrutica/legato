<div align="center">

<img src="brand/legui.png" alt="Legui, la mascota vinilo de Legato" width="140" />

# Legato

**Reproductor de música web para músicos**, construido sobre **listas doblemente enlazadas implementadas a mano**.

**App en vivo:** **https://legato.jenilarper.dev**

</div>

> **Legato** es el nombre oficial del proyecto. Su mascota es **Legui**: la “o” de Legato
> convertida en un vinilo con patitas que acompaña al usuario por la app (bienvenida,
> cookies, avisos y errores). El disco va en tinta, la etiqueta en papel y los zapatitos
> usan la **tinta directa del álbum**, así que el personaje se tiñe con la portada que suena.

Reproductor en PC y móvil, con interfaz tipo **edición musical a dos tintas**, drag & drop,
visualizador en vivo de la estructura de datos (la Lista), herramientas para músicos y
despliegue estático en AWS.

## Estado

**v1 desplegada:** **https://legato.jenilarper.dev** (S3 + CloudFront + ACM).

Backend y funcionalidades **completos**: reproductor local y streaming, listas dobles a mano,
playlists, biblioteca, herramientas de músicos, login con **Google** o invitado, **sincronización
en la nube** (Firebase/Firestore) e importación de Spotify. Interfaz **Duotono 62** con la mascota
**Legui**, landing de inicio y Spotify Connect en iPhone. El respaldo local (IndexedDB) sigue
disponible si no hay configuración de Firebase.

## Legui, la mascota

**Legui** es la mascota oficial de **Legato**: un vinilo con patitas cuya cara vive en la
etiqueta del disco. Se implementa como componente reutilizable en
[`src/ui/Legui.tsx`](src/ui/Legui.tsx):

| Componente    | Uso                                                        |
| ------------- | ---------------------------------------------------------- |
| `LeguiMark`   | Legui suelto (disco en tinta).                             |
| `LeguiSticker`| Legui encerrado en un “sticker” de papel, legible sobre cualquier fondo. |
| `LeguiBubble` | Sticker + burbuja de diálogo con **X para cerrar** el aviso. |
| `LegatoLogo`  | Wordmark `LEGAT` + Legui como “o”.                         |

Aparece en la barra superior, la landing de acceso, la bienvenida, el aviso de cookies,
el panel de Spotify y los errores del reproductor. Los zapatitos usan la **tinta directa
del álbum**, así que Legui se tiñe con la portada que suena. Assets en `public/` y `brand/`.

## Stack

| Capa                 | Tecnología                                                       |
| -------------------- | ---------------------------------------------------------------- |
| Runtime / paquetes   | Bun                                                              |
| Frontend             | React + Vite + TypeScript + Tailwind CSS                         |
| Audio                | Web Audio API + HTMLMediaElement                                 |
| Estructuras de datos | Lista doblemente enlazada propia (`src/core/doubly-linked-list`) |
| Estado               | Zustand                                                          |
| Drag & drop          | dnd-kit                                                          |
| Persistencia         | IndexedDB (Dexie) + sincronización (Firestore)                   |
| i18n                 | i18next (ES / EN / PT)                                           |
| Tests                | Vitest + Testing Library + fast-check + Playwright + axe-core    |
| Deploy               | S3 + CloudFront + ACM (`app.jenilarper.dev`)                     |

## Marca y assets

| Archivo                       | Uso                                               |
| ----------------------------- | ------------------------------------------------- |
| `public/favicon.svg`          | Icono de la pestaña (la mascota)                  |
| `public/icon-192.png`         | Icono PWA                                         |
| `public/icon-512.png`         | Icono PWA / maskable                              |
| `public/apple-touch-icon.png` | Icono iOS                                         |
| `public/legui.svg`            | Mascota en vector (componente `src/ui/Legui.tsx`) |
| `brand/legato-wordmark.svg`   | Logo completo `LEGAT` + Legui como “o”            |
| `brand/legato-wordmark.png`   | Logo completo en PNG                              |
| `brand/legui.png`             | Mascota suelta en PNG transparente                |

## Documentación

| Documento                                                            | Contenido                                                    |
| -------------------------------------------------------------------- | ------------------------------------------------------------ |
| [docs/CONTEXTO-COMPLETO.md](docs/CONTEXTO-COMPLETO.md)               | **Contexto absoluto del proyecto (handoff entre sesiones)**  |
| [docs/ESTADO.md](docs/ESTADO.md)                                     | Tablero vivo del avance                                      |
| [docs/PLAN.md](docs/PLAN.md)                                         | Plan de entrega, alcance y riesgos                           |
| [docs/DECISIONES.md](docs/DECISIONES.md)                             | Registro de decisiones del proyecto                          |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md)                         | Arquitectura, módulos y modelo de datos                      |
| [docs/ESTRUCTURA-DATOS.md](docs/ESTRUCTURA-DATOS.md)                 | Especificación de la lista doble y semántica del reproductor |
| [docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md)                   | Funcionalidades MVP y post-entrega                           |
| [docs/UI-UX.md](docs/UI-UX.md)                                       | Concepto visual, tokens y experiencia (Duotono 62)           |
| [docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md)                       | Plan WCAG 2.2 AA y opciones para discapacidad                |
| [docs/LEGAL.md](docs/LEGAL.md)                                       | Privacidad, términos, cookies y datos legales                |
| [docs/TESTING.md](docs/TESTING.md)                                   | Estrategia de pruebas y regresión del bug #12                |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md)                             | AWS S3 + CloudFront, dominio y DNS en name.com               |
| [docs/ENTORNO.md](docs/ENTORNO.md)                                   | Entorno local, Bun, AWS CLI y skills                         |

## Carpeta `ai/`

Todo lo relacionado con las herramientas de IA vive en **`ai/`**, separado del proyecto:

| Ruta                  | Contenido                                                        |
| --------------------- | ---------------------------------------------------------------- |
| `ai/agents/skills/`   | Skills de diseño/animación (awwwards-animations, animejs, manus). |
| `ai/claude/skills/`   | Enlaces a los mismos skills para Claude.                         |
| `ai/impeccable/`      | Artefactos de diseño (comps aprobados, contrato y tokens).       |
| `ai/skills-lock.json` | Lockfile de los skills instalados.                               |

## Aviso académico

Proyecto estudiantil **sin fines de lucro** de Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia. No se distribuye música con derechos de autor: cada persona es responsable del contenido que importa a su biblioteca privada.

## Licencia

Pendiente de definir (proyecto académico).
