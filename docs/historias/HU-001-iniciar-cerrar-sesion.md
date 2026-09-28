# HU-001 · Iniciar y cerrar sesión

**Rol:** Todos · **Estado:** implementada · **Commits:** `1a7feb1`, `1b762b8`

## Historia

- **Como** usuario del sistema
- **Quiero** iniciar sesión con mi usuario o correo y cerrar sesión
- **Para** acceder a las funciones que mi rol permite

## Criterios de aceptación

- [x] Acepto usuario o correo junto con la contraseña
- [x] Si las credenciales son incorrectas o la cuenta está inactiva veo «Credenciales incorrectas o usuario inactivo»
- [x] Cada intento (exitoso o fallido) queda en la bitácora de accesos
- [x] Al ingresar recibo un token firmado y los permisos de mi rol
- [x] Al cerrar sesión se descarta el token en el navegador

## Endpoints involucrados

- `POST /api/auth/login.php`

## Tablas SQL utilizadas

- `usuarios`
- `roles`
- `permisos`
- `rol_permisos`
- `registro_accesos`

Volver al [índice de historias](README.md).
