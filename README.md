# Legato

> **Nombre temporal** — sujeto a cambio. Logo e icono definitivos pendientes (mientras tanto se usa un placeholder de vinilo con onda).

Reproductor de música web para músicos, construido sobre **listas doblemente enlazadas implementadas a mano** (punteros `prev`/`next`, sin métodos de frameworks como respaldo). Funciona en PC y móvil, con interfaz visual tipo vinilo, drag & drop, visualizador en vivo de la estructura de datos y despliegue en AWS.

**Estado actual: Fase 0 — planeación, repositorio y entorno (sin código de aplicación aún).**

## Stack

| Capa | Tecnología |
|---|---|
| Runtime / paquetes | Bun |
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Audio | Web Audio API + HTMLAudioElement |
| Estructuras de datos | Lista doblemente enlazada propia (`src/core/doubly-linked-list`) |
| Estado | Zustand (previsto) |
| Drag & drop | dnd-kit |
| Persistencia | IndexedDB (Dexie); S3 + DynamoDB post-entrega |
| i18n | i18next (ES / EN / PT) |
| Tests | Vitest + Testing Library + fast-check + Playwright + axe-core |
| Deploy | AWS Amplify + Cognito (us-east-1) |

## Documentación

| Documento | Contenido |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | Plan de entrega de 4 días, alcance y riesgos |
| [docs/DECISIONES.md](docs/DECISIONES.md) | Registro de decisiones del proyecto |
| [docs/ARQUITECTURA.md](docs/ARQUITECTURA.md) | Arquitectura, módulos y modelo de datos |
| [docs/ESTRUCTURA-DATOS.md](docs/ESTRUCTURA-DATOS.md) | Especificación de la lista doble y semántica del reproductor |
| [docs/FUNCIONALIDADES.md](docs/FUNCIONALIDADES.md) | Funcionalidades MVP y post-entrega |
| [docs/UI-UX.md](docs/UI-UX.md) | Concepto visual, tokens y experiencia |
| [docs/ACCESIBILIDAD.md](docs/ACCESIBILIDAD.md) | Plan WCAG 2.2 AA y opciones para discapacidad |
| [docs/LEGAL.md](docs/LEGAL.md) | Privacidad, términos, cookies y datos legales |
| [docs/TESTING.md](docs/TESTING.md) | Estrategia de pruebas y regresión del bug #12 |
| [docs/DESPLIEGUE.md](docs/DESPLIEGUE.md) | AWS Amplify, dominio y DNS en name.com |
| [docs/ENTORNO.md](docs/ENTORNO.md) | Entorno local, Bun, AWS CLI y skills |

## Aviso académico

Proyecto estudiantil **sin fines de lucro** de Jenifer Daniela Urbano Córdoba, Universidad Cooperativa de Colombia. No se distribuye música con derechos de autor: cada persona es responsable del contenido que importa a su biblioteca privada.

## Licencia

Pendiente de definir (proyecto académico).
