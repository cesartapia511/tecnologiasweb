-- Base de Datos Oficial del Proyecto: tutorias_db
-- UPDS Tarija - Sistema Web de Apoyo Académico para Tutorías
-- Estructura Oficial de 11 tablas (Safe DDL sin DROP DATABASE)

CREATE DATABASE IF NOT EXISTS tutorias_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tutorias_db;

-- 1. Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre_rol VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  id_rol INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  telefono VARCHAR(20),
  estado ENUM('activo', 'inactivo') DEFAULT 'activo',
  fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_roles FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabla de carreras
CREATE TABLE IF NOT EXISTS carreras (
  id_carrera INT AUTO_INCREMENT PRIMARY KEY,
  nombre_carrera VARCHAR(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabla de estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
  id_estudiante INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  id_carrera INT NOT NULL,
  semestre TINYINT NOT NULL,
  registro_universitario VARCHAR(30) UNIQUE,
  CONSTRAINT fk_estudiantes_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  CONSTRAINT fk_estudiantes_carreras FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Tabla de tutores
CREATE TABLE IF NOT EXISTS tutores (
  id_tutor INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL UNIQUE,
  especialidad VARCHAR(150),
  biografia TEXT,
  CONSTRAINT fk_tutores_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabla de materias
CREATE TABLE IF NOT EXISTS materias (
  id_materia INT AUTO_INCREMENT PRIMARY KEY,
  nombre_materia VARCHAR(150) NOT NULL,
  id_carrera INT,
  CONSTRAINT fk_materias_carreras FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Tabla tutor_materia (relación M:N)
CREATE TABLE IF NOT EXISTS tutor_materia (
  id_tutor INT NOT NULL,
  id_materia INT NOT NULL,
  PRIMARY KEY (id_tutor, id_materia),
  CONSTRAINT fk_tm_tutor FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor) ON DELETE CASCADE,
  CONSTRAINT fk_tm_materia FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabla disponibilidad_tutor
CREATE TABLE IF NOT EXISTS disponibilidad_tutor (
  id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
  id_tutor INT NOT NULL,
  dia_semana ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  CONSTRAINT fk_disp_tutor FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Tabla tutorias
CREATE TABLE IF NOT EXISTS tutorias (
  id_tutoria INT AUTO_INCREMENT PRIMARY KEY,
  id_estudiante INT NOT NULL,
  id_tutor INT NOT NULL,
  id_materia INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  modalidad ENUM('presencial','virtual') NOT NULL DEFAULT 'presencial',
  lugar_o_enlace VARCHAR(200),
  estado ENUM('pendiente','confirmada','realizada','cancelada') NOT NULL DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tutorias_estudiante FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON UPDATE CASCADE,
  CONSTRAINT fk_tutorias_tutor FOREIGN KEY (id_tutor) REFERENCES tutores(id_tutor) ON UPDATE CASCADE,
  CONSTRAINT fk_tutorias_materia FOREIGN KEY (id_materia) REFERENCES materias(id_materia) ON UPDATE CASCADE,
  INDEX idx_tutoria_fecha (fecha),
  INDEX idx_tutoria_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Tabla evaluaciones_tutoria
CREATE TABLE IF NOT EXISTS evaluaciones_tutoria (
  id_evaluacion INT AUTO_INCREMENT PRIMARY KEY,
  id_tutoria INT NOT NULL UNIQUE,
  calificacion TINYINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT,
  fecha_evaluacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluaciones_tutoria FOREIGN KEY (id_tutoria) REFERENCES tutorias(id_tutoria) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Tabla registro_accesos (auditoría)
CREATE TABLE IF NOT EXISTS registro_accesos (
  id_acceso INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NULL,
  fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_origen VARCHAR(45) NOT NULL,
  resultado ENUM('exitoso','fallido') NOT NULL,
  CONSTRAINT fk_accesos_usuarios FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- Datos semilla oficiales y compatibles
-- =========================================================
INSERT INTO roles (id_rol, nombre_rol) VALUES
(1, 'administrador'),
(2, 'tutor'),
(3, 'estudiante')
ON DUPLICATE KEY UPDATE nombre_rol = VALUES(nombre_rol);

INSERT INTO carreras (id_carrera, nombre_carrera) VALUES
(1, 'Ingeniería de Sistemas'),
(2, 'Ingeniería Comercial'),
(3, 'Ingeniería Industrial'),
(4, 'Administración de Empresas'),
(5, 'Contaduría Pública'),
(6, 'Derecho'),
(7, 'Psicología'),
(8, 'Comunicación Social'),
(9, 'Arquitectura'),
(10, 'Ingeniería Financiera')
ON DUPLICATE KEY UPDATE nombre_carrera = VALUES(nombre_carrera);

INSERT INTO materias (id_materia, nombre_materia, id_carrera) VALUES
(1, 'Base de Datos I', 1),
(2, 'Programación I', 1),
(3, 'Tecnología Web I', 1)
ON DUPLICATE KEY UPDATE nombre_materia = VALUES(nombre_materia);

-- Hash de prueba para 'password': $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- 1. Administrador (admin / password)
INSERT INTO usuarios (id_usuario, id_rol, nombre, apellido, correo, usuario, contrasena_hash, telefono, estado) VALUES
(1, 1, 'Administrador', 'Principal', 'admin@tutorias.com', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '70000001', 'activo')
ON DUPLICATE KEY UPDATE usuario = VALUES(usuario);

-- 2. Tutor (tutor1 / password)
INSERT INTO usuarios (id_usuario, id_rol, nombre, apellido, correo, usuario, contrasena_hash, telefono, estado) VALUES
(2, 2, 'Carlos', 'Docente', 'tutor@tutorias.com', 'tutor1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '70000002', 'activo')
ON DUPLICATE KEY UPDATE usuario = VALUES(usuario);

INSERT INTO tutores (id_tutor, id_usuario, especialidad, biografia) VALUES
(1, 2, 'Desarrollo Web y Bases de Datos', 'Docente tutor especializado en ingeniería de software y tecnologías web.')
ON DUPLICATE KEY UPDATE especialidad = VALUES(especialidad);

INSERT INTO tutor_materia (id_tutor, id_materia) VALUES
(1, 1),
(1, 3)
ON DUPLICATE KEY UPDATE id_materia = VALUES(id_materia);

-- 3. Estudiante (estudiante1 / password)
INSERT INTO usuarios (id_usuario, id_rol, nombre, apellido, correo, usuario, contrasena_hash, telefono, estado) VALUES
(3, 3, 'María', 'Estudiante', 'estudiante@tutorias.com', 'estudiante1', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '70000003', 'activo')
ON DUPLICATE KEY UPDATE usuario = VALUES(usuario);

INSERT INTO estudiantes (id_estudiante, id_usuario, id_carrera, semestre, registro_universitario) VALUES
(1, 3, 1, 4, 'RU-2024-001')
ON DUPLICATE KEY UPDATE registro_universitario = VALUES(registro_universitario);

-- 12. Tabla de permisos (RBAC)
CREATE TABLE IF NOT EXISTS permisos (
  id_permiso INT AUTO_INCREMENT PRIMARY KEY,
  nombre_permiso VARCHAR(100) NOT NULL UNIQUE,
  modulo VARCHAR(50) NOT NULL,
  descripcion VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Tabla intermedia rol_permisos
CREATE TABLE IF NOT EXISTS rol_permisos (
  id_rol INT NOT NULL,
  id_permiso INT NOT NULL,
  PRIMARY KEY (id_rol, id_permiso),
  CONSTRAINT fk_rp_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rp_permiso FOREIGN KEY (id_permiso) REFERENCES permisos(id_permiso) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de permisos (IDs 1 al 33)
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
ON DUPLICATE KEY UPDATE nombre_permiso = VALUES(nombre_permiso), modulo = VALUES(modulo), descripcion = VALUES(descripcion);

-- Asignaciones para Administrador (Rol 1)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(1, 9), (1, 10), (1, 11), (1, 12), (1, 13), (1, 14), (1, 15), (1, 16),
(1, 17), (1, 18), (1, 19), (1, 20), (1, 21), (1, 22), (1, 23),
(1, 24), (1, 25), (1, 26), (1, 27), (1, 28), (1, 29), (1, 30), (1, 31),
(1, 32), (1, 33)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- Asignaciones para Tutor (Rol 2)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(2, 33), (2, 21), (2, 22), (2, 23), (2, 24), (2, 26), (2, 13), (2, 9), (2, 17), (2, 18), (2, 28)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

-- Asignaciones para Estudiante (Rol 3)
INSERT INTO rol_permisos (id_rol, id_permiso) VALUES
(3, 33), (3, 24), (3, 25), (3, 17), (3, 13), (3, 9), (3, 21), (3, 28), (3, 29), (3, 20)
ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol);

