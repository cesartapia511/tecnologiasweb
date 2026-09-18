<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CarreraModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$model = new CarreraModel($pdo);

if (!$id) {
    jsonError('ID de carrera no proporcionado', 400);
}

if ($method === 'GET') {
    $carrera = $model->obtenerPorId($id);
    if (!$carrera) {
        jsonError('Carrera no encontrada', 404);
    }
    jsonSuccess($carrera);
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    $nombre = trim($data['nombre_carrera'] ?? '');
    if (empty($nombre)) {
        jsonError('El nombre de la carrera es obligatorio');
    }

    try {
        $model->actualizar($id, $nombre);
        jsonSuccess(null, 'Carrera actualizada correctamente');
    } catch (PDOException $e) {
        jsonError('Error al actualizar carrera: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    try {
        $model->eliminar($id);
        jsonSuccess(null, 'Carrera eliminada correctamente');
    } catch (PDOException $e) {
        jsonError('No se puede eliminar esta carrera porque tiene materias o estudiantes asignados.', 409);
    }
} else {
    jsonError('Método no permitido', 405);
}
