<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutorModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutorModel($pdo);

/*
 * =========================================================
 * GET - LISTAR TUTORES
 * =========================================================
 */

if ($method === 'GET') {

    $usuarioAuth = requerirPermiso($pdo, 'listar_tutor');

    /*
     * El administrador puede consultar todo el directorio.
     * El tutor también puede consultar el directorio si posee
     * el permiso correspondiente.
     */
    $tutores = $model->obtenerTodos();

    jsonSuccess(
        $tutores,
        'Directorio de tutores obtenido exitosamente'
    );
}

/*
 * =========================================================
 * PUT - ACTUALIZAR TUTOR
 * =========================================================
 */

elseif ($method === 'PUT') {

    $usuarioAuth = requerirPermiso(
        $pdo,
        'editar_tutor'
    );

    $data = getJsonInput();

    $id_tutor = isset($data['id_tutor'])
        ? (int) $data['id_tutor']
        : 0;

    if ($id_tutor <= 0) {
        jsonError(
            'ID de tutor inválido',
            400,
            'Debes enviar un identificador numérico de tutor válido.'
        );
    }

    /*
     * =====================================================
     * VALIDAR EXISTENCIA DEL TUTOR
     * =====================================================
     */

    $tutorExistente = $model->obtenerPorId($id_tutor);

    if (!$tutorExistente) {
        jsonError(
            'Tutor no encontrado',
            404,
            "No existe ningún tutor registrado con ID #$id_tutor."
        );
    }

    /*
     * =====================================================
     * RESTRICCIÓN POR ROL
     * =====================================================
     *
     * Un tutor solamente puede modificar su propio perfil.
     * El administrador puede modificar cualquier tutor.
     */

    if ($usuarioAuth['rol'] === 'tutor') {

        if (
            empty($usuarioAuth['id_tutor']) ||
            (int) $usuarioAuth['id_tutor'] !== $id_tutor
        ) {
            jsonError(
                'Acceso denegado',
                403,
                'Solo puedes actualizar tu propio perfil docente.'
            );
        }
    }

    /*
     * =====================================================
     * ESPECIALIDAD
     * =====================================================
     */

    $especialidad = trim(
        $data['especialidad'] ?? ''
    );

    if ($especialidad === '') {
        jsonError(
            'Especialidad obligatoria',
            400,
            'Debes indicar la especialidad del tutor.'
        );
    }

    if (mb_strlen($especialidad) < 3) {
        jsonError(
            'Especialidad demasiado corta',
            400,
            'La especialidad debe tener al menos 3 caracteres.'
        );
    }

    if (mb_strlen($especialidad) > 150) {
        jsonError(
            'Especialidad demasiado larga',
            400,
            'La especialidad no puede superar los 150 caracteres.'
        );
    }

    /*
     * =====================================================
     * BIOGRAFÍA
     * =====================================================
     */

    $biografia = trim(
        $data['biografia'] ?? ''
    );

    if (mb_strlen($biografia) > 1000) {
        jsonError(
            'Biografía demasiado extensa',
            400,
            'La biografía no puede superar los 1000 caracteres.'
        );
    }

    /*
     * =====================================================
     * MATERIAS
     * =====================================================
     */

    $materias_ids = $data['materias_ids'] ?? [];

    if (!is_array($materias_ids)) {
        jsonError(
            'Materias inválidas',
            400,
            'Las materias deben enviarse como una lista de identificadores.'
        );
    }

    /*
     * Convertir IDs a enteros y eliminar duplicados.
     */
    $materiasNormalizadas = [];

    foreach ($materias_ids as $materiaId) {

        if (
            !is_int($materiaId) &&
            !is_numeric($materiaId)
        ) {
            jsonError(
                'ID de materia inválido',
                400,
                'Todos los identificadores de materia deben ser numéricos.'
            );
        }

        $materiaId = (int) $materiaId;

        if ($materiaId <= 0) {
            jsonError(
                'ID de materia inválido',
                400,
                'Los identificadores de materia deben ser mayores que cero.'
            );
        }

        $materiasNormalizadas[] = $materiaId;
    }

    $materiasNormalizadas = array_values(
        array_unique($materiasNormalizadas)
    );

    /*
     * Verificar que todas las materias existan.
     */
    if (!empty($materiasNormalizadas)) {

        $placeholders = implode(
            ',',
            array_fill(
                0,
                count($materiasNormalizadas),
                '?'
            )
        );

        $stmtMaterias = $pdo->prepare("
            SELECT id_materia
            FROM materias
            WHERE id_materia IN ($placeholders)
        ");

        $stmtMaterias->execute(
            $materiasNormalizadas
        );

        $materiasExistentes = array_map(
            'intval',
            $stmtMaterias->fetchAll(
                PDO::FETCH_COLUMN
            )
        );

        $materiasNoExistentes = array_diff(
            $materiasNormalizadas,
            $materiasExistentes
        );

        if (!empty($materiasNoExistentes)) {

            jsonError(
                'Materia inexistente',
                404,
                'Una o más materias seleccionadas no existen en la base de datos.',
                [
                    'materias_invalidas' => array_values(
                        $materiasNoExistentes
                    )
                ]
            );
        }
    }

    /*
     * =====================================================
     * ACTUALIZAR
     * =====================================================
     */

    try {

        $model->actualizar(
            $id_tutor,
            [
                'especialidad' => $especialidad,
                'biografia' => $biografia,
                'materias_ids' => $materiasNormalizadas
            ]
        );

        jsonSuccess(
            [
                'id_tutor' => $id_tutor,
                'especialidad' => $especialidad,
                'materias_ids' => $materiasNormalizadas
            ],
            'Perfil y asignaturas del tutor actualizados correctamente'
        );

    } catch (PDOException $e) {

        jsonError(
            'Error al actualizar perfil de tutor',
            500,
            'No fue posible actualizar el perfil del tutor.'
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
        'Solo se admiten solicitudes GET y PUT en esta ruta.'
    );
}