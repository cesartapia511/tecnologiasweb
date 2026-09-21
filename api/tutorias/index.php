<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutoriaModel($pdo);

function obtenerDiaSemanaEsp($fecha)
{
    $dias = [
        1 => 'Lunes',
        2 => 'Martes',
        3 => 'Miercoles',
        4 => 'Jueves',
        5 => 'Viernes',
        6 => 'Sabado',
        7 => 'Domingo'
    ];

    $numDia = (int) date('N', strtotime($fecha));

    return $dias[$numDia] ?? '';
}

/*
 * =========================================================
 * GET - CONSULTAR TUTORÍAS
 * =========================================================
 */

if ($method === 'GET') {

    $usuarioAuth = requerirPermiso($pdo, 'listar_tutoria');

    $filtros = [
        'id_estudiante' => $_GET['id_estudiante'] ?? null,
        'id_tutor'      => $_GET['id_tutor'] ?? null,
        'estado'        => $_GET['estado'] ?? null,
    ];

    /*
     * El backend ignora los filtros enviados por el cliente
     * cuando se trata de Tutor o Estudiante.
     */
    if ($usuarioAuth['rol'] === 'tutor') {

        if (empty($usuarioAuth['id_tutor'])) {
            jsonError(
                'Perfil de tutor no encontrado',
                403,
                'El usuario no tiene un perfil de tutor asociado.'
            );
        }

        $filtros['id_tutor'] = (int) $usuarioAuth['id_tutor'];

    } elseif ($usuarioAuth['rol'] === 'estudiante') {

        if (empty($usuarioAuth['id_estudiante'])) {
            jsonError(
                'Perfil de estudiante no encontrado',
                403,
                'El usuario no tiene un perfil de estudiante asociado.'
            );
        }

        $filtros['id_estudiante'] = (int) $usuarioAuth['id_estudiante'];
    }

    /*
     * Validar estado recibido como filtro.
     */
    if (!empty($filtros['estado'])) {

        $estadosValidos = [
            'pendiente',
            'confirmada',
            'realizada',
            'cancelada'
        ];

        if (!in_array($filtros['estado'], $estadosValidos, true)) {
            jsonError(
                'Estado de filtro inválido',
                400,
                'El estado debe ser pendiente, confirmada, realizada o cancelada.'
            );
        }
    }

    $tutorias = $model->obtenerTodas($filtros);

    jsonSuccess(
        $tutorias,
        'Tutorías consultadas exitosamente'
    );
}

/*
 * =========================================================
 * POST - CREAR TUTORÍA
 * =========================================================
 */

