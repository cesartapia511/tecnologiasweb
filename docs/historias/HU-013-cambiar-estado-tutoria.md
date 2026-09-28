# HU-013 · Cambiar el estado de una tutoría

**Rol:** Tutor, estudiante · **Estado:** implementada · **Commits:** `3aa119b`, `fe85ce8`

## Historia

- **Como** tutor o estudiante
- **Quiero** cambiar el estado de una tutoría según mi rol
- **Para** reflejar si la sesión se confirmó, se realizó o se canceló

## Criterios de aceptación

- [x] El tutor confirma, marca como realizada o cancela sus tutorías
- [x] El estudiante solo cancela las suyas
- [x] Una tutoría realizada o cancelada no cambia de estado
- [x] Una tutoría pendiente solo pasa directo a realizada si lo hace el administrador

## Endpoints involucrados

- `PUT /api/tutorias/index.php`

## Tablas SQL utilizadas

- `tutorias`
- `notificaciones`

Volver al [índice de historias](README.md).
