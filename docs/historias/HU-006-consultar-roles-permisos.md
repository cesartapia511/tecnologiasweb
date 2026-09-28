# HU-006 · Consultar roles y permisos

**Rol:** Administrador · **Estado:** implementada · **Commits:** `b2902a6`, `f92c18e`, `fb06bc3`

## Historia

- **Como** administrador
- **Quiero** consultar los roles del sistema con sus permisos
- **Para** conocer qué puede hacer cada rol

## Criterios de aceptación

- [x] Veo los roles administrador, tutor y estudiante
- [x] Veo los permisos asignados a cada rol (RBAC)
- [x] La API verifica cada permiso con `requerirPermiso()`

## Endpoints involucrados

- `GET /api/roles/index.php`

## Tablas SQL utilizadas

- `roles`
- `permisos`
- `rol_permisos`

Volver al [índice de historias](README.md).
