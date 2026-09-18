-- Carreras oficiales UPDS Tarija
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

-- Materias adicionales para las distintas carreras
INSERT INTO materias (nombre_materia, id_carrera) VALUES
-- Ing. Comercial / Administración
('Marketing Digital', 2),
('Comercio Internacional', 2),
('Administración Estratégica', 4),
('Gestión del Talento Humano', 4),
-- Ing. Industrial
('Investigación de Operaciones', 3),
('Seguridad e Higiene Industrial', 3),
-- Contaduría Pública / Financiera
('Contabilidad de Costos', 5),
('Auditoría Financiera', 5),
('Finanzas Corporativas', 10),
-- Derecho
('Derecho Constitucional', 6),
('Derecho Procesal Civil', 6),
-- Psicología
('Psicología Organizacional', 7),
('Psicología Educativa', 7),
-- Comunicación Social
('Periodismo Digital', 8),
('Comunicación Corporativa', 8),
-- Arquitectura
('Diseño y Expresión Gráfica', 9),
('Historia de la Arquitectura', 9)
ON DUPLICATE KEY UPDATE nombre_materia = VALUES(nombre_materia);

-- Horarios oficiales UPDS:
-- Presencial (Lunes a Viernes):
-- 07:30 - 10:30 (Mañana 1)
-- 11:00 - 14:00 (Mañana 2)
-- 15:00 - 18:00 (Tarde)
-- 19:00 - 22:00 (Noche)
-- Semipresencial:
-- Sábados presencial (08:00 - 12:00 / 14:00 - 18:00)
-- Lunes a Viernes virtual (19:00 - 22:00)

DELETE FROM disponibilidad_tutor WHERE id_tutor = 1;
INSERT INTO disponibilidad_tutor (id_tutor, dia_semana, hora_inicio, hora_fin) VALUES
(1, 'Lunes', '07:30:00', '10:30:00'),
(1, 'Lunes', '19:00:00', '22:00:00'),
(1, 'Martes', '11:00:00', '14:00:00'),
(1, 'Miercoles', '15:00:00', '18:00:00'),
(1, 'Jueves', '07:30:00', '10:30:00'),
(1, 'Viernes', '19:00:00', '22:00:00'),
(1, 'Sabado', '08:00:00', '12:00:00'),
(1, 'Sabado', '14:00:00', '18:00:00');
