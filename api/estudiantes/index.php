<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EstudianteModel($pdo);

if ($method === 'GET') {
    $id_usuario = $_GET['id_usuario'] ?? null;
    if ($id_usuario) {
        $estudiante = $model->obtenerPorUsuario($id_usuario);
        jsonSuccess($estudiante);
    } else {
        $estudiantes = $model->obtenerTodos();
        jsonSuccess($estudiantes);
    }
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    $id_estudiante = $data['id_estudiante'] ?? null;

    if (!$id_estudiante) {
        jsonError('ID de estudiante requerido');
    }

    try {
        $model->actualizar($id_estudiante, $data);
        jsonSuccess(null, 'Datos de estudiante actualizados');
    } catch (PDOException $e) {
        jsonError('Error al actualizar estudiante: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
