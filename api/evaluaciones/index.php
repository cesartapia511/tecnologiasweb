<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EvaluacionModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EvaluacionModel($pdo);

if ($method === 'GET') {
    $id_tutor = $_GET['id_tutor'] ?? null;
    $evaluaciones = $model->obtenerTodas($id_tutor);
    jsonSuccess($evaluaciones);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    $id_tutoria = $data['id_tutoria'] ?? null;
    $calificacion = intval($data['calificacion'] ?? 0);

    if (!$id_tutoria || $calificacion < 1 || $calificacion > 5) {
        jsonError('ID de tutoría y calificación válida (1 a 5 estrellas) son requeridos');
    }

    try {
        $id_eval = $model->crear($data);
        jsonSuccess(['id_evaluacion' => $id_eval], 'Evaluación guardada exitosamente', 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonError('Esta tutoría ya ha sido evaluada previamente');
        }
        jsonError('Error al guardar evaluación: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
