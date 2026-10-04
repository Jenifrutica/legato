# Inicio de sesión — estado, seguridad y configuración

> **Estado: implementado y obligatorio.** Para usar Legato hay que iniciar sesión; sin sesión solo se ve la puerta de entrada. El proveedor real es **Firebase Authentication**; si falta su configuración, la app usa un **respaldo local** con cuentas en IndexedDB (para clase sin internet y para los E2E).

## 1. Cómo funciona

- **Gate en `App`**: al abrir, `AuthContextProvider` inicializa el proveedor; sin usuario → `LoginScreen` (Entrar / Crear cuenta / Recuperar); con usuario sin verificar → pantalla «Confirma tu correo»; con sesión → el shell completo.
- **Firebase (correo/contraseña + Google)**: verificación de correo obligatoria, restablecimiento por correo, Google siempre verificado, sesiones gestionadas por el SDK y **política de 7 días** (`legato.auth.loginAt`; pasados 7 días se cierra la sesión).
- **Respaldo local** (`LocalAuthProvider`): cuentas en IndexedDB con **PBKDF2-HMAC-SHA256** (310 000 iteraciones, salt de 16 bytes, comparación en tiempo constante) y token de sesión opaco (solo se guarda su SHA-256; caduca a los 7 días). No tiene recuperación por correo (la UI la oculta).
- **Datos por usuario**: canciones, playlists, sesión, análisis, acordes, letras, setlists y notas llevan `userId`; los stores se hidratan al entrar y se vacían al salir. **El primer usuario adopta los datos huérfanos** (tu biblioteca actual pasa a tu cuenta). Los tokens de Spotify (`legato.spotify.tokens.<uid>`) y el historial de la cápsula (`legato.plays.*`) también son por usuario y **sobreviven al cerrar sesión** en el mismo navegador. Los ajustes del dispositivo (tema, accesibilidad, ondas, idioma, consentimiento) quedan globales.
- **Eliminar cuenta** (Ajustes): borra el usuario y todos sus datos (Firebase o IndexedDB).

## 2. Configurar Firebase (una vez, ~5 minutos)

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google y crea un proyecto (p. ej. `legato-jenilarper`). Puedes desactivar Google Analytics.
2. En el menú lateral: **Compilación → Authentication → Comenzar**.
   - Pestaña **Sign-in method** → activa **Correo electrónico/Contraseña**.
   - Activa también **Google** (elige un correo de asistencia y guarda).
3. **Configuración del proyecto** (engranaje) → **Tus apps** → icono **Web `</>`** → registra una app web (nombre `legato-web`). Copia el objeto `firebaseConfig`.
4. Pégalo en **`.env.local`** (nunca se sube al repo):
   ```
   VITE_AUTH_MODE=firebase
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=legato-....firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=legato-...
   VITE_FIREBASE_APP_ID=1:...:web:...
   ```
5. En **Authentication → Settings → Authorized domains** añade:
   - `127.0.0.1` (desarrollo, ya suele estar `localhost`; añade la IP)
   - `app.jenilarper.dev` (cuando despleguemos)
6. En **Authentication → Templates** puedes personalizar los correos (verificación y restablecimiento) en español.
7. Reinicia el servidor de desarrollo y verifica: registro → llega el correo → confirmas → entras; «Recuperar» envía el enlace; Google abre el popup.

> Sin esos valores, la app arranca en **modo local** (cuentas del navegador) y el E2E funciona igual. En el pie de la pantalla de acceso no se anuncia el proveedor; la política de privacidad ya declara Firebase/Google.

## 3. Seguridad (decisiones)

- La contraseña **nunca** se guarda en claro: Firebase la cifra en su backend; el respaldo local guarda PBKDF2 + salt.
- La sesión local es un token aleatorio de 32 bytes; en IndexedDB solo vive su SHA-256, con caducidad; al cerrar sesión se revoca.
- Verificación de correo obligatoria con Firebase (los usuarios de Google ya vienen verificados).
- El borrado de cuenta elimina también los datos musicales del usuario en este navegador.
- Cognito queda como vía futura (bloqueado por la SCP de la cuenta AWS); su provider sigue en el repo con métodos «no soportado».

## 4. Archivos

| Pieza | Archivo |
|---|---|
| Interfaz y errores tipados | `src/features/auth/types.ts` |
| Selección de proveedor (Firebase si hay config, si no local) | `src/features/auth/create-auth-provider.ts` |
| Firebase (correo/Google/verificación/reset/borrado) | `src/features/auth/firebase-auth-provider.ts` |
| Respaldo local (PBKDF2 + sesiones) | `src/features/auth/local-auth-provider.ts`, `password-hash.ts` |
| Contexto y puerta | `src/features/auth/auth-context.tsx`, `src/ui/LoginScreen.tsx`, `src/app/App.tsx` |
| Datos por usuario y migración | `src/features/persistence/persistence.ts` (v7 del esquema), `spotify.ts` (`setSpotifyScope`), `play-log.ts` |
| Cuenta (cerrar/eliminar) | `src/features/sources/SettingsPanel.tsx` |

## 5. Pruebas

- **Unit**: PBKDF2 (hash/verify/salt/comparación), cuentas locales (registro, login, duplicados, borrado), selección de proveedor, migración de huérfanos y filtrado por usuario.
- **E2E** (modo local): `tests/e2e/auth.spec.ts` (registro, gate, salida, error de contraseña, entrada, eliminación) y el helper `registerAndEnter` en los 7 E2E existentes.
- **Manual con Firebase** (cuando esté configurada): registro con verificación real, Google, recuperación por correo y borrado; comprobar los dominios autorizados.
