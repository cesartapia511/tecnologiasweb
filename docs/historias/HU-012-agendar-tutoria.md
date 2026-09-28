# HU-012 · Agendar una tutoría

**Rol:** Estudiante · **Estado:** implementada · **Commits:** `1f09e7d`, `3aa119b`

## Historia

- **Como** estudiante
- **Quiero** agendar una tutoría con validación de horarios
- **Para** reservar una sesión con un tutor sin cruces ni horarios inválidos

## Criterios de aceptación

- [x] Elijo tutor, materia, fecha, horario, modalidad y lugar o enlace
- [x] Se rechaza fecha pasada, domingo o duración inválida
- [x] Se rechaza si la materia no está asignada al tutor
- [x] Se rechaza si el tutor no tiene disponibilidad o hay cruce de horario
- [x] La tutoría nace en estado `pendiente`

## Endpoints involucrados

- `POST /api/tutorias/index.php`
- `GET /api/tutorias/index.php`

## Tablas SQL utilizadas

- `tutorias`
- `estudiantes`
- `tutores`
- `materias`
- `disponibilidad_tutor`

Volver al [índice de historias](README.md).
