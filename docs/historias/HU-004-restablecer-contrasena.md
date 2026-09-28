# HU-004 · Restablecer la contraseña

**Rol:** Público · **Estado:** implementada · **Commits:** `0a301a4`

## Historia

- **Como** usuario con un enlace de recuperación
- **Quiero** definir una nueva contraseña desde el enlace
- **Para** volver a ingresar al sistema

## Criterios de aceptación

- [x] El sistema valida el token antes de mostrar el formulario
- [x] Enlace inválido, usado o vencido: se informa y se pide solicitar otro
- [x] Las contraseñas deben coincidir y tener al menos 6 caracteres
- [x] Al restablecer, la contraseña se actualiza y el token se elimina

## Endpoints involucrados

- `GET /api/auth/verificar-token.php?token=`
- `POST /api/auth/restablecer.php`

## Tablas SQL utilizadas

- `usuarios`
- `password_reset_tokens`

Volver al [índice de historias](README.md).
