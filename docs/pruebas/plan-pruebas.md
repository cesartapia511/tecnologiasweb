# Plan de pruebas

## Datos de prueba

`database/init.sql` crea tres usuarios de demostración: `admin` (administrador), `tutor1` (tutor) y `estudiante1` (estudiante), con la contraseña de prueba definida en el script. Entorno: aplicación en `http://localhost:8000`, frontend con Vite en `http://localhost:5173`.

## Casos de prueba

| ID | Caso | Pasos | Resultado esperado |
|---|---|---|---|
| PT-01 | Inicio de sesión correcto | Ingresar con `admin` y su contraseña | Acceso al panel de control y acceso `exitoso` en la bitácora |
| PT-02 | Inicio de sesión fallido | Ingresar con una contraseña incorrecta | Mensaje «Credenciales incorrectas o usuario inactivo» y acceso `fallido` en la bitácora |
| PT-03 | Registro de estudiante | Completar el formulario de registro con datos válidos | Cuenta creada; los administradores reciben una notificación |
| PT-04 | Registro duplicado | Registrar un correo o usuario ya existente | El sistema informa que el dato ya está registrado |
| PT-05 | Solicitar recuperación | En «Recuperar Contraseña» ingresar el correo de un usuario existente | Aparece el recuadro «[ENTORNO DE DESARROLLO]» con el enlace de recuperación |
| PT-06 | Recuperación con correo inexistente | Ingresar un correo no registrado | Mensaje neutro y no aparece ningún enlace |
| PT-07 | Restablecer contraseña | Abrir el enlace, escribir y confirmar una nueva contraseña | Mensaje de éxito, redirección a `/login` y acceso posible con la nueva contraseña |
| PT-08 | Token de un solo uso | Volver a abrir el mismo enlace después de restablecer | «Enlace Inválido»; `restablecer.php` responde HTTP 400 |
| PT-09 | Token vencido | Modificar `expira_en` de un token a una fecha pasada y abrir el enlace | «Enlace Inválido»; `restablecer.php` responde que el enlace expiró |
| PT-10 | Contraseñas distintas | En el formulario de restablecimiento escribir contraseñas diferentes | El formulario muestra «Las contraseñas no coinciden» y no envía la petición |
| PT-11 | Registrar disponibilidad | Como tutor registrar un bloque de martes de 08:00 a 10:00 | Bloque guardado y visible en el listado |
| PT-12 | Disponibilidad inválida | Registrar un bloque de 15 minutos o de más de 3 horas | El sistema lo rechaza |
| PT-13 | Agendar tutoría válida | Como estudiante agendar dentro de la disponibilidad del tutor | Tutoría creada en estado `pendiente` |
| PT-14 | Agendar en fecha pasada o domingo | Intentar agendar en una fecha anterior a hoy o en domingo | El sistema lo rechaza con el mensaje correspondiente |
| PT-15 | Agendar fuera de disponibilidad | Agendar en un horario sin disponibilidad del tutor | Error «Tutor no disponible» |
| PT-16 | Cruce de horarios | Agendar dos tutorías al mismo tiempo para el mismo tutor | Error «Conflicto de horario» |
| PT-17 | Cambio de estado por el tutor | Confirmar y luego marcar como realizada una tutoría | Estados `confirmada` y `realizada` |
| PT-18 | Estado final | Intentar cambiar el estado de una tutoría realizada o cancelada | El sistema lo rechaza |
| PT-19 | Cancelación por el estudiante | El estudiante cancela su tutoría | Estado `cancelada`; intentar confirmar como estudiante es rechazado |
| PT-20 | Activar periodo de inscripción | Crear dos periodos y activar el segundo | Solo el segundo queda activo |
| PT-21 | Inscripción con cupo | Inscribirse en una tutoría con periodo activo | Inscripción realizada y cupos disponibles descontados |
| PT-22 | Inscripción sin cupo o sin periodo | Inscribirse cuando no quedan cupos o no hay periodo activo | El sistema rechaza la inscripción |
| PT-23 | Generar carta | Como administrador generar una designación | Carta `pendiente` y tutoría `pendiente` |
| PT-24 | Aceptar carta | Como tutor aceptar la carta | Carta `aceptada` con fecha de firma; tutoría `asignada` |
| PT-25 | Rechazar carta con motivo | Como tutor rechazar eligiendo un motivo | Carta `rechazada` con motivo; tutoría `en_reasignacion` |
| PT-26 | Carta ya respondida | Intentar responder de nuevo una carta aceptada o rechazada | El sistema lo rechaza |
| PT-27 | Estudiante responde carta | Intentar aceptar una carta como estudiante | Acceso denegado |
| PT-28 | Registrar reunión | Como tutor registrar una reunión con asistencia «sí» | Reunión guardada con ambas firmas en 0 |
| PT-29 | Reunión inválida | Registrar hora de fin anterior a la de inicio, o tardanza sin minutos | El sistema lo rechaza |
| PT-30 | Firmas de la reunión | El tutor y el estudiante firman la misma reunión | Cada firma se activa por separado |
| PT-31 | Informe de avance | Registrar el informe 1 con 30 % de avance | Informe guardado |
| PT-32 | Número de informe duplicado | Registrar otro informe con el número 1 en la misma tutoría | El sistema lo rechaza |
| PT-33 | Evaluar tutoría realizada | Como estudiante calificar con 5 una tutoría realizada | Evaluación guardada |
| PT-34 | Evaluación repetida o prematura | Evaluar dos veces la misma tutoría, o una no realizada | El sistema lo rechaza |
| PT-35 | Notificaciones | Crear un usuario desde el panel y revisar la campana del administrador | Notificación «Nuevo Usuario Creado» sin leer; se puede marcar como leída |
| PT-36 | Reporte filtrado | Como administrador filtrar por carrera y estado | Los totales y gráficos reflejan solo las tutorías filtradas |
| PT-37 | Reportes prohibidos | Como tutor o estudiante llamar a `api/reportes/index.php` | Acceso denegado |
| PT-38 | Foto de perfil | Subir una imagen JPG de menos de 2 MB | Foto actualizada; un archivo mayor a 2 MB o de otro formato es rechazado |
| PT-39 | Permisos por rol | Como estudiante llamar a `api/usuarios/index.php` | Acceso denegado |
