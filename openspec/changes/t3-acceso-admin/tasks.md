## 1. API de sesión

- [ ] 1.1 Tests funcionales (deben fallar): login correcto con id y email y sin contraseña, 422 con formato inválido, 400 con el mismo mensaje para contraseña incorrecta y email inexistente, 429 al sexto intento fallido, 401 sin sesión, logout y 401 posterior, cookie HttpOnly y SameSite=Strict
- [ ] 1.2 Validador, servicio `LoginThrottle`, controlador de sesión, grupo de rutas `/api/admin` y cookie `SameSite=Strict`; tests en verde

## 2. Panel en Nuxt

- [ ] 2.1 Test de la página de login (debe fallar): muestra el mensaje de error ante credenciales incorrectas
- [ ] 2.2 Middleware de ruta `admin`, layout del panel, página de login y portada del panel; test en verde
- [ ] 2.3 Verificación manual: `/admin` sin sesión redirige al login, login con el administrador de la semilla, cierre de sesión

## 3. Cierre

- [ ] 3.1 README 2.5 actualizado con la protección CSRF real
- [ ] 3.2 `make test`, typecheck y lint en verde
