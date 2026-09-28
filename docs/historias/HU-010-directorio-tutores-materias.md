# HU-010 · Consultar tutores y asignarles materias

**Rol:** Administrador · **Estado:** implementada · **Commits:** `d93ee04`, `cc27c0c`, `3d4f651`

## Historia

- **Como** administrador
- **Quiero** consultar a los tutores, editar su perfil y asignarles las materias que dictan
- **Para** que los estudiantes solo agenden materias que el tutor realmente atiende

## Criterios de aceptación

- [x] Listo los tutores con su especialidad
- [x] Edito el perfil del tutor (el tutor también edita el suyo)
- [x] Asigno y quito materias a un tutor
- [x] Una tutoría solo puede agendarse con una materia asignada al tutor

## Endpoints involucrados

- `GET, PUT /api/tutores/index.php`
- Asignación de materias desde la pantalla de tutores (tabla `tutor_materia`)

## Tablas SQL utilizadas

- `tutores`
- `usuarios`
- `materias`
- `tutor_materia`

Volver al [índice de historias](README.md).
