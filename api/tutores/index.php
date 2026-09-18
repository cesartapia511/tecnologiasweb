<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutorModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutorModel($pdo);

if ($method === 'GET') {
    $tutores = $model->obtenerTodos();
    jsonSuccess($tutores);
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    $id_tutor = $data['id_tutor'] ?? null;

    if (!$id_tutor) {
        jsonError('ID de tutor requerido');
    }

    try {
        $model->actualizar($id_tutor, $data);
        jsonSuccess(null, 'Perfil de tutor actualizado con éxito');
    } catch (PDOException $e) {
        jsonError('Error al actualizar perfil de tutor: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
