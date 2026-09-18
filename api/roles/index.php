<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/RolModel.php';

$model = new RolModel($pdo);
$roles = $model->obtenerTodos();
jsonSuccess($roles);
