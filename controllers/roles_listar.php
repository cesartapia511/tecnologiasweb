<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RolModel.php';

$rolModel = new RolModel($pdo);

$roles = $rolModel->obtenerTodos();

require_once __DIR__ . '/../views/roles/listar.php';