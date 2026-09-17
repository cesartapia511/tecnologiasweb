<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EstudianteModel.php';

$estudianteModel = new EstudianteModel($pdo);

$estudiantes = $estudianteModel->obtenerTodos();

require_once __DIR__ . '/../views/estudiantes/listar.php';