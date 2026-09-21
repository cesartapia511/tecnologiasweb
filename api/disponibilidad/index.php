<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/DisponibilidadModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new DisponibilidadModel($pdo);

/*
 * =========================================================
 * GET - LISTAR DISPONIBILIDADES
 * =========================================================
 */

if ($method === 'GET') {

    $usuarioAuth = requerirPermiso($pdo, 'listar_disponibilidad');

    $id_tutor = isset($_GET['id_tutor'])
        ? (int) $_GET['id_tutor']
        : null;

    /*
     * Un tutor únicamente puede consultar
     * sus propios horarios.
     */
    if ($usuarioAuth['rol'] === 'tutor') {

        if (empty($usuarioAuth['id_tutor'])) {
            jsonError(
                'Perfil de tutor no encontrado',
                403,
                'El usuario no tiene un perfil de tutor asociado.'
            );
        }

        $id_tutor = (int) $usuarioAuth['id_tutor'];
    }

    if ($id_tutor !== null && $id_tutor <= 0) {
        jsonError(
            'ID de tutor inválido',
            400,
            'El identificador del tutor debe ser válido.'
        );
    }

    if ($id_tutor !== null) {

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
                "No existe ningún tutor registrado con ID #$id_tutor."
            );
        }

        $list = $model->obtenerPorTutor($id_tutor);

    } else {

        $list = $model->obtenerTodas();
    }

    jsonSuccess(
        $list,
        'Horarios de disponibilidad obtenidos correctamente'
    );
}

/*
 * =========================================================
 * POST - CREAR DISPONIBILIDAD
 * =========================================================
 */

