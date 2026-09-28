-- Migración 08: Hacer nullable id_materia en tutorias
-- Permite guardar tutorías de Modalidad de Graduación sin vincularlas a una materia curricular específica

ALTER TABLE tutorias 
MODIFY COLUMN id_materia INT NULL;
