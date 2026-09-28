# Especificación de requisitos — Sistema de Tutorías UPDS Tarija

## 1. Introducción

Este documento recoge los requisitos funcionales (RF), las reglas de negocio (RN) y los requisitos no funcionales (RNF) del sistema, tal como están implementados en el repositorio. Los roles del sistema son **administrador**, **tutor** y **estudiante** .

## 2. Requisitos funcionales

| ID | Requisito | Rol | Módulo (API) |
|----|-----------|-----|--------------|
| RF-01 | Iniciar sesión con usuario o correo y contraseña; solo ingresan cuentas en estado `activo`. | Todos | `auth/login.php` |
| RF-02 | Registrarse públicamente como estudiante (el registro de tutores lo hace el administrador). | Público | `auth/register.php` |
| RF-03 | Solicitar la recuperación de contraseña ingresando el correo registrado; el sistema genera un enlace de restablecimiento y lo muestra en pantalla. | Público | `auth/recuperar.php` |
| RF-04 | Verificar la validez del enlace de recuperación y restablecer la contraseña con una nueva. | Público | `auth/verificar-token.php`, `auth/restablecer.php` |
| RF-05 | Gestionar usuarios (listar, crear, editar, eliminar). | Administrador | `usuarios/` |
| RF-06 | Consultar los roles del sistema y los permisos asignados a cada uno. | Administrador | `roles/` |
| RF-07 | Gestionar carreras y materias (crear, editar, eliminar); consultar y editar los datos académicos de los estudiantes; consultar y editar el perfil de los tutores y las materias que dictan. | Administrador (el tutor edita su propio perfil) | `carreras/`, `materias/`, `estudiantes/`, `tutores/` |
| RF-08 | Registrar y eliminar bloques de disponibilidad semanal del tutor. | Tutor, administrador | `disponibilidad/` |
| RF-09 | Agendar una tutoría indicando estudiante, tutor, materia, fecha, horario, modalidad (presencial o virtual) y lugar o enlace. | Estudiante, administrador | `tutorias/index.php` |
| RF-10 | Cambiar el estado de una tutoría (confirmar, realizar, cancelar) según el rol. | Tutor, estudiante, administrador | `tutorias/index.php` |
| RF-11 | Consultar las tutorías disponibles con cupo e inscribirse en ellas dentro del periodo de inscripción activo. | Estudiante | `tutorias/disponibles.php`, `tutorias/inscribir.php` |
| RF-12 | Crear periodos de inscripción, activarlos y desactivarlos. | Administrador | `periodos_inscripcion/` |
| RF-13 | Generar la carta de designación de un tutor para un estudiante. | Administrador | `cartas_designacion/` |
| RF-14 | Aceptar o rechazar (con motivo) una carta de designación, y ver o imprimir la carta. | Tutor, administrador | `cartas_designacion/` |
| RF-15 | Registrar reuniones de una tutoría con fecha, horario, lugar o enlace, asistencia del estudiante, evidencia (URL) y observaciones. | Tutor, administrador | `reuniones/` |
| RF-16 | Firmar una reunión registrada: el tutor firma como tutor y el estudiante como estudiante. | Tutor, estudiante | `reuniones/` |
| RF-17 | Registrar informes de avance numerados con descripción, porcentaje y fecha límite, y consultarlos. | Tutor, administrador (consulta también el estudiante) | `informes_avance/` |
| RF-18 | Evaluar una tutoría realizada con calificación de 1 a 5 y comentario. | Estudiante | `evaluaciones/` |
| RF-19 | Recibir notificaciones internas, verlas en la campana y en la bandeja, y marcarlas como leídas. | Todos | `notificaciones/` |
| RF-20 | Consultar el dashboard con indicadores según el rol y estadísticas avanzadas. | Todos | `dashboard/` |
| RF-21 | Consultar reportes filtrables por fecha, estado, carrera y materia, con gráficos. | Administrador | `reportes/` |
| RF-22 | Consultar la bitácora de accesos (exitosos y fallidos, con IP). | Administrador | `accesos/` |
| RF-23 | Consultar y editar el perfil propio y subir una foto de perfil. | Estudiante, tutor | `estudiantes/perfil.php`, `usuarios/foto.php` |
| RF-24 | Generar el acta imprimible de una tutoría. | Todos los roles con acceso a la tutoría | Frontend (`TutoriasPage`) |

## 3. Reglas de negocio

