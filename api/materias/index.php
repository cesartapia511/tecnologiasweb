<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new MateriaModel($pdo);

if ($method === 'GET') {
    $id_carrera = $_GET['id_carrera'] ?? null;
    if ($id_carrera) {
        $materias = $model->obtenerPorCarrera($id_carrera);
    } else {
        $materias = $model->obtenerTodas();
    }
    jsonSuccess($materias);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    $nombre = trim($data['nombre_materia'] ?? '');
    $id_carrera = $data['id_carrera'] ?? null;

    if (empty($nombre)) {
        jsonError('El nombre de la materia es obligatorio');
    }

    try {
        $model->crear([
            'nombre_materia' => $nombre,
            'id_carrera'     => !empty($id_carrera) ? $id_carrera : null
        ]);
        jsonSuccess(['id_materia' => $pdo->lastInsertId()], 'Materia registrada exitosamente', 201);
    } catch (PDOException $e) {
        jsonError('Error al crear materia: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
