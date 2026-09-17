<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EvaluacionModel.php';

$evaluacionModel = new EvaluacionModel($pdo);

$evaluaciones = $evaluacionModel->obtenerTodos();

require_once __DIR__ . '/../views/evaluaciones/listar.php';