# Autenticación y sincronización

> **Estado (6 oct 2026):** login con **Firebase Auth** (**Google** + correo/contraseña) y **sincronización en la nube** con **Firestore**. Sin verificación de correo obligatoria. Respaldo **local** (IndexedDB, PBKDF2) si falta la configuración de Firebase. Proyecto Firebase: **`legato-5ba6f`**.

## Qué hay

- **Puerta de entrada** (`AuthGate` en `src/app/App.tsx`): muestra la **landing** con el login si no hay sesión, y el reproductor si la hay. La verificación de correo **no bloquea**.
- **Firebase** (`src/features/auth/firebase-auth-provider.ts`): Google (acción principal) y correo/contraseña; recuperación y borrado de cuenta.
- **Respaldo local** (`local-auth-provider.ts`): cuentas PBKDF2 (≥150k) en IndexedDB + invitado. Se activa si no hay config de Firebase.
- **Datos por usuario** (Dexie `userId`): biblioteca, playlists, sesión, análisis, acordes, letras y notas. El primer usuario **adopta** los datos huérfanos.
- **Sincronización** (`src/features/sync/`): Firestore con metadatos + **audios troceados** (`fileManifests` + `fileChunks`); fusión por `updatedAt` + lápidas; toggle en Ajustes; funciona solo con Firebase configurado.
- **Tokens de Spotify por usuario**: se guardan como `legato.spotify.tokens.<userId>`. **Al cambiar de cuenta (p. ej. de local a Google) hay que reconectar Spotify en cada dispositivo.**

## Configuración (Firebase)

1. Consola **https://console.firebase.google.com** → proyecto **`legato-5ba6f`**.
2. **Authentication → Sign-in method**: activa **Google** y **Correo/contraseña**.
3. **Authentication → Settings → Authorized domains**: añade **`legato.jenilarper.dev`** (y `127.0.0.1` para local).
4. **Firestore Database**: créala y publica las reglas por usuario (ver `docs/CONTEXTO-COMPLETO.md`).
5. `.env.local` con `VITE_AUTH_MODE=firebase` + `VITE_FIREBASE_*` (plantilla en `.env.example`).

## Spotify (relacionado)

- **Redirect URIs** del dashboard: `https://legato.jenilarper.dev` y `http://127.0.0.1:5173`.
- **iPhone/iPad**: se usa **Spotify Connect** (controla la app de Spotify del teléfono); el SDK no es fiable en iOS. El resto usa el **Web Playback SDK**.
- **Import de playlists**: en Development mode hay que **Add user** (hasta 5) o pedir **Extended Quota**.

## Historial

- En una sesión intermedia se retiraron Firebase/sync para “desplegar sin base de datos”; la autora lo revirtió en la sesión 9 y quedó **como estaba** (Firebase + sync), con **sin verificación de correo**.
