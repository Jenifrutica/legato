# Entorno de desarrollo

## Instalado por el agente (Fase 0)

| Herramienta | Versión / ubicación | Notas |
|---|---|---|
| Bun | 1.4.2 · `~/.bun/bin/bun` | Gestor de paquetes y runtime de scripts |
| AWS CLI v2 | 2.37.9 · `~/.local/aws-cli` (bin en `~/.local/bin/aws`) | Instalación sin sudo |
| Credenciales AWS | `~/.aws/credentials` (chmod 600) | Usuario IAM `reproo`, cuenta `793452510776`, región `us-east-1` (verificado con `sts get-caller-identity`) |
| git | ya instalado | Usuario: JeniFedora · jenifer.urbano@campusucc.edu.co |
| gh | 2.97.0, autenticado | Cuenta: Jenifrutica |
| Skills | `~/.agents/skills` + symlinks a `~/.config/opencode/skills` y `~/.claude/skills` | Instaladas con `npx skills` (paquete `skills` 1.7.x) |
| impeccable | 4.5.0 | Actualizado desde `pbakaus/impeccable`; comando en `~/.config/opencode/command/impeccable.md` |

## Skills instaladas (set curado)

**emilkowalski/skills** (diseño e ingeniería de animación):

- `animate`, `animation-vocabulary`, `emil-design-eng`
- `find-animation-opportunities`, `improve-animations`, `review-animations`
- `apple-design`, `pick-ui-library`, `prototype`, `break-ui`

**Leonxlnx/taste-skill** (dirección estética anti-genérica; nombres reales de las skills):

- `design-taste-frontend`, `redesign-existing-projects`
- `imagegen-frontend-web`, `minimalist-ui`, `high-end-visual-design`

**impeccable** (`pbakaus/impeccable`): actualizado a **4.5.0** en `~/.agents/skills`, `~/.config/opencode/skills` y `~/.claude/skills`.

Actualizar en el futuro:

```bash
npx -y skills update -g -y
```

## Comandos del proyecto

```bash
bun install            # dependencias
bun run dev            # servidor local (http://localhost:5173)
bun run build          # build de produccion
bun run lint           # oxlint (linter por defecto de Vite 8)
bun run typecheck      # tsc -b
bun run format         # prettier --write
bun run test           # vitest run
bun run test:watch     # vitest en modo watch
bun run test:coverage  # cobertura
```

Nota: el template actual de Vite 8 usa **oxlint** en lugar de ESLint; se mantiene Prettier para formato.

## Verificación de AWS

```bash
aws sts get-caller-identity   # debe mostrar la cuenta 793452510776 y el usuario reproo
```

## Variables de entorno (previsto)

```bash
# .env.local (nunca se sube al repo)
VITE_LOCAL_MODE=true
VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_DOMAIN=
```

## Pendientes del entorno

- [x] `bun install` y dependencias base del proyecto.
- [x] Lint (oxlint) + formato (Prettier) configurados.
- [x] Vitest + Testing Library + jsdom con smoke test.
- [ ] Playwright + navegadores (Día 1–2).
- [ ] Rotar la access key al terminar la entrega.
