<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/DisponibilidadModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new DisponibilidadModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_disponibilidad');
    $id_tutor = isset($_GET['id_tutor']) ? (int)$_GET['id_tutor'] : null;
    if ($id_tutor) {
        $list = $model->obtenerPorTutor($id_tutor);
    } else {
        $list = $model->obtenerTodas();
    }
    jsonSuccess($list, 'Horarios de disponibilidad obtenidos correctamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_disponibilidad');
    $data = getJsonInput();
    
    $id_tutor = isset($data['id_tutor']) ? (int)$data['id_tutor'] : 0;

    // Si el usuario es tutor, forzar su propio id_tutor
    if ($usuarioAuth['rol'] === 'tutor') {
        $id_tutor = (int)($usuarioAuth['id_tutor'] ?? 0);
    }

    if ($id_tutor <= 0) {
        jsonError('ID de tutor inválido o no especificado', 400, 'Debes asociar el horario a un docente tutor válido.');
    }

    // Verificar existencia del tutor
    $stmtTut = $pdo->prepare("SELECT id_tutor FROM tutores WHERE id_tutor = ?");
    $stmtTut->execute([$id_tutor]);
    if (!$stmtTut->fetch()) {
        jsonError('Tutor inexistente', 404, "No existe ningún tutor registrado con ID #$id_tutor.");
    }

    $dia_semana = trim($data['dia_semana'] ?? '');
    $hora_inicio = trim($data['hora_inicio'] ?? '');
    $hora_fin = trim($data['hora_fin'] ?? '');

    $diasValidos = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
    if (!in_array($dia_semana, $diasValidos, true)) {
        jsonError('Día de la semana inválido', 400, 'El día debe ser uno de: ' . implode(', ', $diasValidos) . '.');
    }

    if (empty($hora_inicio) || empty($hora_fin)) {
        jsonError('Horarios requeridos', 400, 'Debes especificar tanto la hora de inicio como la hora de fin.');
    }

    // Normalizar a formato HH:MM:00
    if (strlen($hora_inicio) === 5) $hora_inicio .= ':00';
    if (strlen($hora_fin) === 5) $hora_fin .= ':00';

    $timeInicio = strtotime($hora_inicio);
    $timeFin = strtotime($hora_fin);

    if (!$timeInicio || !$timeFin) {
        jsonError('Formato de hora inválido', 400, 'Las horas deben tener un formato válido (HH:MM).');
    }

    if ($timeInicio >= $timeFin) {
        jsonError('Rango de horario inconsistente', 400, 'La hora de inicio debe ser estrictamente anterior a la hora de fin.');
    }

    // Franja mínima de 30 minutos
    if (($timeFin - $timeInicio) < 1800) {
        jsonError('Duración insuficiente', 400, 'La franja horaria debe tener una duración mínima de al menos 30 minutos.');
    }

    // Validar solapamiento con horarios existentes del mismo tutor en ese día
    $stmtOverlap = $pdo->prepare("
        SELECT id_disponibilidad, hora_inicio, hora_fin 
        FROM disponibilidad_tutor 
        WHERE id_tutor = ? AND dia_semana = ? 
          AND NOT (hora_fin <= ? OR hora_inicio >= ?)
        LIMIT 1
    ");
    $stmtOverlap->execute([$id_tutor, $dia_semana, $hora_inicio, $hora_fin]);
    $overlap = $stmtOverlap->fetch();
    if ($overlap) {
        $motivo = "El rango solicitado ($hora_inicio a $hora_fin) se solapa con un bloque ya registrado ({$overlap['hora_inicio']} a {$overlap['hora_fin']}) para el día $dia_semana.";
        jsonError('Solapamiento de horarios detectado', 409, $motivo);
    }

    try {
        $id_disp = $model->crear([
            'id_tutor'    => $id_tutor,
            'dia_semana'  => $dia_semana,
            'hora_inicio' => $hora_inicio,
            'hora_fin'    => $hora_fin
        ]);
        jsonSuccess(['id_disponibilidad' => $id_disp], 'Horario de disponibilidad registrado con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al guardar disponibilidad', 500, 'Error interno: ' . $e->getMessage());
    }
} elseif ($method === 'DELETE') {
    $usuarioAuth = requerirPermiso($pdo, 'eliminar_disponibilidad');
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($id <= 0) {
        jsonError('ID de disponibilidad requerido', 400, 'Debes enviar un identificador numérico de disponibilidad.');
    }

    // Obtener horario y verificar pertenencia
    $stmtDisp = $pdo->prepare("SELECT id_disponibilidad, id_tutor FROM disponibilidad_tutor WHERE id_disponibilidad = ?");
    $stmtDisp->execute([$id]);
    $disp = $stmtDisp->fetch();

    if (!$disp) {
        jsonError('Horario no encontrado', 404, "No existe el registro de disponibilidad con ID #$id.");
    }

    if ($usuarioAuth['rol'] === 'tutor' && (!isset($usuarioAuth['id_tutor']) || (int)$usuarioAuth['id_tutor'] !== (int)$disp['id_tutor'])) {
        jsonError('Acceso denegado', 403, 'Solo puedes eliminar tus propios horarios de disponibilidad.');
    }

    try {
        $model->eliminar($id);
        jsonSuccess(['id_disponibilidad' => $id], 'Horario eliminado con éxito');
    } catch (PDOException $e) {
        jsonError('Error al eliminar disponibilidad', 500, 'Error en el servidor: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, POST y DELETE en esta ruta.');
}
