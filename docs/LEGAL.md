# Legal, privacidad y cookies

> Proyecto **académico sin fines de lucro**. Estos textos son una plantilla seria y revisable; no constituyen asesoría legal.

## Datos del responsable (para las páginas legales)

| Campo | Valor |
|---|---|
| Nombre | Jenifer Daniela Urbano Córdoba |
| Institución | Universidad Cooperativa de Colombia |
| Correo de contacto | jenifer.urbano@campusucc.edu.co |
| País | Colombia |
| Finalidad | Proyecto estudiantil, sin fines de lucro |

## Páginas a construir

| Ruta | Contenido |
|---|---|
| `/legal/privacidad` | Aviso y política de privacidad |
| `/legal/terminos` | Términos y condiciones de uso |
| `/legal/cookies` | Política de cookies + centro de preferencias |
| `/legal/accesibilidad` | Declaración de accesibilidad y canal de reporte |
| `/legal/licencias` | Licencias de software y recursos de terceros |

Todas en **ES / EN / PT**, accesibles desde el footer y desde el registro.

## Minimización de datos (conecta solo lo necesario)

| Dato | ¿Se recoge? | Dónde | Para qué |
|---|---|---|---|
| Nombre/avatar de perfil | Sí (MVP local) | Navegador (IndexedDB) | Personalización |
| Correo electrónico | Solo con Cognito | AWS Cognito | Inicio de sesión |
| Archivos de audio | Sí | IndexedDB (MVP); S3 post-entrega | Reproducción del usuario |
| Metadatos de canciones | Sí | IndexedDB | Biblioteca |
| Sesión de reproducción | Sí | IndexedDB | Reanudar al recargar |
| Analítica / rastreo | **No** | — | — |
| Micrófono | Post-entrega (ACRCloud) | Solo al usar la función, con permiso explícito | Identificar canción |

## Cookies y consentimiento

**Verificación realizada:**

- **Colombia** (Ley 1581 de 2012, Decreto 1377 de 2013 y guías SIC): las cookies que identifican o rastrean son dato personal y requieren consentimiento previo e informado; las estrictamente necesarias están exentas en la práctica, pero exigen política y aviso.
- **UE** (GDPR/ePrivacy): consentimiento previo obligatorio para cookies no esenciales; las esenciales están exentas.

**Decisión:** Legato usa **solo cookies esenciales** (sesión y preferencias). Aun así se implementa un **banner de consentimiento granular**:

- Esenciales: siempre activas (informadas, no desactivables).
- Opcionales: apagadas por defecto (hoy no hay ninguna; la arquitectura queda lista).
- Botones: "Aceptar todas", "Rechazar opcionales", "Preferencias".
- Se guarda versión del documento aceptado y fecha.
- Sin scripts no esenciales antes del consentimiento.
- **Sin cookies de terceros ni analítica.**

## Qué dicen las páginas (esqueleto)

### Privacidad
Datos recogidos, finalidad, base legal (consentimiento/ejecución), ubicación (navegador y AWS), terceros (Google y ACRCloud cuando se activen), retención, derechos (conocer, actualizar, rectificar, suprimir), mecanismo para ejercerlos, seguridad, cambios de la política.

### Términos
Uso personal y académico; prohibición de subir contenido sin derechos; el usuario es responsable de su contenido; no se permite uso comercial; disponibilidad sin garantía; límites de responsabilidad; ley aplicable (Colombia).

### Cookies
Listado de cookies esenciales, su finalidad y duración; centro de preferencias; cómo revocar el consentimiento.

### Licencias
Software de terceros (React, Vite, Dexie, dnd-kit, i18next, etc.) con sus licencias; tipografías (Fraunces, Inter, OpenDyslexic) y sus licencias.

## Derechos de autor

- La app **no distribuye** música: reproduce archivos que cada usuario importa a su biblioteca privada.
- Aviso visible: "No subas contenido sobre el que no tengas derechos".
- Sin funciones de descarga desde servicios de streaming.
- Spotify (post-entrega): solo metadata y previews de 30 s, respetando sus términos.
- Música de demostración (si se necesita): Jamendo / Free Music Archive con licencias libres.
- Canal de contacto para solicitudes de retiro (estilo DMCA) en la página de términos.

## Pendientes

- [ ] Redacción final de los tres documentos en ES/EN/PT (Día 3).
- [ ] Revisión por la institución o un profesional antes de uso público.
- [ ] Flujo de eliminación de cuenta y exportación de datos (post-entrega, con backend).
