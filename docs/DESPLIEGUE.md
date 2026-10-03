# Despliegue

## Objetivo

Publicar Legato en **AWS Amplify Hosting** con HTTPS en `app.jenilarper.dev` para el Día 4.

## Arquitectura de despliegue

```text
GitHub (privado) ──► AWS Amplify Hosting ──► CloudFront (CDN) ──► app.jenilarper.dev
                          │
                          └── Certificado HTTPS automático (ACM)
Cognito User Pool (us-east-1) ──► login correo/contraseña
```

- Región: `us-east-1`.
- Plan gratuito AWS 2026: hasta **$200 en créditos por 6 meses**; la cuenta se cierra al agotarlos o a los 6 meses (salvo pasar a Paid).
- Servicios always-free relevantes: Amplify (capas gratuitas mensuales), Cognito (50 000 MAU), Lambda/DynamoDB (post-entrega).

## Pasos del Día 4

1. `bun run build` sin errores.
2. Crear la app en Amplify (consola: https://console.aws.amazon.com/amplify/home) conectada al repo privado.
3. Verificar el primer deploy en la URL `*.amplifyapp.com`.
4. **Custom domain** → agregar `app.jenilarper.dev`.
5. Amplify mostrará los registros DNS; agregarlos en **name.com**.

## DNS en name.com (paso a paso)

> No se tocan los nameservers. Se usan registros CNAME en la pestaña **DNS Records**.

1. Entrar a https://www.name.com/account/domain → clic en `jenilarper.dev`.
2. Abrir la pestaña **DNS Records** (no "Nameservers").
3. **Add Record** por cada registro que entregue Amplify (normalmente dos):
   - Un **CNAME de validación** del certificado (nombre tipo `_xxxxx.app`).
   - Un **CNAME del subdominio** `app` apuntando al dominio de Amplify.
   - Tipo: `CNAME` · Host: el indicado · Answer/Target: el indicado · TTL: `300`.
4. Guardar y esperar la verificación (5–30 min). Amplify emite el certificado y activa HTTPS.

## Cognito (Día 1, timebox)

1. User Pool en `us-east-1`, login por correo/contraseña.
2. Dominio del Hosted UI: `legato-<algo>.auth.us-east-1.amazoncognito.com`.
3. App client con callback URLs: `http://localhost:5173` y `https://app.jenilarper.dev`.
4. IdP de Google: **diferido** (se agrega después sin tocar código).
5. Fallback: si el timebox no alcanza, `LocalAuthProvider` y Cognito queda para post-entrega.

## Presupuesto y control de costos

- Alerta de presupuesto mensual de **$1** ya creada en AWS Budgets.
- Sin NAT Gateway, sin RDS, sin servicios que cobren por hora en el MVP.
- CloudFront/Amplify tienen capas gratuitas; vigilar el panel de facturación la primera semana.
- Post-entrega: límites de subida y cuotas por usuario para evitar abuso y costos.

## Seguridad del despliegue

- La **access key compartida por chat se rota/desactiva al terminar la entrega**.
- Las credenciales viven solo en `~/.aws/credentials` (permisos `600`), nunca en el repo.
- El repo es privado; `.gitignore` bloquea `.env*` y archivos de claves.
- Post-entrega: usar roles de IAM específicos y secretos en SSM/Secrets Manager.

## Post-entrega (backend completo)

- S3 para audio con URLs prefirmadas (multipart y reintentos).
- Lambda + API Gateway + DynamoDB para playlists/sesión y sync multi-dispositivo.
- Proxy de ACRCloud y servicio de stems (Demucs) según se decida.
