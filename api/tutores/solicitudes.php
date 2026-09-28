<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/SolicitudMateriaModel.php';
require_once __DIR__ . '/../../models/TutorModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new SolicitudMateriaModel($pdo);

if ($method === 'GET') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutor');
    
    if ($usuarioAuth['rol'] === 'tutor') {
        $solicitudes = $model->obtenerPorTutor($usuarioAuth['id_tutor']);
    } else {
        $solicitudes = $model->obtenerTodas();
    }
    
    jsonSuccess($solicitudes, 'Solicitudes obtenidas exitosamente');
}
elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutor'); // Tutores pueden solicitar
    
    if ($usuarioAuth['rol'] !== 'tutor') {
        jsonError('Acceso denegado', 403, 'Solo los tutores pueden solicitar materias.');
    }
    
    $data = getJsonInput();
    $id_materia = isset($data['id_materia']) ? (int) $data['id_materia'] : 0;
    
    if ($id_materia <= 0) {
        jsonError('Materia inválida', 400, 'Debe especificar una materia válida.');
    }
    
    try {
        $id_solicitud = $model->crear($usuarioAuth['id_tutor'], $id_materia);
        jsonSuccess(['id_solicitud' => $id_solicitud], 'Solicitud enviada correctamente', 201);
    } catch (Exception $e) {
        jsonError('Error', 400, $e->getMessage());
    }
}
elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_tutor'); // Solo admins
    
    if ($usuarioAuth['rol'] === 'tutor') {
        jsonError('Acceso denegado', 403, 'Los tutores no pueden resolver solicitudes.');
    }
    
    $data = getJsonInput();
    $id_solicitud = isset($data['id_solicitud']) ? (int) $data['id_solicitud'] : 0;
    $estado = isset($data['estado']) ? $data['estado'] : '';
    
    if ($id_solicitud <= 0 || !in_array($estado, ['aprobada', 'rechazada'])) {
        jsonError('Datos inválidos', 400, 'Falta ID de solicitud o estado inválido.');
    }
    
    $solicitud = $model->obtenerPorId($id_solicitud);
    if (!$solicitud) {
        jsonError('Solicitud no encontrada', 404, 'No existe la solicitud indicada.');
    }
    
    if ($solicitud['estado'] !== 'pendiente') {
        jsonError('Solicitud ya resuelta', 400, 'Esta solicitud ya ha sido resuelta.');
    }
    
    try {
        $pdo->beginTransaction();
        
        $model->actualizarEstado($id_solicitud, $estado);
        
        if ($estado === 'aprobada') {
            $tutorModel = new TutorModel($pdo);
            // Get current matters
            $tutor = $tutorModel->obtenerPorId($solicitud['id_tutor']);
            $currentMatters = array_column($tutor['materias'], 'id_materia');
            
            if (!in_array($solicitud['id_materia'], $currentMatters)) {
                $currentMatters[] = $solicitud['id_materia'];
                $tutorModel->asignarMaterias($solicitud['id_tutor'], $currentMatters);
            }
        }
        
        $pdo->commit();
        jsonSuccess([], "Solicitud $estado correctamente");
    } catch (Exception $e) {
        $pdo->rollBack();
        jsonError('Error del servidor', 500, $e->getMessage());
    }
}
else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, POST y PUT.');
}
