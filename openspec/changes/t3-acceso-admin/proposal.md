## Why

Implementa el ticket **T3 — Acceso del administrador al panel** de la historia **HU4 — El administrador accede al
panel de forma segura** (README, secciones 5 y 6). Revisar candidatos (T4) y lanzar búsquedas del agente (T5) son
acciones que publican contenido y gastan cuota de proveedores de pago: solo el administrador puede hacerlas.

## What Changes

- Inicio y cierre de sesión del administrador con email y contraseña, y consulta del administrador actual.
- Protección de todas las rutas `/api/admin/*` en el servidor: sin sesión responden 401.
- Límite de intentos de inicio de sesión fallidos.
- Cookie de sesión `httpOnly`, `SameSite=Strict` y `Secure` en producción.
- Pantalla de login en Nuxt y protección de las páginas `/admin/*`, que redirigen al login sin sesión; portada
  del panel con enlaces a las secciones de los tickets siguientes.

## Capabilities

### New Capabilities

- `acceso-admin`: autenticación del administrador por sesión y protección del panel y de su API.

### Modified Capabilities

(ninguna)

## Fuera de alcance

- Registro de nuevos administradores, recuperación de contraseña y "recordarme": el administrador se crea con la
  semilla.
- Roles o permisos distintos entre administradores.

## Impact

- `backend/`: controlador de sesión, validador, limitador de intentos, grupo de rutas `/api/admin` con middleware
  de autenticación, configuración de la cookie de sesión.
- `frontend/`: página `admin/login`, layout del panel, middleware de ruta `admin`, portada `admin/index`.
