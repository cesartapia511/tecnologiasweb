<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutoriaModel($pdo);

if ($method === 'GET') {
    $filtros = [
        'id_estudiante' => $_GET['id_estudiante'] ?? null,
        'id_tutor'      => $_GET['id_tutor'] ?? null,
        'estado'        => $_GET['estado'] ?? null,
    ];

    $tutorias = $model->obtenerTodas($filtros);
    jsonSuccess($tutorias);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    
    $id_estudiante = $data['id_estudiante'] ?? null;
    $id_tutor = $data['id_tutor'] ?? null;
    $id_materia = $data['id_materia'] ?? null;
    $fecha = $data['fecha'] ?? '';
    $hora_inicio = $data['hora_inicio'] ?? '';
    $hora_fin = $data['hora_fin'] ?? '';

    if (!$id_estudiante || !$id_tutor || !$id_materia || empty($fecha) || empty($hora_inicio) || empty($hora_fin)) {
        jsonError('Faltan campos obligatorios para agendar la tutoría');
    }

    try {
        $id_tutoria = $model->crear($data);
        jsonSuccess(['id_tutoria' => $id_tutoria], 'Solicitud de tutoría enviada con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al solicitar tutoría: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    $id_tutoria = $data['id_tutoria'] ?? null;
    $nuevo_estado = $data['estado'] ?? null; // 'pendiente','confirmada','realizada','cancelada'
    $lugar_o_enlace = $data['lugar_o_enlace'] ?? null;
    $observaciones = $data['observaciones'] ?? null;

    if (!$id_tutoria || !$nuevo_estado) {
        jsonError('ID de tutoría y estado requeridos');
    }

    $validos = ['pendiente', 'confirmada', 'realizada', 'cancelada'];
    if (!in_array($nuevo_estado, $validos)) {
        jsonError('Estado no válido');
    }

    try {
        $model->actualizarEstado($id_tutoria, $nuevo_estado, $lugar_o_enlace, $observaciones);
        jsonSuccess(null, 'Tutoría actualizada a estado: ' . $nuevo_estado);
    } catch (PDOException $e) {
        jsonError('Error al actualizar estado: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no permitido', 405);
}