| ID | Regla |
|----|-------|
| RN-01 | Una tutoría no puede agendarse en una fecha anterior a hoy ni en un horario que ya transcurrió; no se agendan tutorías los domingos. |
| RN-02 | La duración de una tutoría debe estar entre 30 minutos y 3 horas. |
| RN-03 | La materia elegida debe estar asignada al tutor. |
| RN-04 | El tutor debe tener disponibilidad registrada el día de la semana y en el horario solicitado. |
| RN-05 | No puede haber cruce de horarios: ni para el tutor ni para el estudiante. |
| RN-06 | Modalidad `presencial` exige indicar el lugar; modalidad `virtual` exige indicar el enlace. |
| RN-07 | El estudiante solo puede cancelar sus propias tutorías. El tutor puede confirmar, marcar como realizada o cancelar las tutorías asignadas a él, pero no devolverlas a `pendiente`. |
| RN-08 | Una tutoría `realizada` o `cancelada` no cambia de estado. Pasar de `pendiente` a `realizada` sin confirmar solo lo puede hacer el administrador. |
| RN-09 | Solo puede existir un periodo de inscripción activo: al activar uno, el anterior se desactiva. |
| RN-10 | Un estudiante se inscribe únicamente si hay un periodo activo, la tutoría no está `realizada` ni `cancelada`, no está ya inscrito y hay cupo disponible (`cupo_maximo`, 5 por defecto). |
| RN-11 | Una carta de designación nace en estado `pendiente` y solo puede responderse una vez. La responde el tutor designado (o el administrador); el estudiante no puede responderla. |
| RN-12 | Al rechazar una carta es obligatorio indicar el motivo (lista cerrada: capacidad excedida, falta de tiempo, conflicto de interés o causa justificada). |
| RN-13 | Al aceptar una carta la tutoría pasa a estado `asignada`; al rechazarla pasa a `en_reasignacion`. La carta rechazada queda guardada. |
| RN-14 | En una reunión, la hora de fin debe ser posterior a la de inicio; la asistencia es `si`, `no`, `tardanza` o `no_aplica`; si es `tardanza` los minutos deben ser mayores a 0; la evidencia, si se adjunta, debe ser una URL válida. |
| RN-15 | Las reuniones nacen sin firmas. El tutor y el estudiante firman por separado y solo sobre las reuniones de su propia tutoría. |
| RN-16 | En un informe de avance la descripción es obligatoria y el porcentaje va de 0 a 100. No se permiten dos informes con el mismo número en una tutoría; si no se indica número, el sistema asigna el siguiente. |
| RN-17 | Solo el estudiante puede evaluar, únicamente tutorías `realizada`, con calificación entera de 1 a 5, comentario de hasta 1000 caracteres y una sola evaluación por tutoría. |
| RN-18 | Cada bloque de disponibilidad va de lunes a sábado, dura entre 30 minutos y 3 horas, y el tutor solo elimina sus propios bloques. |
| RN-19 | En el registro público: nombre y apellido de 2 a 100 caracteres, correo válido y único, usuario de 3 a 50 caracteres (letras, números, punto, guion y guion bajo), contraseña de al menos 6 caracteres. |
| RN-20 | Las contraseñas se guardan cifradas con `password_hash`; nunca en texto plano. |
| RN-21 | El enlace de recuperación usa un token aleatorio de 32 bytes, se guarda cifrado (SHA-256), vale 15 minutos y se elimina al usarse. La respuesta es la misma exista o no el correo. |
| RN-22 | Cada intento de inicio de sesión de una cuenta existente queda en la bitácora (`exitoso` o `fallido`) con la IP de origen. |
| RN-23 | Los reportes y la bitácora de accesos son exclusivos del administrador. |
| RN-24 | La foto de perfil pesa como máximo 2 MB y debe ser JPG, PNG o WebP. |

## 4. Requisitos no funcionales

| ID | Requisito |
|----|-----------|
| RNF-01 | La API valida sesión y permisos en cada endpoint mediante el token firmado y la tabla de permisos por rol. |
| RNF-02 | Todas las consultas a la base de datos usan sentencias preparadas (PDO). |
| RNF-03 | La interfaz es responsiva y se adapta a pantallas de escritorio y móvil. |
| RNF-04 | Las fechas y horas se manejan con la zona horaria de Bolivia (`America/La_Paz`). |
| RNF-05 | El entorno completo se levanta con Docker Compose (web, base de datos y phpMyAdmin). |
| RNF-06 | Las respuestas de la API usan un formato JSON uniforme con `success`, `message` y `data`. |
