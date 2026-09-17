<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutoriaModel.php';

$tutoriaModel = new TutoriaModel($pdo);

$tutorias = $tutoriaModel->obtenerTodos();

require_once __DIR__ . '/../views/tutorias/listar.php';