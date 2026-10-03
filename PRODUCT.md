# PRODUCT.md — Legato

## Qué es

Reproductor de música web (PWA) para músicos y estudiantes, construido sobre **listas doblemente enlazadas implementadas a mano**. Proyecto académico sin fines de lucro de Jenifer Daniela Urbano Córdoba (Universidad Cooperativa de Colombia).

## Audiencia y escena

Músic@s que ensayan y estudiantes de estructuras de datos. Uso en escritorio y celular, con luz de día o de casa: la interfaz es clara, nunca oscura. Sesiones frecuentes y casuales, a veces con el celular apoyado en un atril.

## Trabajos

- Importar música propia del equipo y reproducirla (sin canciones hardcodeadas).
- Organizar playlists y carpetas (varias listas dobles independientes).
- Reordenar canciones con drag & drop sin perder la canción en curso.
- Herramientas de ensayo: velocidad, loop A–B, karaoke M/S.
- Evidenciar la estructura con el visualizador "modo estructura".

## Verdad del producto

- Solo archivos del usuario; biblioteca privada.
- Sin analítica ni rastreadores; solo cookies esenciales con consentimiento granular.
- Cuenta: Cognito correo/contraseña (timebox) con perfil local como respaldo.
- Despliegue: AWS Amplify en `app.jenilarper.dev`.
- Idiomas ES/EN/PT. Accesibilidad WCAG 2.2 AA.

## Fuera de alcance (MVP)

Sync multi-dispositivo, Google IdP, ACRCloud, Spotify, Demucs, transcodificación.

## Restricciones

- Entrega en 4 días; interfaz temporal bien implementada sobre tokens.
- Repositorio privado; commits simples sin `Co-Authored-By`.
