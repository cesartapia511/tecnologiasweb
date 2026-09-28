# HU-015 · Crear y activar periodos de inscripción

**Rol:** Administrador · **Estado:** implementada · **Commits:** `aefb9fb`

## Historia

- **Como** administrador
- **Quiero** crear y activar periodos de inscripción
- **Para** controlar cuándo los estudiantes pueden inscribirse a tutorías

## Criterios de aceptación

- [x] Creo un periodo con nombre, descripción, fecha de inicio y fecha de fin
- [x] Se rechaza si la fecha de fin es anterior a la de inicio
- [x] Al activar un periodo, el activo anterior se desactiva
- [x] Solo hay un periodo activo a la vez

## Endpoints involucrados

- `GET, POST, PUT /api/periodos_inscripcion/index.php` (PUT con `accion` activar o desactivar)

## Tablas SQL utilizadas

- `periodos_inscripcion`

Volver al [índice de historias](README.md).
