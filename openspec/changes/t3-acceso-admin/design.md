## Context

T1 dejó creada la tabla `admin_users`, el modelo `AdminUser` con hash y el guard de sesión `web` como guard por
defecto. La semilla crea el administrador de prueba con las credenciales del archivo de entorno. El navegador
llega siempre a través del proxy de Nuxt (mismo origen). La cookie de sesión de AdonisJS está hoy en
`SameSite=lax` y el CSRF de Shield desactivado.

## Goals / Non-Goals

**Goals:**
- Que la protección sea del servidor: la interfaz solo redirige por comodidad.
- Que el panel funcione con el renderizado en servidor de Nuxt (la cookie viaja en las peticiones SSR).

**Non-Goals:**
- Protección frente a fuerza bruta distribuida entre muchos emails (fuera del alcance de una demo).

## Decisions

**1. Rutas.** `POST /api/admin/session` (login), `GET /api/admin/session` (administrador actual) y
`DELETE /api/admin/session` (logout). Todo el grupo `/api/admin/*` salvo el `POST` lleva el middleware `auth`.
Respuestas de error en JSON (`force_json_response_middleware` ya está activo).

**2. Credenciales con `AdminUser.verifyCredentials`.** El mixin de autenticación compara el hash en tiempo
constante y lanza la misma excepción para email inexistente y contraseña incorrecta; el controlador la traduce a
400 con un único mensaje.

**3. Limitador de intentos en memoria.** Un servicio `LoginThrottle` cuenta los fallos por email normalizado en una
ventana de 60 s (sin guardar IPs, coherente con README 2.5). Alternativa descartada: `@adonisjs/limiter` con
almacén en base de datos; añade una dependencia y una tabla para un único endpoint de una demo con un proceso.
Riesgo aceptado: el contador se reinicia al reiniciar el servidor.

**4. CSRF por `SameSite=Strict` + mismo origen.** Se cambia la cookie a `SameSite=Strict`. Como el navegador solo
habla con Nuxt y la API exige JSON, un sitio ajeno no puede enviar la cookie en una petición entre sitios. Se
mantiene desactivado el token CSRF de Shield (requeriría propagar el token XSRF desde el servidor de Nuxt). Se
actualiza el README (2.5) para describir exactamente esta protección.

**5. Frontend.** Middleware de ruta `admin` (Nuxt) que consulta `GET /api/admin/session`: en el servidor usa
`useRequestFetch` para reenviar la cookie entrante; si responde 401 redirige a `/admin/login`. La página de login
llama a `POST /api/admin/session` y navega a `/admin`. Layout `admin` con cabecera y botón "Cerrar sesión".

## Risks / Trade-offs

- [Contador de intentos en memoria] → Se pierde al reiniciar; aceptable para un único administrador en una demo.
- [Sin token CSRF] → Mitigado por `SameSite=Strict`, un único origen y cuerpos JSON; documentado en README.
