<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CarreraModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new CarreraModel($pdo);

if ($method === 'GET') {
    $carreras = $model->obtenerTodas();
    jsonSuccess($carreras);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    $nombre = trim($data['nombre_carrera'] ?? '');

    if (empty($nombre)) {
        jsonError('El nombre de la carrera es obligatorio');
    }

    try {
        $model->crear($nombre);
        jsonSuccess(['id_carrera' => $pdo->lastInsertId()], 'Carrera registrada con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al crear carrera: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
