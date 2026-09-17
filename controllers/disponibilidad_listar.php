<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/DisponibilidadModel.php';

$disponibilidadModel = new DisponibilidadModel($pdo);

$disponibilidades = $disponibilidadModel->obtenerTodos();

require_once __DIR__ . '/../views/disponibilidad/listar.php';