DELETE FROM solicitudes_materias;
ALTER TABLE solicitudes_materias ADD UNIQUE KEY unique_solicitud (id_tutor, dia_semana, hora_inicio, estado);
