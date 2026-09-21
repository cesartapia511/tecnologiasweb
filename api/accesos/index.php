<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../includes/auth_helper.php';
require_once __DIR__ . '/../../models/RegistroAccesoModel.php';

// La bitácora de accesos contiene información sensible.
// Solo usuarios con permiso de auditoría pueden consultarla.
requerirPermiso($pdo, 'listar_acceso');

$model = new RegistroAccesoModel($pdo);
$accesos = $model->obtenerRecientes(100);

jsonSuccess($accesos);