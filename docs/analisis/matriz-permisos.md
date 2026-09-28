# Matriz de permisos por rol

El sistema usa control de acceso por roles (RBAC) respaldado por la base de datos: las tablas `permisos` y `rol_permisos` (script `database/migration_permisos.sql`, también incluido en `init.sql`) definen 33 permisos. La API los verifica con `requerirPermiso()` en `includes/auth_helper.php`.

Roles base: `administrador` (id 1), `tutor` (id 2) y `estudiante` (id 3).

## 1. Permisos por módulo

Convención: ✔ = asignado · — = no asignado.

| Módulo | Permiso | Administrador | Tutor | Estudiante |
|---|---|:---:|:---:|:---:|
| usuarios | listar_usuario, crear_usuario, editar_usuario, eliminar_usuario | ✔ | — | — |
| roles | listar_rol, crear_rol, editar_rol, eliminar_rol | ✔ | — | — |
| carreras | listar_carrera | ✔ | ✔ | ✔ |
| carreras | crear_carrera, editar_carrera, eliminar_carrera | ✔ | — | — |
| materias | listar_materia | ✔ | ✔ | ✔ |
| materias | crear_materia, editar_materia, eliminar_materia | ✔ | — | — |
| tutores | listar_tutor | ✔ | ✔ | ✔ |
| tutores | editar_tutor | ✔ | ✔ (su propio perfil) | — |
| estudiantes | listar_estudiante | ✔ | — | — |
| estudiantes | editar_estudiante | ✔ | — | ✔ (sus datos) |
| disponibilidad | listar_disponibilidad | ✔ | ✔ | ✔ |
| disponibilidad | crear_disponibilidad, eliminar_disponibilidad | ✔ | ✔ | — |
| tutorias | listar_tutoria | ✔ | ✔ | ✔ |
| tutorias | crear_tutoria | ✔ | — | ✔ |
| tutorias | editar_tutoria | ✔ | ✔ | — |
| tutorias | eliminar_tutoria | ✔ | — | — |
| evaluaciones | listar_evaluacion | ✔ | ✔ | ✔ |
| evaluaciones | crear_evaluacion | ✔ | — | ✔ |
| evaluaciones | editar_evaluacion, eliminar_evaluacion | ✔ | — | — |
| accesos | listar_acceso | ✔ | — | — |
| dashboard | ver_dashboard | ✔ | ✔ | ✔ |

## 2. Acciones de tutorías, cartas, reuniones e informes

Además del permiso, la API valida que el usuario sea el tutor o el estudiante de la tutoría. `*` = solo sobre sus propias tutorías.

| Acción | Administrador | Tutor | Estudiante |
|---|:---:|:---:|:---:|
| Agendar tutoría | ✔ | — | ✔ |
| Confirmar / marcar realizada | ✔ | ✔* | — |
| Cancelar tutoría | ✔ | ✔* | ✔* |
| Inscribirse a una tutoría con cupo | — | — | ✔ |
| Crear y activar periodos de inscripción | ✔ | — | — |
| Generar carta de designación | ✔ | — | — |
| Ver cartas | ✔ (todas) | ✔* | ✔* |
| Aceptar o rechazar carta | ✔ | ✔* | — |
| Registrar reunión | ✔ | ✔* | — |
| Firmar reunión | — | ✔* (como tutor) | ✔* (como estudiante) |
| Registrar informe de avance | ✔ | ✔* | — |
| Consultar reuniones e informes | ✔ | ✔* | ✔* |
| Consultar reportes | ✔ | — | — |
| Notificaciones propias | ✔ | ✔ | ✔ |
| Editar perfil y foto propios | ✔ | ✔ | ✔ |
