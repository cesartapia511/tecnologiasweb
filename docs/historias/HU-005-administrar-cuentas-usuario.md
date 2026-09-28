# HU-005 · Administrar cuentas de usuario

**Rol:** Administrador · **Estado:** implementada · **Commits:** `28c383d`, `d2aa8a3`

## Historia

- **Como** administrador
- **Quiero** crear, consultar, editar y eliminar cuentas de usuario
- **Para** controlar quién accede al sistema y con qué rol

## Criterios de aceptación

- [x] Listo todos los usuarios con su rol y estado
- [x] Creo un usuario con rol, datos personales y contraseña con hash
- [x] Edito datos, estado (activo/inactivo) y perfil
- [x] Elimino un usuario
- [x] Solo el rol con los permisos de usuarios puede realizar estas acciones
- [x] Al crear un usuario los administradores reciben una notificación

## Endpoints involucrados

- `GET, POST /api/usuarios/index.php`
- `GET, PUT, DELETE /api/usuarios/detalle.php?id=`

## Tablas SQL utilizadas

- `usuarios`
- `roles`
- `estudiantes`
- `tutores`
- `notificaciones`

Volver al [índice de historias](README.md).
