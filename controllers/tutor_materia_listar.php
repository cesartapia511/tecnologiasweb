<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorMateriaModel.php';

$tutorMateriaModel = new TutorMateriaModel($pdo);

$asignaciones = $tutorMateriaModel->obtenerTodos();

require_once __DIR__ . '/../views/tutor_materia/listar.php';