# HU-002 · Registrarse como estudiante

**Rol:** Público · **Estado:** implementada · **Commits:** `1b762b8`, `ef22a50`

## Historia

- **Como** visitante
- **Quiero** registrarme como estudiante
- **Para** tener una cuenta para usar el sistema

## Criterios de aceptación

- [x] El registro público solo permite el rol estudiante; si se envía otro rol, el sistema lo rechaza
- [x] Completo nombre, apellido, correo, usuario, contraseña y carrera y semestre
- [x] Si el usuario o el correo ya existen, el sistema indica el dato duplicado
- [x] Los administradores reciben una notificación del nuevo registro

## Endpoints involucrados

- `POST /api/auth/register.php`
- `GET /api/carreras/index.php` (lista de carreras del formulario)

## Tablas SQL utilizadas

- `usuarios`
- `estudiantes`
- `tutores`
- `carreras`
- `notificaciones`

Volver al [índice de historias](README.md).
