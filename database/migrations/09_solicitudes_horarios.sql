ALTER TABLE solicitudes_materias 
ADD COLUMN dia_semana ENUM('Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado') NOT NULL AFTER id_materia,
ADD COLUMN hora_inicio TIME NOT NULL AFTER dia_semana,
ADD COLUMN hora_fin TIME NOT NULL AFTER hora_inicio;

ALTER TABLE solicitudes_materias DROP INDEX unique_solicitud;
ALTER TABLE solicitudes_materias ADD UNIQUE KEY unique_solicitud (id_tutor, dia_semana, hora_inicio, estado);
