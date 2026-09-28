<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/SolicitudMateriaModel.php';
require_once __DIR__ . '/../../models/TutorModel.php';
require_once __DIR__ . '/../../models/NotificacionModel.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

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
    $dia_semana = isset($data['dia_semana']) ? $data['dia_semana'] : '';
    $turno = isset($data['turno']) ? $data['turno'] : ''; // expects Mañana, Mediodía, Tarde, Noche
    
    if ($id_materia <= 0) {
        jsonError('Materia inválida', 400, 'Debe especificar una materia válida.');
    }
    
    $turnosMap = [
        'Mañana' => ['07:30', '10:30'],
        'Mediodía' => ['11:00', '14:00'],
        'Tarde' => ['15:00', '18:00'],
        'Noche' => ['19:00', '22:00']
    ];

    if (!isset($turnosMap[$turno])) {
        jsonError('Turno inválido', 400, 'El turno seleccionado no es válido.');
    }

    $hora_inicio = $turnosMap[$turno][0] . ':00';
    $hora_fin = $turnosMap[$turno][1] . ':00';

    if (!in_array($dia_semana, ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'])) {
        jsonError('Día inválido', 400, 'El día seleccionado no es válido.');
    }

    // Verify availability
    $stmtDisp = $pdo->prepare("
        SELECT id_disponibilidad
        FROM disponibilidad_tutor
        WHERE id_tutor = ?
          AND dia_semana = ?
          AND hora_inicio <= ?
          AND hora_fin >= ?
        LIMIT 1
    ");
    $stmtDisp->execute([$usuarioAuth['id_tutor'], $dia_semana, $hora_inicio, $hora_fin]);
    if (!$stmtDisp->fetch()) {
        jsonError('Horario inválido', 400, 'El turno seleccionado no está cubierto por su disponibilidad.');
    }
    
    try {
        $id_solicitud = $model->crear($usuarioAuth['id_tutor'], $id_materia, $dia_semana, $hora_inicio, $hora_fin);
        
        // Notification for Admins
        $materiaModel = new MateriaModel($pdo);
        $materiaInfo = $materiaModel->obtenerPorId($id_materia);
        $nombreMateria = $materiaInfo ? $materiaInfo['nombre_materia'] : 'Materia';
        $nombreTutor = isset($usuarioAuth['nombre']) ? $usuarioAuth['nombre'] . ' ' . $usuarioAuth['apellido'] : 'Un tutor';
        
        $notificacionModel = new NotificacionModel($pdo);
        $stmtAdmins = $pdo->query("SELECT id_usuario FROM usuarios WHERE id_rol = 1 AND estado = 'activo'");
        $admins = $stmtAdmins->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($admins as $admin) {
            $notificacionModel->crear(
                $admin['id_usuario'],
                'Nueva Solicitud de Materia',
                "El tutor {$nombreTutor} ha solicitado impartir la materia {$nombreMateria}.",
                'info'
            );
        }
        
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
            // Validate availability again
            $stmtDisp = $pdo->prepare("
                SELECT id_disponibilidad FROM disponibilidad_tutor
                WHERE id_tutor = ? AND dia_semana = ? AND hora_inicio <= ? AND hora_fin >= ? LIMIT 1
            ");
            $stmtDisp->execute([$solicitud['id_tutor'], $solicitud['dia_semana'], $solicitud['hora_inicio'], $solicitud['hora_fin']]);
            if (!$stmtDisp->fetch()) {
                throw new Exception('El tutor ya no tiene disponibilidad para este turno.');
            }

            // Validate overlap again
            $stmtOver = $pdo->prepare("
                SELECT id_solicitud FROM solicitudes_materias
                WHERE id_tutor = ? AND dia_semana = ? AND hora_inicio = ? AND estado = 'aprobada'
            ");
            $stmtOver->execute([$solicitud['id_tutor'], $solicitud['dia_semana'], $solicitud['hora_inicio']]);
            if ($stmtOver->fetch()) {
                throw new Exception('El tutor ya tiene otra materia aprobada en este turno.');
            }

            $tutorModel = new TutorModel($pdo);
            // Get current matters
            $tutor = $tutorModel->obtenerPorId($solicitud['id_tutor']);
            $currentMatters = array_column($tutor['materias'], 'id_materia');
            
            if (!in_array($solicitud['id_materia'], $currentMatters)) {
                $currentMatters[] = $solicitud['id_materia'];
                $tutorModel->asignarMaterias($solicitud['id_tutor'], $currentMatters);
            }
        }
        
        // Notification for Tutor
        $stmtTutor = $pdo->prepare("SELECT id_usuario FROM tutores WHERE id_tutor = :id_tutor");
        $stmtTutor->execute([':id_tutor' => $solicitud['id_tutor']]);
        $tutorData = $stmtTutor->fetch(PDO::FETCH_ASSOC);
        
        if ($tutorData) {
            $materiaModel = new MateriaModel($pdo);
            $materiaInfo = $materiaModel->obtenerPorId($solicitud['id_materia']);
            $nombreMateria = $materiaInfo ? $materiaInfo['nombre_materia'] : 'Materia';
            
            $notificacionModel = new NotificacionModel($pdo);
            $notificacionModel->crear(
                $tutorData['id_usuario'],
                'Solicitud de Materia ' . ucfirst($estado),
                "Tu solicitud para impartir la materia {$nombreMateria} ha sido {$estado}.",
                $estado === 'aprobada' ? 'success' : 'warning'
            );
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
