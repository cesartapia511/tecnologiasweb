-- =========================================================
-- MIGRACIÓN OFICIAL: SISTEMA DE PERMISOS Y PRIVILEGIOS (RBAC)
-- UPDS Tarija - Sistema Web de Apoyo Académico para Tutorías
-- =========================================================

USE tutorias_db;

-- 1. Crear tabla 'permisos' con IDs secuenciales y ordenados
CREATE TABLE IF NOT EXISTS permisos (
  id_permiso INT AUTO_INCREMENT PRIMARY KEY,
  nombre_permiso VARCHAR(100) NOT NULL UNIQUE,
  modulo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crear tabla intermedia 'rol_permisos' (Relación N:M)
CREATE TABLE IF NOT EXISTS rol_permisos (
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rp_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Inserción de permisos con IDs estrictamente secuenciales (1 a 33)
INSERT INTO permisos (id_permiso, nombre_permiso, modulo, descripcion) VALUES
(1, 'listar_usuario', 'usuarios', 'Consultar y listar las cuentas de usuarios'),
(2, 'crear_usuario', 'usuarios', 'Registrar nuevas cuentas de usuario en el sistema'),
(3, 'editar_usuario', 'usuarios', 'Modificar datos, estado o perfiles de usuario'),
(4, 'eliminar_usuario', 'usuarios', 'Eliminar o dar de baja cuentas de usuario'),

(5, 'listar_rol', 'roles', 'Consultar roles del sistema y matriz de privilegios'),
(6, 'crear_rol', 'roles', 'Registrar nuevos roles personalizados'),
(7, 'editar_rol', 'roles', 'Modificar roles y asignaciones de privilegios'),
(8, 'eliminar_rol', 'roles', 'Eliminar roles creados por el usuario'),

(9, 'listar_carrera', 'carreras', 'Consultar el catálogo de carreras universitarias'),
(10, 'crear_carrera', 'carreras', 'Registrar un nuevo programa o carrera'),
(11, 'editar_carrera', 'carreras', 'Modificar nombre de carreras universitarias'),
(12, 'eliminar_carrera', 'carreras', 'Eliminar carreras que no tengan dependencias'),

(13, 'listar_materia', 'materias', 'Consultar el catálogo de asignaturas'),
(14, 'crear_materia', 'materias', 'Registrar nuevas asignaturas ofertadas'),
(15, 'editar_materia', 'materias', 'Modificar datos y asignación de asignaturas'),
(16, 'eliminar_materia', 'materias', 'Eliminar asignaturas sin tutorías agendadas'),

(17, 'listar_tutor', 'tutores', 'Consultar el directorio del cuerpo docente tutor'),
(18, 'editar_tutor', 'tutores', 'Actualizar especialidad, biografía y materias que imparte'),

(19, 'listar_estudiante', 'estudiantes', 'Consultar el padrón oficial de estudiantes'),
(20, 'editar_estudiante', 'estudiantes', 'Actualizar datos académicos y matrícula de estudiante'),

(21, 'listar_disponibilidad', 'disponibilidad', 'Consultar horarios semanales de atención docente'),
(22, 'crear_disponibilidad', 'disponibilidad', 'Registrar franjas horarias de disponibilidad'),
(23, 'eliminar_disponibilidad', 'disponibilidad', 'Eliminar franjas horarias de atención'),

(24, 'listar_tutoria', 'tutorias', 'Consultar y dar seguimiento a tutorías agendadas'),
(25, 'crear_tutoria', 'tutorias', 'Solicitar y agendar una nueva sesión de tutoría'),
(26, 'editar_tutoria', 'tutorias', 'Actualizar estado de sesión (confirmar, finalizar, cancelar)'),
(27, 'eliminar_tutoria', 'tutorias', 'Cancelar y dar de baja una tutoría'),

(28, 'listar_evaluacion', 'evaluaciones', 'Consultar opiniones y calificaciones de tutorías'),
(29, 'crear_evaluacion', 'evaluaciones', 'Evaluar la calidad pedagógica de una tutoría realizada'),
(30, 'editar_evaluacion', 'evaluaciones', 'Modificar calificación o comentario de evaluación'),
(31, 'eliminar_evaluacion', 'evaluaciones', 'Eliminar registro de evaluación'),

(32, 'listar_acceso', 'accesos', 'Consultar bitácora de auditoría e inicios de sesión por IP'),
(33, 'ver_dashboard', 'dashboard', 'Visualizar panel de control e indicadores estadísticos')
ON DUPLICATE KEY UPDATE 
  nombre_permiso = VALUES(nombre_permiso),
  modulo = VALUES(modulo),
  descripcion = VALUES(descripcion);

-- 4. Asignaciones para ROL 1: ADMINISTRADOR (Acceso total: permisos 1 al 33)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12),
(1, 13), (1, 14), (1, 15), (1, 16),
(1, 17), (1, 18),
(1, 19), (1, 20),
(1, 21), (1, 22), (1, 23),
(1, 24), (1, 25), (1, 26), (1, 27),
(1, 28), (1, 29), (1, 30), (1, 31),
(1, 32), (1, 33)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- 5. Asignaciones para ROL 2: TUTOR (Gestión de disponibilidad, tutorías asignadas, perfil y evaluaciones)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(2, 33), -- ver_dashboard
(2, 21), -- listar_disponibilidad
(2, 22), -- crear_disponibilidad
(2, 23), -- eliminar_disponibilidad
(2, 24), -- listar_tutoria
(2, 26), -- editar_tutoria (confirmar / marcar realizada / cancelar)
(2, 13), -- listar_materia
(2, 9),  -- listar_carrera
(2, 17), -- listar_tutor
(2, 18), -- editar_tutor (su propio perfil y materias)
(2, 28)  -- listar_evaluacion (ver opiniones de sus estudiantes)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- 6. Asignaciones para ROL 3: ESTUDIANTE (Solicitud de tutorías, consultar catálogo y registrar evaluaciones)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(3, 33), -- ver_dashboard
(3, 24), -- listar_tutoria (consultar mis tutorías)
(3, 25), -- crear_tutoria (solicitar tutoría)
(3, 17), -- listar_tutor (elegir docente tutor)
(3, 13), -- listar_materia (elegir materia)
(3, 9),  -- listar_carrera
(3, 21), -- listar_disponibilidad (ver horarios de los tutores)
(3, 28), -- listar_evaluacion (consultar evaluaciones)
(3, 29), -- crear_evaluacion (calificar tutoría realizada)
(3, 20)  -- editar_estudiante (actualizar datos personales y de contacto)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);
