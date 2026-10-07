# Despliegue

## Estado: DESPLEGADO (6 oct 2026) — https://legato.jenilarper.dev

Cuenta AWS **437845271540** (usuario IAM **`legato`**, `us-east-1`). Recursos:

| Recurso | Valor |
|---|---|
| Dominio | **https://legato.jenilarper.dev** (alias `app.jenilarper.dev` en CloudFront, sin DNS) |
| Bucket S3 | `legato-jenilarper` (privado) |
| CloudFront | distribución **`E9MLZCEKQU3MI`** → `dcrshaabn8bkj.cloudfront.net` |
| OAC | `E2Z4MMF0ZX0PCN` |
| ACM (us-east-1) | wildcard **`*.jenilarper.dev`** |
| DNS (name.com) | `legato` CNAME → `dcrshaabn8bkj.cloudfront.net` + CNAME de validación del wildcard |

- **CloudFront**: HTTPS, `403/404 → /index.html 200` (SPA), `sw.js`/`manifest.webmanifest` sin caché.
- **Build**: `VITE_SPOTIFY_REDIRECT_URI=https://legato.jenilarper.dev bun run build`.
- **Actualizar**: `aws s3 sync dist s3://legato-jenilarper --delete` + `create-invalidation --distribution-id E9MLZCEKQU3MI --paths "/*"`.
- **Firebase**: añadir `legato.jenilarper.dev` en Authentication → Authorized domains.
- **Spotify**: añadir `https://legato.jenilarper.dev` en Redirect URIs; para el import, **Add user** en User Management (Development mode).
- **Seguridad**: rotar la access key de AWS (expuesta) y crear alerta de presupuesto.

## Restricción antigua (cuenta anterior 793452510776)

> Nota histórica: la cuenta anterior tenía una SCP que bloqueaba Cognito/Amplify/Lambda/DynamoDB. El despliegue actual ya NO depende de esa cuenta.


La cuenta AWS `793452510776` pertenece a una organización con una **Service Control Policy (SCP)** que bloquea explícitamente: **Cognito, Amplify, Lambda y DynamoDB**. Servicios disponibles verificados: **S3, CloudFront, ACM, Route 53, EC2 e IAM**.

Consecuencias:

- El login del MVP usa **perfil local** (`LocalAuthProvider`); el `CognitoAuthProvider` ya está implementado y se activa con variables de entorno cuando exista una cuenta sin SCP.
- El despliegue usa **S3 + CloudFront** en lugar de Amplify (ambos permitidos).
- El backend post-entrega (Lambda/DynamoDB) requiere otra cuenta.

## Objetivo

Publicar Legato con HTTPS en `app.jenilarper.dev` usando S3 + CloudFront + ACM.

## Arquitectura de despliegue

```text
GitHub (privado) ──► build local ──► Amazon S3 (privado, solo CloudFront)
                                        │
                                        ▼
                              CloudFront (CDN + HTTPS)
                                        │
                     ACM (certificado us-east-1, validación DNS)
                                        │
                                        ▼
                              app.jenilarper.dev (CNAME en name.com)
```

- Región: `us-east-1` (ACM para CloudFront debe vivir ahí).
- Plan gratuito AWS 2026: hasta **$200 en créditos por 6 meses**; vigilar presupuesto.

## Pasos del Día 4

1. `bun run build` sin errores.
2. Crear bucket S3 privado (p. ej. `legato-jenilarper`) y subir `dist/`.
3. Crear certificado ACM en `us-east-1` para `app.jenilarper.dev` (validación DNS).
4. Agregar el CNAME de validación en name.com (pestaña **DNS Records**).
5. Crear la distribución CloudFront:
   - Origin: el bucket (con Origin Access Control).
   - Viewer certificate: el certificado ACM.
   - Alternate domain name (CNAME): `app.jenilarper.dev`.
   - Error pages 403/404 → `/index.html` con respuesta 200 (SPA).
6. Agregar el CNAME de `app` apuntando al dominio de CloudFront en name.com.
7. Verificar HTTPS y caché (`index.html` sin caché, assets con caché larga).

## DNS en name.com (paso a paso)

> No se tocan los nameservers. Se usan registros CNAME en la pestaña **DNS Records**.

1. Entrar a https://www.name.com/account/domain → clic en `jenilarper.dev`.
2. Abrir la pestaña **DNS Records** (no "Nameservers").
3. **Add Record** por cada registro:
   - CNAME de validación del certificado ACM (nombre `_xxxxx.app`, TTL 300).
   - CNAME del subdominio `app` apuntando al dominio de CloudFront (TTL 300).
4. Guardar y esperar la verificación (5–30 min).

## Cognito (implementado, bloqueado por SCP)

- `CognitoAuthProvider` usa OAuth 2.0 con PKCE contra el Hosted UI (sin SDKs pesados): `authorize`, intercambio de `code` en `/oauth2/token`, refresh y logout.
- Para activarlo en una cuenta sin SCP:
  1. Crear User Pool con login por correo/contraseña.
  2. Crear dominio `legato-<cuenta>.auth.us-east-1.amazoncognito.com`.
  3. App client público (sin secreto) con callback/logout URLs `http://localhost:5173` y `https://app.jenilarper.dev`, flujo `code`, scopes `openid email profile`.
  4. Definir en `.env.local`: `VITE_LOCAL_MODE=false`, `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REDIRECT_URI`.
- El IdP de Google se agrega después (Google Cloud quedó diferido).

## PWA y modo offline

- `public/manifest.webmanifest` + `public/sw.js` (app shell). El service worker se registra **solo en producción** (`import.meta.env.PROD`).
- La biblioteca, las playlists y la sesión viven en IndexedDB, así que la app funciona sin conexión tras la primera visita.
- En CloudFront: servir `sw.js` y `manifest.webmanifest` con `Cache-Control: no-cache` para que las actualizaciones lleguen; el resto de assets con caché larga.

## Presupuesto y control de costos

- Alerta de presupuesto mensual de **$1** creada en AWS Budgets.
- Sin NAT Gateway, sin RDS, sin servicios por hora en el MVP.
- CloudFront y S3 tienen capas gratuitas; vigilar facturación la primera semana.
- Post-entrega: límites de subida y cuotas por usuario.

## Seguridad del despliegue

- La **access key compartida por chat se rota/desactiva al terminar la entrega**.
- Credenciales solo en `~/.aws/credentials` (permisos `600`), nunca en el repo.
- Bucket S3 privado con Origin Access Control; nada público salvo CloudFront.
- Post-entrega: roles IAM específicos y secretos en SSM/Secrets Manager.

## Post-entrega (backend completo)

- Requiere una cuenta AWS sin SCP para Lambda + DynamoDB + S3 de audio.
- Sync multi-dispositivo (última edición gana), ACRCloud y Demucs según se decida.
