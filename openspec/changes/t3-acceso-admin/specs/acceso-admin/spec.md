## Purpose

Garantiza que solo el administrador de la tienda puede entrar al panel y usar su API, mediante una sesión iniciada
con email y contraseña.

## ADDED Requirements

### Requirement: Inicio de sesión del administrador
El sistema SHALL iniciar una sesión cuando el administrador envía su email y contraseña correctos, y SHALL devolver
su identificador y su email. La respuesta MUST NOT incluir la contraseña ni su hash.

#### Scenario: Credenciales correctas
- **WHEN** el administrador envía su email y su contraseña correctos
- **THEN** el sistema inicia la sesión y responde con su identificador y su email

#### Scenario: Formato inválido
- **WHEN** se envía un email mal formado o una contraseña vacía
- **THEN** el sistema responde 422 y no inicia ninguna sesión

### Requirement: Mensaje genérico ante credenciales inválidas
Ante un email inexistente o una contraseña incorrecta el sistema MUST responder con el mismo código (400) y el
mismo mensaje, sin indicar cuál de los dos falló.

#### Scenario: Contraseña incorrecta
- **WHEN** se envía un email existente con una contraseña incorrecta
- **THEN** el sistema responde 400 con el mensaje "Email o contraseña incorrectos"

#### Scenario: Email inexistente
- **WHEN** se envía un email que no corresponde a ningún administrador
- **THEN** el sistema responde 400 con el mismo mensaje "Email o contraseña incorrectos"

### Requirement: Límite de intentos
Tras 5 intentos fallidos en un minuto para un mismo email, el sistema MUST rechazar nuevos intentos con 429 hasta que
pase el minuto, aunque la contraseña sea correcta.

#### Scenario: Sexto intento
- **WHEN** se falla el inicio de sesión 5 veces en un minuto y se intenta una sexta vez
- **THEN** el sistema responde 429 indicando que se espere antes de reintentar

### Requirement: Protección de la API del panel
Toda ruta de la API del panel (`/api/admin/*`, salvo el inicio de sesión) MUST responder 401 cuando no hay una sesión
de administrador, aunque se llame directamente sin pasar por la interfaz.

#### Scenario: Llamada sin sesión
- **WHEN** se consulta el administrador actual sin haber iniciado sesión
- **THEN** el sistema responde 401

### Requirement: Cierre de sesión
El sistema SHALL cerrar la sesión del administrador a petición suya; después, la API del panel MUST volver a
responder 401.

#### Scenario: Cerrar sesión
- **WHEN** el administrador cierra la sesión y luego consulta el administrador actual
- **THEN** la segunda llamada responde 401

### Requirement: Cookie de sesión protegida
La cookie de sesión MUST ser `httpOnly` y `SameSite=Strict`, y `Secure` en producción. La contraseña SHALL
guardarse con hash y MUST NOT aparecer en logs ni respuestas.

#### Scenario: Cookie tras iniciar sesión
- **WHEN** el administrador inicia sesión
- **THEN** la cookie de sesión recibida es `HttpOnly` y `SameSite=Strict`

### Requirement: Protección de las páginas del panel
Las páginas del panel MUST llevar al login a quien no tiene sesión, y la pantalla de login MUST llevar al panel a
quien ya la tiene.

#### Scenario: Página del panel sin sesión
- **WHEN** un visitante sin sesión abre una página del panel
- **THEN** es redirigido a la pantalla de login

#### Scenario: Error en el login
- **WHEN** el administrador envía credenciales incorrectas en la pantalla de login
- **THEN** ve el mensaje "Email o contraseña incorrectos" y sigue en la pantalla de login
