<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../includes/auth_helper.php';
require_once __DIR__ . '/../../models/RolModel.php';

// Solo usuarios con permiso para listar roles pueden acceder
requerirPermiso($pdo, 'listar_rol');

$model = new RolModel($pdo);
$roles = $model->obtenerTodos();

jsonSuccess($roles);