<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/RegistroAccesoModel.php';

$model = new RegistroAccesoModel($pdo);
$accesos = $model->obtenerRecientes(100);
jsonSuccess($accesos);
