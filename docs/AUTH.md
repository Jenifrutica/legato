# Inicio de sesión — estado y pendientes

> **Estado actual: perfil local activo. Cognito/Google pendientes.**

## Lo que funciona hoy

- **Perfil local** (`LocalAuthProvider`): nombre/avatar guardados en el navegador (localStorage). No hay cuentas reales ni datos en la nube.
- Interfaz `AuthProvider` con dos implementaciones: `LocalAuthProvider` y `CognitoAuthProvider`.
- **Cognito correo/contraseña implementado** (`CognitoAuthProvider` con OAuth 2.0 + PKCE: authorize, token, refresh, logout), pero **no activable en la cuenta AWS actual**: la SCP bloquea Cognito (ver `docs/DESPLIEGUE.md`).
- Chip de cuenta en la barra superior (Iniciar sesión / Salir).

## Lo que falta

| Pendiente | Detalle |
|---|---|
| **Cuenta AWS sin SCP** | Cognito User Pool + dominio Hosted UI + app client público (PKCE). |
| **Google IdP** | Crear proyecto/credenciales en Google Cloud y agregarlo como proveedor en el User Pool (diferido; requiere que Google Cloud permita crear el proyecto). |
| **Flujo de eliminación de cuenta** | Borrar datos de DynamoDB/S3 del usuario y cerrar la cuenta; enlace en Ajustes y en la política de privacidad. |
| **Exportación de datos** | Descargar biblioteca/metadatos (JSON) desde Ajustes. |
| **Sync multi-dispositivo** | S3 + DynamoDB con última edición gana (`updatedAt`), post-entrega. |
| **Protección de la API** | Authorizer JWT de Cognito en API Gateway cuando exista backend. |
| **Cookies/consentimiento con sesión** | Ya implementados (solo esenciales); al activar Cognito, la cookie/token de sesión queda cubierta por la política existente. |

## Cómo se activará (cuando exista la cuenta)

1. Crear User Pool (correo/contraseña) y dominio `legato-<cuenta>.auth.us-east-1.amazoncognito.com`.
2. App client público (sin secreto) con callback/logout `http://localhost:5173` y `https://app.jenilarper.dev`, flujo `code`, scopes `openid email profile`.
3. Definir en `.env.local`: `VITE_LOCAL_MODE=false`, `VITE_COGNITO_DOMAIN`, `VITE_COGNITO_CLIENT_ID`, `VITE_COGNITO_REDIRECT_URI`.
4. Google: agregar IdP en el User Pool con las credenciales de Google Cloud.
5. Probar login/logout y la eliminación de cuenta.

El código ya está listo: no hay que tocar la UI, solo configuración.
