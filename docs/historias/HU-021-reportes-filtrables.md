# HU-021 · Consultar reportes con filtros y gráficos

**Rol:** Administrador · **Estado:** implementada · **Commits:** `f48db2d`, `fba9271`

## Historia

- **Como** administrador
- **Quiero** consultar reportes filtrables por fecha, estado, carrera y materia, con gráficos
- **Para** analizar el uso de las tutorías

## Criterios de aceptación

- [x] Filtro por fecha de inicio, fecha de fin, estado, carrera y materia
- [x] Veo los resultados en gráficos
- [x] Exporto el reporte a CSV
- [x] Solo el administrador accede a reportes

## Endpoints involucrados

- `GET /api/reportes/index.php`

## Tablas SQL utilizadas

- `tutorias`
- `materias`
- `carreras`
- `estudiantes`
- `tutores`

Volver al [índice de historias](README.md).
