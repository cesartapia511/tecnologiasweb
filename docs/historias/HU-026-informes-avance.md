# HU-026 · Registrar informes de avance con porcentaje

**Rol:** Tutor · **Estado:** implementada · **Commits:** `3d683d0`

## Historia

- **Como** tutor
- **Quiero** registrar informes de avance numerados con porcentaje de 0 a 100
- **Para** documentar el progreso del estudiante

## Criterios de aceptación

- [x] El sistema propone el siguiente número de informe
- [x] Registro descripción, porcentaje de avance (0 a 100) y fecha límite opcional
- [x] Se rechaza un número de informe repetido en la misma tutoría
- [x] Estudiante y administrador consultan los informes de sus tutorías

## Endpoints involucrados

- `GET, POST /api/informes_avance/index.php`

## Tablas SQL utilizadas

- `informes_avance`
- `tutorias`

Volver al [índice de historias](README.md).