elseif ($method === 'POST') {

    $usuarioAuth = requerirPermiso($pdo, 'crear_tutoria');

    $data = getJsonInput();

    $id_estudiante = isset($data['id_estudiante'])
        ? (int) $data['id_estudiante']
        : 0;

    /*
     * Un estudiante SOLO puede crear una tutoría para sí mismo.
     */
    if ($usuarioAuth['rol'] === 'estudiante') {

        if (empty($usuarioAuth['id_estudiante'])) {
            jsonError(
                'Perfil de estudiante no encontrado',
                403,
                'El usuario no tiene un perfil de estudiante asociado.'
            );
        }

        $id_estudiante = (int) $usuarioAuth['id_estudiante'];
    }

    $id_tutor = isset($data['id_tutor'])
        ? (int) $data['id_tutor']
        : 0;

    $id_materia = isset($data['id_materia'])
        ? (int) $data['id_materia']
        : 0;

    $fecha = trim($data['fecha'] ?? '');
    $hora_inicio = trim($data['hora_inicio'] ?? '');
    $hora_fin = trim($data['hora_fin'] ?? '');

    $modalidad = $data['modalidad'] ?? 'presencial';

    $lugar = trim($data['lugar_o_enlace'] ?? '');
    $obs = trim($data['observaciones'] ?? '');

    /*
     * =====================================================
     * VALIDACIONES BÁSICAS
     * =====================================================
     */

    if ($id_estudiante <= 0) {
        jsonError(
            'Estudiante no válido',
            400,
            'Se requiere un perfil de estudiante válido.'
        );
    }

    if ($id_tutor <= 0) {
        jsonError(
            'Docente tutor no especificado',
            400,
            'Debes seleccionar un docente tutor.'
        );
    }

    if ($id_materia <= 0) {
        jsonError(
            'Materia no especificada',
            400,
            'Debes seleccionar una materia.'
        );
    }

    if (!in_array($modalidad, ['presencial', 'virtual'], true)) {
        jsonError(
            'Modalidad inválida',
            400,
            'La modalidad debe ser presencial o virtual.'
        );
    }

    if (mb_strlen($lugar) > 200) {
        jsonError(
            'Lugar o enlace demasiado largo',
            400,
            'El lugar o enlace no puede superar los 200 caracteres.'
        );
    }

    if (mb_strlen($obs) > 2000) {
        jsonError(
            'Observaciones demasiado largas',
            400,
            'Las observaciones no pueden superar los 2000 caracteres.'
        );
    }

    /*
     * Si la tutoría es virtual debe existir un enlace.
     * Si es presencial debe existir un lugar.
     */
    if ($modalidad === 'virtual' && $lugar === '') {
        jsonError(
            'Enlace requerido',
            400,
            'Para una tutoría virtual debes proporcionar el enlace de la sesión.'
        );
    }

    if ($modalidad === 'presencial' && $lugar === '') {
        jsonError(
            'Lugar requerido',
            400,
            'Para una tutoría presencial debes indicar el lugar de la sesión.'
        );
    }

    /*
     * =====================================================
     * VALIDAR ESTUDIANTE
     * =====================================================
     */

    $stmtEst = $pdo->prepare("
        SELECT id_estudiante, id_usuario
        FROM estudiantes
        WHERE id_estudiante = ?
        LIMIT 1
    ");

    $stmtEst->execute([$id_estudiante]);

    $estudiante = $stmtEst->fetch(PDO::FETCH_ASSOC);

    if (!$estudiante) {
        jsonError(
            'Estudiante inexistente',
            404,
            "El registro de estudiante #$id_estudiante no existe."
        );
    }

    /*
     * =====================================================
     * VALIDAR TUTOR
     * =====================================================
     */

    $stmtTut = $pdo->prepare("
        SELECT id_tutor
        FROM tutores
        WHERE id_tutor = ?
        LIMIT 1
    ");

    $stmtTut->execute([$id_tutor]);

    if (!$stmtTut->fetch()) {
        jsonError(
            'Tutor inexistente',
            404,
            "El tutor seleccionado con ID #$id_tutor no existe."
        );
    }

    /*
     * =====================================================
     * VALIDAR MATERIA
     * =====================================================
     */

    $stmtMat = $pdo->prepare("
        SELECT id_materia, nombre_materia, id_carrera
        FROM materias
        WHERE id_materia = ?
        LIMIT 1
    ");

    $stmtMat->execute([$id_materia]);

    $materia = $stmtMat->fetch(PDO::FETCH_ASSOC);

    if (!$materia) {
        jsonError(
            'Materia inexistente',
            404,
            'La materia seleccionada no existe.'
        );
    }

    /*
     * =====================================================
     * VALIDACIÓN CRÍTICA:
     * EL TUTOR DEBE IMPARTIR ESA MATERIA
     * =====================================================
     */

    if (!$model->tutorTieneMateria($id_tutor, $id_materia)) {

        jsonError(
            'Materia no asignada al tutor',
            400,
            'El docente seleccionado no tiene asignada la materia elegida.'
        );
    }

    /*
     * =====================================================
     * FECHA
     * =====================================================
     */

    if (
        $fecha === '' ||
        !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha)
    ) {
        jsonError(
            'Fecha inválida',
            400,
            'La fecha debe tener el formato AAAA-MM-DD.'
        );
    }

    $fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);

    if (
        !$fechaObj ||
        $fechaObj->format('Y-m-d') !== $fecha
    ) {
        jsonError(
            'Fecha inválida',
            400,
            'La fecha indicada no existe.'
        );
    }

    $hoy = date('Y-m-d');

    if ($fecha < $hoy) {
        jsonError(
            'Fecha en el pasado',
            400,
            'No es posible agendar tutorías en fechas anteriores al día de hoy.'
        );
    }

    /*
     * =====================================================
     * HORAS
     * =====================================================
     */

    if ($hora_inicio === '' || $hora_fin === '') {
        jsonError(
            'Horarios no proporcionados',
            400,
            'Debes indicar la hora de inicio y la hora de fin.'
        );
    }

    if (preg_match('/^\d{2}:\d{2}$/', $hora_inicio)) {
        $hora_inicio .= ':00';
    }

    if (preg_match('/^\d{2}:\d{2}$/', $hora_fin)) {
        $hora_fin .= ':00';
    }

    if (
        !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/', $hora_inicio) ||
        !preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/', $hora_fin)
    ) {
        jsonError(
            'Formato de hora incorrecto',
            400,
            'Las horas deben tener formato HH:MM.'
        );
    }

    $timeIni = strtotime("$fecha $hora_inicio");
    $timeFin = strtotime("$fecha $hora_fin");

    if ($timeIni === false || $timeFin === false) {
        jsonError(
            'Horario inválido',
            400,
            'No fue posible interpretar el horario indicado.'
        );
    }

    if ($timeIni >= $timeFin) {
        jsonError(
            'Rango de horario inválido',
            400,
            'La hora de inicio debe ser anterior a la hora de finalización.'
        );
    }

    if ($fecha === $hoy && $timeIni <= time()) {
        jsonError(
            'Horario en el pasado',
            400,
            'La hora de inicio seleccionada ya ha transcurrido.'
        );
    }

    $duracionMinutos = ($timeFin - $timeIni) / 60;

    if ($duracionMinutos < 30 || $duracionMinutos > 180) {
        jsonError(
            'Duración de tutoría inválida',
            400,
            'La sesión debe durar entre 30 minutos y 3 horas.'
        );
    }

    /*
     * =====================================================
     * DISPONIBILIDAD DEL TUTOR
     * =====================================================
     */

    $diaSemana = obtenerDiaSemanaEsp($fecha);

    if ($diaSemana === 'Domingo') {
        jsonError(
            'Día no laborable',
            400,
            'No se pueden agendar tutorías los domingos.'
        );
    }

    $stmtTieneDisp = $pdo->prepare("
        SELECT COUNT(*)
        FROM disponibilidad_tutor
        WHERE id_tutor = ?
    ");

    $stmtTieneDisp->execute([$id_tutor]);

    $totalDispTutor = (int) $stmtTieneDisp->fetchColumn();

    if ($totalDispTutor > 0) {

        $stmtDisp = $pdo->prepare("
            SELECT id_disponibilidad
            FROM disponibilidad_tutor
            WHERE id_tutor = ?
              AND dia_semana = ?
              AND hora_inicio <= ?
              AND hora_fin >= ?
            LIMIT 1
        ");

        $stmtDisp->execute([
            $id_tutor,
            $diaSemana,
            $hora_inicio,
            $hora_fin
        ]);

        if (!$stmtDisp->fetch()) {

            jsonError(
                'Tutor no disponible',
                409,
                "El tutor no tiene disponibilidad registrada el día $diaSemana para el horario solicitado."
            );
        }
    }

    /*
     * =====================================================
     * EVITAR CRUCE DE HORARIOS DEL TUTOR
     * =====================================================
     */

    $stmtChoque = $pdo->prepare("
        SELECT id_tutoria, hora_inicio, hora_fin, estado
        FROM tutorias
        WHERE id_tutor = ?
          AND fecha = ?
          AND estado IN ('pendiente', 'confirmada')
          AND NOT (
              hora_fin <= ?
              OR hora_inicio >= ?
          )
        LIMIT 1
    ");

    $stmtChoque->execute([
        $id_tutor,
        $fecha,
        $hora_inicio,
        $hora_fin
    ]);

    $choque = $stmtChoque->fetch(PDO::FETCH_ASSOC);

    if ($choque) {

        jsonError(
            'Conflicto de horario',
            409,
            "El tutor ya tiene una tutoría programada de {$choque['hora_inicio']} a {$choque['hora_fin']} para esa fecha."
        );
    }

    /*
     * =====================================================
     * EVITAR QUE EL ESTUDIANTE TENGA DOS TUTORÍAS
     * SIMULTÁNEAS
     * =====================================================
     */

    $stmtChoqueEst = $pdo->prepare("
        SELECT id_tutoria, hora_inicio, hora_fin
        FROM tutorias
        WHERE id_estudiante = ?
          AND fecha = ?
          AND estado IN ('pendiente', 'confirmada')
          AND NOT (
              hora_fin <= ?
              OR hora_inicio >= ?
          )
        LIMIT 1
    ");

    $stmtChoqueEst->execute([
        $id_estudiante,
        $fecha,
        $hora_inicio,
        $hora_fin
    ]);

    if ($stmtChoqueEst->fetch()) {

        jsonError(
            'Conflicto de horario del estudiante',
            409,
            'El estudiante ya tiene otra tutoría programada en ese horario.'
        );
    }

    /*
     * =====================================================
     * CREAR TUTORÍA
     * =====================================================
     */

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
            'estado'         => 'pendiente',
            'observaciones'  => $obs,
        ]);

        jsonSuccess(
            [
                'id_tutoria' => (int) $id_tutoria
            ],
            'Solicitud de tutoría agendada con éxito',
            201
        );

    } catch (Throwable $e) {

        jsonError(
            'Error al agendar tutoría',
            500,
            'No fue posible registrar la tutoría.'
        );
    }
}

/*
 * =========================================================
 * PUT - ACTUALIZAR ESTADO
 * =========================================================
 */

elseif ($method === 'PUT') {

    $usuarioAuth = requerirPermiso($pdo, 'editar_tutoria');

    $data = getJsonInput();

    $id_tutoria = isset($data['id_tutoria'])
        ? (int) $data['id_tutoria']
        : 0;

    $nuevo_estado = trim($data['estado'] ?? '');

    $lugar_o_enlace = trim(
        $data['lugar_o_enlace'] ?? ''
    );

    $observaciones = trim(
        $data['observaciones'] ?? ''
    );

    if ($id_tutoria <= 0 || $nuevo_estado === '') {
        jsonError(
            'Datos incompletos',
            400,
            'Debes indicar el ID de la tutoría y el nuevo estado.'
        );
    }

    $estadosValidos = [
        'pendiente',
        'confirmada',
        'realizada',
        'cancelada'
    ];

    if (!in_array($nuevo_estado, $estadosValidos, true)) {
        jsonError(
            'Estado no válido',
            400,
            'El estado debe ser pendiente, confirmada, realizada o cancelada.'
        );
    }

    if (mb_strlen($lugar_o_enlace) > 200) {
        jsonError(
            'Lugar o enlace demasiado largo',
            400,
            'El lugar o enlace no puede superar los 200 caracteres.'
        );
    }

    if (mb_strlen($observaciones) > 2000) {
        jsonError(
            'Observaciones demasiado largas',
            400,
            'Las observaciones no pueden superar los 2000 caracteres.'
        );
    }

    $tutoria = $model->obtenerPorId($id_tutoria);

    if (!$tutoria) {
        jsonError(
            'Tutoría no encontrada',
            404,
            "No existe ninguna tutoría registrada con ID #$id_tutoria."
        );
    }

    $rol = strtolower($usuarioAuth['rol'] ?? '');

    /*
     * =====================================================
     * ADMINISTRADOR
     * =====================================================
     */

    if ($rol === 'administrador') {

        /*
         * Puede gestionar la tutoría.
         */
    }

    /*
     * =====================================================
     * TUTOR
     * =====================================================
     */

    elseif ($rol === 'tutor') {

        if (
            empty($usuarioAuth['id_tutor']) ||
            (int)$usuarioAuth['id_tutor'] !== (int)$tutoria['id_tutor']
        ) {
            jsonError(
                'Acceso denegado',
                403,
                'Solo puedes gestionar las tutorías asignadas a tu cuenta.'
            );
        }

        /*
         * Un tutor puede confirmar, realizar o cancelar.
         * No puede devolver una tutoría a pendiente.
         */
        if ($nuevo_estado === 'pendiente') {
            jsonError(
                'Transición no permitida',
                403,
                'Un tutor no puede devolver una tutoría al estado pendiente.'
            );
        }
    }

    /*
     * =====================================================
     * ESTUDIANTE
     * =====================================================
     */

    elseif ($rol === 'estudiante') {

        if (
            empty($usuarioAuth['id_estudiante']) ||
            (int)$usuarioAuth['id_estudiante'] !== (int)$tutoria['id_estudiante']
        ) {
            jsonError(
                'Acceso denegado',
                403,
                'Solo puedes gestionar tus propias tutorías.'
            );
        }

        /*
         * El estudiante únicamente puede cancelar.
         */
        if ($nuevo_estado !== 'cancelada') {
            jsonError(
                'Acción no permitida',
                403,
                'Los estudiantes solamente pueden cancelar sus propias tutorías.'
            );
        }

        if (
            in_array(
                $tutoria['estado'],
                ['realizada', 'cancelada'],
                true
            )
        ) {
            jsonError(
                'Tutoría no modificable',
                400,
                'La tutoría ya fue completada o cancelada.'
            );
        }
    }

    else {

        jsonError(
            'Rol no autorizado',
            403,
            'El rol del usuario no está autorizado para gestionar tutorías.'
        );
    }

    /*
     * =====================================================
     * VALIDAR TRANSICIONES DE ESTADO
     * =====================================================
     */

    $estadoActual = $tutoria['estado'];

    if ($estadoActual === 'realizada' && $nuevo_estado !== 'realizada') {

        jsonError(
            'Tutoría finalizada',
            400,
            'Una tutoría realizada no puede cambiar nuevamente de estado.'
        );
    }

    if ($estadoActual === 'cancelada' && $nuevo_estado !== 'cancelada') {

        jsonError(
            'Tutoría cancelada',
            400,
            'Una tutoría cancelada no puede reactivarse.'
        );
    }

    if (
        $estadoActual === 'pendiente' &&
        $nuevo_estado === 'realizada' &&
        $rol !== 'administrador'
    ) {
        jsonError(
            'Transición no permitida',
            400,
            'Una tutoría pendiente primero debe ser confirmada antes de marcarse como realizada.'
        );
    }

    /*
     * =====================================================
     * ACTUALIZAR
     * =====================================================
     */

    try {

        $model->actualizarEstado(
            $id_tutoria,
            $nuevo_estado,
            $lugar_o_enlace !== ''
                ? $lugar_o_enlace
                : $tutoria['lugar_o_enlace'],
            $observaciones !== ''
                ? $observaciones
                : $tutoria['observaciones']
        );

        jsonSuccess(
            [
                'id_tutoria' => $id_tutoria,
                'estado' => $nuevo_estado
            ],
            "Tutoría actualizada correctamente a estado: '$nuevo_estado'"
        );

    } catch (Throwable $e) {

        jsonError(
            'Error al actualizar tutoría',
            500,
            'No fue posible actualizar la tutoría.'
        );
    }
}

else {

    jsonError(
        'Método no permitido',
        405,
        'Solo se admiten solicitudes GET, POST y PUT en esta ruta.'
    );
}