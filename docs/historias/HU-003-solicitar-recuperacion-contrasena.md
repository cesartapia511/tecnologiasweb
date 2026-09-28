# HU-003 · Solicitar recuperación de contraseña

**Rol:** Público · **Estado:** implementada · **Commits:** `8560fa2`

## Historia

- **Como** usuario que olvidó su contraseña
- **Quiero** solicitar un enlace de recuperación con mi correo
- **Para** recuperar el acceso a mi cuenta

## Criterios de aceptación

- [x] Ingreso mi correo y el sistema genera un token de un solo uso
- [x] El enlace se muestra en pantalla (modo sandbox, sin envío real de correo)
- [x] El token vence a los 15 minutos de solicitado
- [x] En la base de datos solo se guarda el hash SHA-256 del token

## Endpoints involucrados

- `POST /api/auth/recuperar.php`

## Tablas SQL utilizadas

- `usuarios`
- `password_reset_tokens`

Volver al [índice de historias](README.md).
