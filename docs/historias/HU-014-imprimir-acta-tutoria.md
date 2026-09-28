# HU-014 · Imprimir el acta de una tutoría

**Rol:** Todos · **Estado:** implementada · **Commits:** `84ab077`

## Historia

- **Como** usuario
- **Quiero** imprimir el acta de una tutoría
- **Para** contar con un comprobante físico de la sesión

## Criterios de aceptación

- [x] Desde la lista de tutorías abro el acta de una tutoría
- [x] El acta muestra estudiante, tutor, materia, fecha, horario y estado
- [x] Puedo imprimirla desde el navegador

## Endpoints involucrados

- `GET /api/tutorias/index.php` (datos del acta)

## Tablas SQL utilizadas

- `tutorias`
- `estudiantes`
- `tutores`
- `materias`
- `usuarios`

Volver al [índice de historias](README.md).
