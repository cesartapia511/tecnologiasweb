<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutoriaModel($pdo);

// Función auxiliar para obtener el nombre del día en español
function obtenerDiaSemanaEsp($fecha) {
    $dias = [
        1 => 'Lunes',
        2 => 'Martes',
        3 => 'Miercoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sabado',
        7 => 'Domingo'
    ];
    $numDia = (int)date('N', strtotime($fecha));
    return $dias[$numDia] ?? '';
}

if ($method === 'GET') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutoria');

    $filtros = [
        'id_estudiante' => $_GET['id_estudiante'] ?? null,
        'id_tutor'      => $_GET['id_tutor'] ?? null,
        'estado'        => $_GET['estado'] ?? null,
    ];

    // Restricciones automáticas de visualización por rol
    if ($usuarioAuth['rol'] === 'tutor') {
        $filtros['id_tutor'] = $usuarioAuth['id_tutor'] ?? -1;
    } elseif ($usuarioAuth['rol'] === 'estudiante') {
        $filtros['id_estudiante'] = $usuarioAuth['id_estudiante'] ?? -1;
    }

    $tutorias = $model->obtenerTodas($filtros);
    jsonSuccess($tutorias, 'Tutorías consultadas exitosamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_tutoria');
    $data = getJsonInput();
    
    $id_estudiante = isset($data['id_estudiante']) ? (int)$data['id_estudiante'] : 0;
    if ($usuarioAuth['rol'] === 'estudiante') {
        $id_estudiante = (int)($usuarioAuth['id_estudiante'] ?? 0);
    }

    $id_tutor   = isset($data['id_tutor']) ? (int)$data['id_tutor'] : 0;
    $id_materia = isset($data['id_materia']) ? (int)$data['id_materia'] : 0;
    $fecha      = trim($data['fecha'] ?? '');
    $hora_inicio= trim($data['hora_inicio'] ?? '');
    $hora_fin   = trim($data['hora_fin'] ?? '');
    $modalidad  = in_array($data['modalidad'] ?? 'presencial', ['presencial', 'virtual']) ? $data['modalidad'] : 'presencial';
    $lugar      = trim($data['lugar_o_enlace'] ?? '');
    $obs        = trim($data['observaciones'] ?? '');

    // 1. Validar existencias
    if ($id_estudiante <= 0) {
        jsonError('Estudiante no válido', 400, 'Se requiere un perfil de estudiante registrado para agendar tutorías.');
    }

    $stmtEst = $pdo->prepare("SELECT id_estudiante FROM estudiantes WHERE id_estudiante = ?");
    $stmtEst->execute([$id_estudiante]);
    if (!$stmtEst->fetch()) {
        jsonError('Estudiante inexistente', 404, "El registro de estudiante #$id_estudiante no existe.");
    }

    if ($id_tutor <= 0) {
        jsonError('Docente tutor no especificado', 400, 'Debes seleccionar un docente tutor.');
    }
    $stmtTut = $pdo->prepare("SELECT id_tutor FROM tutores WHERE id_tutor = ?");
    $stmtTut->execute([$id_tutor]);
    if (!$stmtTut->fetch()) {
        jsonError('Tutor inexistente', 404, "El tutor seleccionado con ID #$id_tutor no existe.");
    }

    if ($id_materia <= 0) {
        jsonError('Materia no especificada', 400, 'Debes seleccionar la materia para la tutoría.');
    }
    $stmtMat = $pdo->prepare("SELECT id_materia FROM materias WHERE id_materia = ?");
    $stmtMat->execute([$id_materia]);
    if (!$stmtMat->fetch()) {
        jsonError('Materia inexistente', 404, "La asignatura seleccionada no existe.");
    }

    // 2. Validar fechas pasadas
    if (empty($fecha) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)) {
        jsonError('Fecha inválida', 400, 'La fecha debe tener el formato AAAA-MM-DD.');
    }

    $hoy = date('Y-m-d');
    if ($fecha < $hoy) {
        jsonError('Fecha en el pasado', 400, 'No es posible agendar tutorías en fechas anteriores al día de hoy.');
    }

    // 3. Validar horas
    if (empty($hora_inicio) || empty($hora_fin)) {
        jsonError('Horarios no proporcionados', 400, 'Debes ingresar la hora de inicio y fin de la sesión.');
    }

    if (strlen($hora_inicio) === 5) $hora_inicio .= ':00';
    if (strlen($hora_fin) === 5) $hora_fin .= ':00';

    $timeIni = strtotime("$fecha $hora_inicio");
    $timeFin = strtotime("$fecha $hora_fin");
    $now = time();

    if (!$timeIni || !$timeFin) {
        jsonError('Formato de hora incorrecto', 400, 'Las horas deben tener formato válido (HH:MM).');
    }

    if ($fecha === $hoy && $timeIni <= $now) {
        jsonError('Horario en el pasado', 400, 'La hora de inicio seleccionada ya ha transcurrido el día de hoy.');
    }

    if ($timeIni >= $timeFin) {
        jsonError('Rango de horario inválido', 400, 'La hora de inicio debe ser anterior a la hora de fin.');
    }

    $duracionMinutos = ($timeFin - $timeIni) / 60;
    if ($duracionMinutos < 30 || $duracionMinutos > 180) {
        jsonError('Duración de tutoría fuera de norma', 400, 'La sesión debe tener una duración de entre 30 minutos y 3 horas.');
    }

    // 4. Verificar disponibilidad del tutor para ese día de la semana
    $diaSemana = obtenerDiaSemanaEsp($fecha);
    if ($diaSemana === 'Domingo') {
        jsonError('Día no laborable', 400, 'No se pueden agendar tutorías los días Domingo.');
    }

    $stmtDisp = $pdo->prepare("
        SELECT id_disponibilidad, hora_inicio, hora_fin 
        FROM disponibilidad_tutor 
        WHERE id_tutor = ? AND dia_semana = ?
          AND hora_inicio <= ? AND hora_fin >= ?
        LIMIT 1
    ");
    $stmtDisp->execute([$id_tutor, $diaSemana, $hora_inicio, $hora_fin]);
    $dispValida = $stmtDisp->fetch();

    // Si el tutor tiene disponibilidad configurada, verificar que la franja esté cubierta
    $stmtTieneDisp = $pdo->prepare("SELECT COUNT(*) FROM disponibilidad_tutor WHERE id_tutor = ?");
    $stmtTieneDisp->execute([$id_tutor]);
    $totalDispTutor = (int)$stmtTieneDisp->fetchColumn();

    if ($totalDispTutor > 0 && !$dispValida) {
        $motivo = "El docente tutor no cuenta con horario de atención registrado para el día $diaSemana en el intervalo $hora_inicio - $hora_fin.";
        jsonError('Tutor no disponible en el horario solicitado', 400, $motivo);
    }

    // 5. Verificar que el tutor no tenga choques de tutoría confirmada o pendiente
    $stmtChoque = $pdo->prepare("
        SELECT id_tutoria, hora_inicio, hora_fin, estado 
        FROM tutorias 
        WHERE id_tutor = ? AND fecha = ? 
          AND estado IN ('pendiente', 'confirmada')
          AND NOT (hora_fin <= ? OR hora_inicio >= ?)
        LIMIT 1
    ");
    $stmtChoque->execute([$id_tutor, $fecha, $hora_inicio, $hora_fin]);
    $choque = $stmtChoque->fetch();
    if ($choque) {
        $motivo = "El docente tutor ya tiene una tutoría programada ({$choque['hora_inicio']} a {$choque['hora_fin']}) en estado '{$choque['estado']}' para esa misma fecha.";
        jsonError('Conflicto de horario con otra tutoría', 409, $motivo);
    }

    try {
        $id_tutoria = $model->crear([
            'id_estudiante'  => $id_estudiante,
            'id_tutor'       => $id_tutor,
            'id_materia'     => $id_materia,
            'fecha'          => $fecha,
            'hora_inicio'    => $hora_inicio,
            'hora_fin'       => $hora_fin,
            'modalidad'      => $modalidad,
            'lugar_o_enlace' => $lugar,
            'observaciones'  => $obs,
        ]);
        jsonSuccess(['id_tutoria' => $id_tutoria], 'Solicitud de tutoría agendada con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al agendar tutoría', 500, 'Error interno: ' . $e->getMessage());
    }
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_tutoria');
    $data = getJsonInput();
    $id_tutoria   = isset($data['id_tutoria']) ? (int)$data['id_tutoria'] : 0;
    $nuevo_estado = trim($data['estado'] ?? '');
    $lugar_o_enlace = trim($data['lugar_o_enlace'] ?? '');
    $observaciones  = trim($data['observaciones'] ?? '');

    if ($id_tutoria <= 0 || empty($nuevo_estado)) {
        jsonError('ID de tutoría y estado requeridos', 400, 'Debes indicar el ID de la tutoría y el nuevo estado.');
    }

    $validos = ['pendiente', 'confirmada', 'realizada', 'cancelada'];
    if (!in_array($nuevo_estado, $validos, true)) {
        jsonError('Estado no válido', 400, 'El estado debe ser uno de: ' . implode(', ', $validos) . '.');
    }

    // Buscar la tutoría actual
    $tutoria = $model->obtenerPorId($id_tutoria);
    if (!$tutoria) {
        jsonError('Tutoría no encontrada', 404, "No existe ninguna sesión registrada con ID #$id_tutoria.");
    }

    // Comprobar privilegios según rol
    if ($usuarioAuth['rol'] === 'tutor') {
        if (!isset($usuarioAuth['id_tutor']) || (int)$usuarioAuth['id_tutor'] !== (int)$tutoria['id_tutor']) {
            jsonError('Acceso denegado', 403, 'Solo puedes gestionar las tutorías que han sido asignadas a tu cuenta.');
        }
    } elseif ($usuarioAuth['rol'] === 'estudiante') {
        if (!isset($usuarioAuth['id_estudiante']) || (int)$usuarioAuth['id_estudiante'] !== (int)$tutoria['id_estudiante']) {
            jsonError('Acceso denegado', 403, 'Solo puedes gestionar tus propias solicitudes de tutoría.');
        }
        if ($nuevo_estado !== 'cancelada') {
            jsonError('Acción no permitida', 403, 'Los estudiantes solo pueden solicitar la cancelación de sus tutorías.');
        }
        if ($tutoria['estado'] === 'realizada') {
            jsonError('Tutoría ya completada', 400, 'No puedes cancelar una tutoría que ya ha sido marcada como realizada.');
        }
    }

    try {
        $model->actualizarEstado(
            $id_tutoria,
            $nuevo_estado,
            $lugar_o_enlace ?: $tutoria['lugar_o_enlace'],
            $observaciones ?: $tutoria['observaciones']
        );
        jsonSuccess(['id_tutoria' => $id_tutoria, 'estado' => $nuevo_estado], "Tutoría actualizada correctamente a estado: '$nuevo_estado'");
    } catch (PDOException $e) {
        jsonError('Error al actualizar tutoría', 500, 'Error en base de datos: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, POST y PUT en esta ruta.');
}
