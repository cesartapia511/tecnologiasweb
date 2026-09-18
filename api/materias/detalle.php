<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$model = new MateriaModel($pdo);

if (!$id) {
    jsonError('ID de materia no proporcionado', 400);
}

if ($method === 'GET') {
    $materia = $model->obtenerPorId($id);
    if (!$materia) {
        jsonError('Materia no encontrada', 404);
    }
    jsonSuccess($materia);
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    $nombre = trim($data['nombre_materia'] ?? '');
    $id_carrera = $data['id_carrera'] ?? null;

    if (empty($nombre)) {
        jsonError('El nombre de la materia es obligatorio');
    }

    try {
        $model->actualizar($id, [
            'nombre_materia' => $nombre,
            'id_carrera'     => !empty($id_carrera) ? $id_carrera : null
        ]);
        jsonSuccess(null, 'Materia actualizada correctamente');
    } catch (PDOException $e) {
        jsonError('Error al actualizar materia: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    try {
        $model->eliminar($id);
        jsonSuccess(null, 'Materia eliminada correctamente');
    } catch (PDOException $e) {
        jsonError('No se puede eliminar esta materia porque está asignada a tutores o tutorías agendadas.', 409);
    }
} else {
    jsonError('Método no permitido', 405);
}