elseif ($method === 'POST') {

    $usuarioAuth = requerirPermiso($pdo, 'crear_disponibilidad');

    $data = getJsonInput();

    $id_tutor = isset($data['id_tutor'])
        ? (int) $data['id_tutor']
        : 0;

    /*
     * Si es tutor, SIEMPRE se utiliza su propio ID.
     */
    if ($usuarioAuth['rol'] === 'tutor') {

        if (empty($usuarioAuth['id_tutor'])) {
            jsonError(
                'Perfil de tutor no encontrado',
                403,
                'El usuario no tiene un perfil de tutor asociado.'
            );
        }

        $id_tutor = (int) $usuarioAuth['id_tutor'];
    }

    if ($id_tutor <= 0) {
        jsonError(
            'ID de tutor inválido',
            400,
            'Debes asociar el horario a un tutor válido.'
        );
    }

    /*
     * Verificar existencia del tutor.
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
            "No existe ningún tutor registrado con ID #$id_tutor."
        );
    }

    $dia_semana = trim(
        $data['dia_semana'] ?? ''
    );

    $hora_inicio = trim(
        $data['hora_inicio'] ?? ''
    );

    $hora_fin = trim(
        $data['hora_fin'] ?? ''
    );

    /*
     * =====================================================
     * VALIDAR DÍA
     * =====================================================
     */

    $diasValidos = [
        'Lunes',
        'Martes',
        'Miercoles',
        'Jueves',
        'Viernes',
        'Sabado'
    ];

    if (!in_array($dia_semana, $diasValidos, true)) {
        jsonError(
            'Día de la semana inválido',
            400,
            'El día debe ser uno de: ' .
            implode(', ', $diasValidos) .
            '.'
        );
    }

    /*
     * =====================================================
     * VALIDAR HORAS
     * =====================================================
     */

    if ($hora_inicio === '' || $hora_fin === '') {
        jsonError(
            'Horarios requeridos',
            400,
            'Debes especificar la hora de inicio y la hora de fin.'
        );
    }

    /*
     * Aceptar HH:MM o HH:MM:SS.
     */
    if (preg_match('/^\d{2}:\d{2}$/', $hora_inicio)) {
        $hora_inicio .= ':00';
    }

    if (preg_match('/^\d{2}:\d{2}$/', $hora_fin)) {
        $hora_fin .= ':00';
    }

    /*
     * Formato estricto HH:MM:SS.
     */
    $regexHora = '/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/';

    if (
        !preg_match($regexHora, $hora_inicio) ||
        !preg_match($regexHora, $hora_fin)
    ) {
        jsonError(
            'Formato de hora inválido',
            400,
            'Las horas deben tener formato HH:MM o HH:MM:SS.'
        );
    }

    /*
     * Convertir a segundos para comparar correctamente.
     */
    [$h1, $m1, $s1] = array_map(
        'intval',
        explode(':', $hora_inicio)
    );

    [$h2, $m2, $s2] = array_map(
        'intval',
        explode(':', $hora_fin)
    );

    $inicioSegundos =
        ($h1 * 3600) +
        ($m1 * 60) +
        $s1;

    $finSegundos =
        ($h2 * 3600) +
        ($m2 * 60) +
        $s2;

    if ($inicioSegundos >= $finSegundos) {
        jsonError(
            'Rango de horario inconsistente',
            400,
            'La hora de inicio debe ser anterior a la hora de fin.'
        );
    }

    /*
     * Mínimo 30 minutos.
     */
    $duracion = $finSegundos - $inicioSegundos;

    if ($duracion < 1800) {
        jsonError(
            'Duración insuficiente',
            400,
            'La disponibilidad debe durar al menos 30 minutos.'
        );
    }

    /*
     * Máximo 3 horas por bloque.
     */
    if ($duracion > 10800) {
        jsonError(
            'Duración excesiva',
            400,
            'Cada bloque de disponibilidad puede durar como máximo 3 horas.'
        );
    }

    /*
     * =====================================================
     * EVITAR SOLAPAMIENTOS
     * =====================================================
     */

    $stmtOverlap = $pdo->prepare("
        SELECT
            id_disponibilidad,
            hora_inicio,
            hora_fin
        FROM disponibilidad_tutor
        WHERE id_tutor = ?
          AND dia_semana = ?
          AND NOT (
              hora_fin <= ?
              OR hora_inicio >= ?
          )
        LIMIT 1
    ");

    $stmtOverlap->execute([
        $id_tutor,
        $dia_semana,
        $hora_inicio,
        $hora_fin
    ]);

    $overlap = $stmtOverlap->fetch(PDO::FETCH_ASSOC);

    if ($overlap) {

        jsonError(
            'Solapamiento de horarios detectado',
            409,
            "El horario solicitado ($hora_inicio a $hora_fin) se solapa con el bloque existente ({$overlap['hora_inicio']} a {$overlap['hora_fin']}) del día $dia_semana."
        );
    }

    /*
     * =====================================================
     * CREAR
     * =====================================================
     */

    try {

        $id_disp = $model->crear([
            'id_tutor' => $id_tutor,
            'dia_semana' => $dia_semana,
            'hora_inicio' => $hora_inicio,
            'hora_fin' => $hora_fin
        ]);

        jsonSuccess(
            [
                'id_disponibilidad' => (int) $id_disp
            ],
            'Horario de disponibilidad registrado con éxito',
            201
        );

    } catch (PDOException $e) {

        jsonError(
            'Error al guardar disponibilidad',
            500,
            'No fue posible registrar el horario de disponibilidad.'
        );
    }
}

/*
 * =========================================================
 * DELETE - ELIMINAR DISPONIBILIDAD
 * =========================================================
 */

elseif ($method === 'DELETE') {

    $usuarioAuth = requerirPermiso(
        $pdo,
        'eliminar_disponibilidad'
    );

    $id = isset($_GET['id'])
        ? (int) $_GET['id']
        : 0;

    if ($id <= 0) {
        jsonError(
            'ID de disponibilidad requerido',
            400,
            'Debes enviar un identificador válido.'
        );
    }

    /*
     * Obtener disponibilidad.
     */
    $stmtDisp = $pdo->prepare("
        SELECT
            id_disponibilidad,
            id_tutor,
            dia_semana,
            hora_inicio,
            hora_fin
        FROM disponibilidad_tutor
        WHERE id_disponibilidad = ?
        LIMIT 1
    ");

    $stmtDisp->execute([$id]);

    $disp = $stmtDisp->fetch(PDO::FETCH_ASSOC);

    if (!$disp) {
        jsonError(
            'Horario no encontrado',
            404,
            "No existe el registro de disponibilidad con ID #$id."
        );
    }

    /*
     * Un tutor únicamente puede eliminar
     * sus propios horarios.
     */
    if ($usuarioAuth['rol'] === 'tutor') {

        if (
            empty($usuarioAuth['id_tutor']) ||
            (int) $usuarioAuth['id_tutor'] !==
            (int) $disp['id_tutor']
        ) {
            jsonError(
                'Acceso denegado',
                403,
                'Solo puedes eliminar tus propios horarios de disponibilidad.'
            );
        }
    }

    try {

        $model->eliminar($id);

        jsonSuccess(
            [
                'id_disponibilidad' => $id
            ],
            'Horario eliminado con éxito'
        );

    } catch (PDOException $e) {

        jsonError(
            'Error al eliminar disponibilidad',
            500,
            'No fue posible eliminar el horario de disponibilidad.'
        );
    }
}

/*
 * =========================================================
 * MÉTODO NO PERMITIDO
 * =========================================================
 */

else {

    jsonError(
        'Método no permitido',
        405,
        'Solo se admiten solicitudes GET, POST y DELETE en esta ruta.'
    );
}