# Prompt para una sesión nueva (copiar y pegar)

```text
Vas a continuar el proyecto Legato (reproductor de música con listas doblemente
enlazadas hechas a mano). El contexto absoluto está en:

  /home/jenifrutica/Proyectos/legato/docs/CONTEXTO-COMPLETO.md

PASO 1 (obligatorio): lee ese archivo COMPLETO, especialmente la sección final
"PRIORIDAD NÚMERO 1: REDISEÑAR TODA LA INTERFAZ".

PASO 2: verifica el estado real:
  cd /home/jenifrutica/Proyectos/legato
  ~/.bun/bin/bun run test        # 154 unitarios en verde
  ~/.bun/bin/bun run test:e2e    # 4 E2E en verde
  ~/.bun/bin/bun run build
  ~/.bun/bin/bun run dev --host 127.0.0.1 --port 5173 --strictPort
El usuario abre http://127.0.0.1:5173 (SIEMPRE 127.0.0.1, por Spotify).

PASO 3 (LO PRIMERO): el usuario considera que la interfaz actual está FEA y
quiere un REDISEÑO COMPLETO. Antes de tocar código:
  a) Ejecuta el flujo de impeccable: scripts/impeccable context y lee
     reference/new-work.md.
  b) Propón 2-3 DIRECCIONES VISUALES concretas y distintas (paleta,
     tipografía, composición del héroe con el vinilo, estilo de las ondas,
     superficies) y que el usuario elija con el question tool.
  c) Escribe el direction contract en el surface brief y recién entonces
     implementa. NO iteres a ciegas.
  d) Usa las skills: high-end-visual-design, design-taste-frontend,
     emil-design-eng, animate, review-animations, minimalist-ui, apple-design.
  e) Al terminar: impeccable detect + capturas (Playwright está instalado) y
     revisión responsive 390/768/1024/1280/1440.

REGLAS DEL PROYECTO:
- Commits en inglés, simples, SIN "Co-Authored-By". Push a main al cerrar bloques.
- Nada oscuro por defecto (modo oscuro es opcional y conmutable).
- La portada debe verse en el disco; la UI se tiñe con los colores del álbum
  (que sea notorio). Las ondas rodean el disco y usan la paleta del álbum.
- Una sola barra de reproducción por vista; cero superposiciones.
- Validar todo: typecheck + oxlint + tests + build + E2E antes de commitear.
- Documentar cada tanda en docs/ESTADO.md y docs/CONTEXTO-COMPLETO.md.
- El despliegue es para el "Día 4" (S3 + CloudFront + app.jenilarper.dev);
  no desplegar hasta que el usuario lo pida.

PENDIENTES FUNCIONALES (después del rediseño):
- La NUEVA FUNCIONALIDAD que el usuario aún no especificó: pregúntale.
- Verificar el Web Playback SDK de Spotify (Premium) end-to-end.
- Músicos (docs/MUSICOS.md) y login Cognito/Google (docs/AUTH.md).
- Día 4: deploy + rotar la access key expuesta.
```
