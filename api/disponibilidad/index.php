<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/DisponibilidadModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new DisponibilidadModel($pdo);

if ($method === 'GET') {
    $id_tutor = $_GET['id_tutor'] ?? null;
    if ($id_tutor) {
        $list = $model->obtenerPorTutor($id_tutor);
    } else {
        $list = $model->obtenerTodas();
    }
    jsonSuccess($list);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    $id_tutor = $data['id_tutor'] ?? null;
    $dia_semana = $data['dia_semana'] ?? '';
    $hora_inicio = $data['hora_inicio'] ?? '';
    $hora_fin = $data['hora_fin'] ?? '';

    if (!$id_tutor || empty($dia_semana) || empty($hora_inicio) || empty($hora_fin)) {
        jsonError('Todos los campos son obligatorios (tutor, día, hora inicio y fin)');
    }

    if (strtotime($hora_inicio) >= strtotime($hora_fin)) {
        jsonError('La hora de inicio debe ser anterior a la hora de fin');
    }

    try {
        $id_disp = $model->crear($data);
        jsonSuccess(['id_disponibilidad' => $id_disp], 'Horario de disponibilidad agregado con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al guardar disponibilidad: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        jsonError('ID de disponibilidad requerido');
    }
    $model->eliminar($id);
    jsonSuccess(null, 'Horario eliminado con éxito');
} else {
    jsonError('Método no permitido', 405);
}
