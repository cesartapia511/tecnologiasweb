-- 1. Agregar cupo_maximo a tutorias si no existe
SET @exist_cupo = (SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'tutorias' AND COLUMN_NAME = 'cupo_maximo');

SET @sql_cupo = IF(@exist_cupo = 0, 
    'ALTER TABLE tutorias ADD COLUMN cupo_maximo INT NOT NULL DEFAULT 5 AFTER lugar_o_enlace', 
    'SELECT "La columna cupo_maximo ya existe"');
PREPARE stmt1 FROM @sql_cupo;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

-- 2. Crear tabla pivote tutoria_estudiante
CREATE TABLE IF NOT EXISTS tutoria_estudiante (
    id_tutoria INT NOT NULL,
    id_estudiante INT NOT NULL,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_asignacion ENUM('inscrito','cancelado') DEFAULT 'inscrito',
    PRIMARY KEY (id_tutoria, id_estudiante),
    FOREIGN KEY (id_tutoria) REFERENCES tutorias(id_tutoria) ON DELETE CASCADE,
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Migrar las relaciones existentes de forma segura
INSERT IGNORE INTO tutoria_estudiante (id_tutoria, id_estudiante, fecha_asignacion, estado_asignacion)
SELECT id_tutoria, id_estudiante, fecha_solicitud, 
       IF(estado = 'cancelada', 'cancelado', 'inscrito')
FROM tutorias
WHERE id_estudiante IS NOT NULL;

-- 4. Crear tabla de periodos_inscripcion
CREATE TABLE IF NOT EXISTS periodos_inscripcion (
  id_periodo INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 0,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
