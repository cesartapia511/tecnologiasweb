# HU-011 · Registrar disponibilidad semanal

**Rol:** Tutor · **Estado:** implementada · **Commits:** `787a8f4`, `2ccd5e4`

## Historia

- **Como** tutor
- **Quiero** registrar mis bloques de disponibilidad semanal
- **Para** que los estudiantes solo agenden en horarios en los que puedo atender

## Criterios de aceptación

- [x] Elijo día (lunes a sábado), hora de inicio y hora de fin
- [x] El bloque debe durar entre 30 minutos y 3 horas
- [x] Puedo eliminar únicamente mis propios bloques
- [x] Estudiantes y administrador pueden consultar la disponibilidad

## Endpoints involucrados

- `GET, POST, DELETE /api/disponibilidad/index.php`

## Tablas SQL utilizadas

- `disponibilidad_tutor`
- `tutores`

Volver al [índice de historias](README.md).
