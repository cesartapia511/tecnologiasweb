<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/PeriodoInscripcion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonError(
        'MÃ©todo no permitido',
        405,
        'Este endpoint Ãºnicamente acepta solicitudes POST.'
    );
}

$usuarioAuth = requerirPermiso($pdo, 'crear_tutoria');

if (
    empty($usuarioAuth['id_estudiante']) ||
    $usuarioAuth['rol'] !== 'estudiante'
) {
    jsonError(
        'Perfil de estudiante requerido',
        403,
        'Solo un usuario con perfil de estudiante puede inscribirse en una tutorÃ­a.'
    );
}

$data = getJsonInput();

$id_tutoria = isset($data['id_tutoria'])
    ? (int) $data['id_tutoria']
    : 0;

if ($id_tutoria <= 0) {
    jsonError(
        'TutorÃ­a no especificada',
        400,
        'Debes indicar una tutorÃ­a vÃ¡lida.'
    );
}

$id_estudiante = (int) $usuarioAuth['id_estudiante'];

try {

    $periodoModel = new PeriodoInscripcion();
    $periodoActivo = $periodoModel->obtenerPeriodoActivo();

    if (!$periodoActivo) {
        jsonError(
            'Periodo de inscripciÃ³n cerrado',
            400,
            'El periodo de inscripciÃ³n no estÃ¡ habilitado.'
        );
    }

    $pdo->beginTransaction();

    $stmtTutoria = $pdo->prepare("
        SELECT
            id_tutoria,
            id_estudiante,
            id_tutor,
            id_materia,
            cupo_maximo,
            estado
        FROM tutorias
        WHERE id_tutoria = ?
        LIMIT 1
        FOR UPDATE
    ");

    $stmtTutoria->execute([$id_tutoria]);

    $tutoria = $stmtTutoria->fetch(PDO::FETCH_ASSOC);

    if (!$tutoria) {
        $pdo->rollBack();

        jsonError(
            'TutorÃ­a no encontrada',
            404,
            "No existe una tutorÃ­a con ID #$id_tutoria."
        );
    }

    if (in_array($tutoria['estado'], ['realizada', 'cancelada'], true)) {
        $pdo->rollBack();

        jsonError(
            'TutorÃ­a no disponible',
            400,
            'No es posible inscribirse en una tutorÃ­a realizada o cancelada.'
        );
    }

    $stmtExiste = $pdo->prepare("
        SELECT estado_asignacion
        FROM tutoria_estudiante
        WHERE id_tutoria = ?
          AND id_estudiante = ?
        LIMIT 1
        FOR UPDATE
    ");

    $stmtExiste->execute([
        $id_tutoria,
        $id_estudiante
    ]);

    $asignacionExistente = $stmtExiste->fetch(PDO::FETCH_ASSOC);

    if (
        $asignacionExistente &&
        $asignacionExistente['estado_asignacion'] === 'inscrito'
    ) {
        $pdo->rollBack();

        jsonError(
            'Estudiante ya inscrito',
            409,
            'El estudiante ya se encuentra inscrito en esta tutorÃ­a.'
        );
    }

    $stmtCupos = $pdo->prepare("
        SELECT COUNT(*)
        FROM tutoria_estudiante
        WHERE id_tutoria = ?
          AND estado_asignacion = 'inscrito'
    ");

    $stmtCupos->execute([$id_tutoria]);

    $ocupados = (int) $stmtCupos->fetchColumn();
    $cupoMaximo = (int) $tutoria['cupo_maximo'];

    if ($ocupados >= $cupoMaximo) {
        $pdo->rollBack();

        jsonError(
            'No hay cupos disponibles',
            400,
            'No hay cupos disponibles para esta tutorÃ­a.'
        );
    }

    if (
        $asignacionExistente &&
        $asignacionExistente['estado_asignacion'] === 'cancelado'
    ) {
        $stmtInscripcion = $pdo->prepare("
            UPDATE tutoria_estudiante
            SET estado_asignacion = 'inscrito',
                fecha_asignacion = CURRENT_TIMESTAMP
            WHERE id_tutoria = ?
              AND id_estudiante = ?
        ");

        $stmtInscripcion->execute([
            $id_tutoria,
            $id_estudiante
        ]);
    } else {
        $stmtInscripcion = $pdo->prepare("
            INSERT INTO tutoria_estudiante
            (
                id_tutoria,
                id_estudiante,
                fecha_asignacion,
                estado_asignacion
            )
            VALUES
            (?, ?, CURRENT_TIMESTAMP, 'inscrito')
        ");

        $stmtInscripcion->execute([
            $id_tutoria,
            $id_estudiante
        ]);
    }

    $pdo->commit();

    jsonSuccess(
        [
            'id_tutoria' => $id_tutoria,
            'id_estudiante' => $id_estudiante,
            'cupos_ocupados' => $ocupados + 1,
            'cupos_disponibles' => $cupoMaximo - ($ocupados + 1)
        ],
        'InscripciÃ³n realizada correctamente',
        201
    );

} catch (Throwable $e) {

    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    error_log(
        'Error al inscribir estudiante en tutorÃ­a: ' .
        $e->getMessage()
    );

    jsonError(
        'Error al realizar la inscripciÃ³n',
        500,
        'No fue posible completar la inscripciÃ³n.'
    );
}
