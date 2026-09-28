# HU-009 · Consultar el padrón de estudiantes

**Rol:** Administrador · **Estado:** implementada · **Commits:** `a6e7266`, `77286b6`

## Historia

- **Como** administrador
- **Quiero** consultar el padrón de estudiantes y editar sus datos académicos
- **Para** mantener correcta su carrera, semestre y registro universitario

## Criterios de aceptación

- [x] Listo los estudiantes con su carrera y semestre
- [x] Edito carrera, semestre y registro universitario
- [x] El estudiante puede editar sus propios datos desde su perfil

## Endpoints involucrados

- `GET, PUT /api/estudiantes/index.php`
- `GET, PUT /api/estudiantes/perfil.php`

## Tablas SQL utilizadas

- `estudiantes`
- `usuarios`
- `carreras`

Volver al [índice de historias](README.md).
