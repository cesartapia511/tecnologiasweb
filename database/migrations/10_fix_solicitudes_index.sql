ALTER TABLE solicitudes_materias DROP INDEX unique_solicitud;
ALTER TABLE solicitudes_materias ADD INDEX idx_solicitud (id_tutor, dia_semana, hora_inicio, estado);
