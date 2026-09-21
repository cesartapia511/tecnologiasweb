<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EvaluacionModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EvaluacionModel($pdo);

/*
 * =========================================================
 * GET - LISTAR EVALUACIONES
 * =========================================================
 */

if ($method === 'GET') {

    $usuarioAuth = requerirPermiso($pdo, 'listar_evaluacion');

    $id_tutor = isset($_GET['id_tutor'])
        ? (int) $_GET['id_tutor']
        : null;

    /*
     * El tutor solamente puede consultar sus propias
     * evaluaciones.
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

    /*
     * El estudiante no puede utilizar id_tutor para consultar
     * información ajena.
     *
     * Las evaluaciones que puede consultar se limitan a sus
     * propias tutorías mediante una consulta específica.
     */
    if ($usuarioAuth['rol'] === 'estudiante') {

        if (empty($usuarioAuth['id_estudiante'])) {
            jsonError(
                'Perfil de estudiante no encontrado',
                403,
                'El usuario no tiene un perfil de estudiante asociado.'
            );
        }

        $stmt = $pdo->prepare("
            SELECT
                ev.id_evaluacion,
                ev.id_tutoria,
                ev.calificacion,
                ev.comentario,
                ev.fecha_evaluacion,
                tu.fecha,
                tu.hora_inicio,
                m.nombre_materia,
                ut.nombre AS tutor_nombre,
                ut.apellido AS tutor_apellido
            FROM evaluaciones_tutoria ev
            INNER JOIN tutorias tu
                ON ev.id_tutoria = tu.id_tutoria
            INNER JOIN materias m
                ON tu.id_materia = m.id_materia
            INNER JOIN tutores t
                ON tu.id_tutor = t.id_tutor
            INNER JOIN usuarios ut
                ON t.id_usuario = ut.id_usuario
            WHERE tu.id_estudiante = ?
            ORDER BY ev.fecha_evaluacion DESC
        ");

        $stmt->execute([
            (int) $usuarioAuth['id_estudiante']
        ]);

        jsonSuccess(
            $stmt->fetchAll(PDO::FETCH_ASSOC),
            'Evaluaciones obtenidas correctamente'
        );
    }

    /*
     * Administrador o tutor.
     */
    $evaluaciones = $model->obtenerTodas($id_tutor);

    jsonSuccess(
        $evaluaciones,
        'Evaluaciones obtenidas correctamente'
    );
}

/*
 * =========================================================
 * POST - CREAR EVALUACIÓN
 * =========================================================
 */

elseif ($method === 'POST') {

    $usuarioAuth = requerirPermiso($pdo, 'crear_evaluacion');

    /*
     * Solamente los estudiantes pueden registrar evaluaciones.
     */
    if ($usuarioAuth['rol'] !== 'estudiante') {
        jsonError(
            'Operación no permitida',
            403,
            'Las evaluaciones solamente pueden ser registradas por estudiantes.'
        );
    }

    if (empty($usuarioAuth['id_estudiante'])) {
        jsonError(
            'Perfil de estudiante no encontrado',
            403,
            'El usuario no tiene un perfil de estudiante asociado.'
        );
    }

    $data = getJsonInput();

    $id_tutoria = isset($data['id_tutoria'])
        ? (int) $data['id_tutoria']
        : 0;

    $calificacion = isset($data['calificacion'])
        ? (int) $data['calificacion']
        : 0;

    $comentario = trim(
        $data['comentario'] ?? ''
    );

    /*
     * =====================================================
     * VALIDACIONES
     * =====================================================
     */

    if ($id_tutoria <= 0) {
        jsonError(
            'ID de tutoría obligatorio',
            400,
            'Debes indicar la tutoría que deseas evaluar.'
        );
    }

    if ($calificacion < 1 || $calificacion > 5) {
        jsonError(
            'Calificación fuera de rango',
            400,
            'La calificación debe ser un valor entero entre 1 y 5.'
        );
    }

    if (mb_strlen($comentario) > 1000) {
        jsonError(
            'Comentario demasiado extenso',
            400,
            'El comentario no puede exceder los 1000 caracteres.'
        );
    }

    /*
     * =====================================================
     * OBTENER TUTORÍA
     * =====================================================
     */

    $tutoriaModel = new TutoriaModel($pdo);

    $tutoria = $tutoriaModel->obtenerPorId(
        $id_tutoria
    );

    if (!$tutoria) {
        jsonError(
            'Tutoría no encontrada',
            404,
            "No existe ninguna tutoría registrada con ID #$id_tutoria."
        );
    }

    /*
     * =====================================================
     * SEGURIDAD:
     * LA TUTORÍA DEBE PERTENECER AL ESTUDIANTE AUTENTICADO
     * =====================================================
     */

    if (
        (int) $tutoria['id_estudiante'] !==
        (int) $usuarioAuth['id_estudiante']
    ) {
        jsonError(
            'Acceso denegado',
            403,
            'Solo puedes evaluar las tutorías que pertenecen a tu cuenta.'
        );
    }

    /*
     * =====================================================
     * SOLO TUTORÍAS REALIZADAS
     * =====================================================
     */

    if ($tutoria['estado'] !== 'realizada') {
        jsonError(
            'Tutoría no finalizada',
            400,
            "Solo puedes evaluar sesiones que ya hayan sido concluidas y marcadas como 'realizada'."
        );
    }

    /*
     * =====================================================
     * EVITAR EVALUACIONES DUPLICADAS
     * =====================================================
     */

    $stmtCheck = $pdo->prepare("
        SELECT id_evaluacion
        FROM evaluaciones_tutoria
        WHERE id_tutoria = ?
        LIMIT 1
    ");

    $stmtCheck->execute([
        $id_tutoria
    ]);

    if ($stmtCheck->fetch()) {
        jsonError(
            'Evaluación duplicada',
            409,
            'Esta tutoría ya ha sido evaluada previamente.'
        );
    }

    /*
     * =====================================================
     * CREAR EVALUACIÓN
     * =====================================================
     */

    try {

        $id_eval = $model->crear([
            'id_tutoria'   => $id_tutoria,
            'calificacion' => $calificacion,
            'comentario'   => $comentario,
        ]);

        jsonSuccess(
            [
                'id_evaluacion' => (int) $id_eval,
                'id_tutoria' => $id_tutoria,
                'calificacion' => $calificacion
            ],
            'Evaluación registrada exitosamente',
            201
        );

    } catch (PDOException $e) {

        /*
         * La restricción UNIQUE de la BD también protege
         * contra evaluaciones duplicadas.
         */
        if ((string) $e->getCode() === '23000') {

            jsonError(
                'Evaluación duplicada',
                409,
                'Esta tutoría ya tiene una evaluación registrada.'
            );
        }

        jsonError(
            'Error al guardar evaluación',
            500,
            'No fue posible registrar la evaluación.'
        );
    }
}

/*
 * =========================================================
 * OTROS MÉTODOS
 * =========================================================
 */

else {

    jsonError(
        'Método no permitido',
        405,
        'Solo se admiten solicitudes GET y POST en esta ruta.'
    );
}