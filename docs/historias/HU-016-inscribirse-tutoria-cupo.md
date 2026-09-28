# HU-016 · Inscribirse en una tutoría con cupo

**Rol:** Estudiante · **Estado:** implementada · **Commits:** `70d352d`

## Historia

- **Como** estudiante
- **Quiero** ver las tutorías con cupo disponible e inscribirme
- **Para** participar en una tutoría grupal

## Criterios de aceptación

- [x] Solo veo tutorías futuras con cupo
- [x] Solo puedo inscribirme con un periodo de inscripción activo
- [x] Se rechaza si no hay cupos, si la tutoría está realizada o cancelada, o si ya estoy inscrito
- [x] Al inscribirme se descuenta un cupo (máximo por defecto: 5)

## Endpoints involucrados

- `GET /api/tutorias/disponibles.php`
- `POST /api/tutorias/inscribir.php`

## Tablas SQL utilizadas

- `tutorias`
- `tutoria_estudiante`
- `periodos_inscripcion`
- `estudiantes`

Volver al [índice de historias](README.md).
