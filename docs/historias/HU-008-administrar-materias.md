# HU-008 · Administrar materias

**Rol:** Administrador · **Estado:** implementada · **Commits:** `983e53f`, `f936123`

## Historia

- **Como** administrador
- **Quiero** crear, editar, listar y eliminar materias asociadas a una carrera
- **Para** mantener el catálogo de materias para las tutorías

## Criterios de aceptación

- [x] Listo las materias, con filtro opcional por carrera
- [x] Creo y edito una materia indicando su carrera
- [x] Elimino una materia
- [x] Las acciones de escritura exigen permiso del administrador

## Endpoints involucrados

- `GET, POST /api/materias/index.php`
- `GET, PUT, DELETE /api/materias/detalle.php?id=`

## Tablas SQL utilizadas

- `materias`
- `carreras`

Volver al [índice de historias](README.md).
