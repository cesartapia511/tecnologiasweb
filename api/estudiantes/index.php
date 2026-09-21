<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EstudianteModel($pdo);

/*
 * =========================================================
 * GET - CONSULTAR ESTUDIANTES
 * =========================================================
 */

if ($method === 'GET') {

    $usuarioAuth = requerirPermiso(
        $pdo,
        'listar_estudiante'
    );

    $id_usuario = isset($_GET['id_usuario'])
        ? (int) $_GET['id_usuario']
        : null;

    /*
     * Un estudiante únicamente puede consultar
     * su propia información.
     */
    if ($usuarioAuth['rol'] === 'estudiante') {

        if (empty($usuarioAuth['id_estudiante'])) {
            jsonError(
                'Perfil de estudiante no encontrado',
                403,
                'El usuario no tiene un perfil de estudiante asociado.'
            );
        }

        $estudiante = $model->obtenerPorId(
            (int) $usuarioAuth['id_estudiante']
        );

        if (!$estudiante) {
            jsonError(
                'Estudiante no encontrado',
                404,
                'No existe el perfil académico asociado a tu cuenta.'
            );
        }

        jsonSuccess(
            $estudiante,
            'Datos de estudiante obtenidos correctamente'
        );
    }

    /*
     * Administrador puede consultar un estudiante específico
     * mediante id_usuario.
     */
    if ($id_usuario !== null) {

        if ($id_usuario <= 0) {
            jsonError(
                'ID de usuario inválido',
                400,
                'El identificador del usuario debe ser válido.'
            );
        }

        $estudiante = $model->obtenerPorUsuario(
            $id_usuario
        );

        if (!$estudiante) {
            jsonError(
                'Estudiante no encontrado',
                404,
                "No existe registro de estudiante para el usuario #$id_usuario."
            );
        }

        jsonSuccess(
            $estudiante,
            'Datos de estudiante obtenidos correctamente'
        );
    }

    /*
     * Administrador puede consultar el padrón completo.
     */
    $estudiantes = $model->obtenerTodos();

    jsonSuccess(
        $estudiantes,
        'Padrón de estudiantes obtenido exitosamente'
    );
}

/*
 * =========================================================
 * PUT - ACTUALIZAR ESTUDIANTE
 * =========================================================
 */

elseif ($method === 'PUT') {

    $usuarioAuth = requerirPermiso(
        $pdo,
        'editar_estudiante'
    );

    $data = getJsonInput();

    $id_estudiante = isset($data['id_estudiante'])
        ? (int) $data['id_estudiante']
        : 0;

    if ($id_estudiante <= 0) {
        jsonError(
            'ID de estudiante inválido',
            400,
            'Debes enviar un identificador numérico de estudiante válido.'
        );
    }

    /*
     * =====================================================
     * VERIFICAR EXISTENCIA
     * =====================================================
     */

    $estudianteExistente = $model->obtenerPorId(
        $id_estudiante
    );

    if (!$estudianteExistente) {
        jsonError(
            'Estudiante no encontrado',
            404,
            "No existe ningún estudiante registrado con ID #$id_estudiante."
        );
    }

    /*
     * =====================================================
     * RESTRICCIÓN POR ROL
     * =====================================================
     *
     * Un estudiante solamente puede modificar
     * su propio perfil.
     */

    if ($usuarioAuth['rol'] === 'estudiante') {

        if (
            empty($usuarioAuth['id_estudiante']) ||
            (int) $usuarioAuth['id_estudiante'] !==
            $id_estudiante
        ) {
            jsonError(
                'Acceso denegado',
                403,
                'Solo puedes actualizar tu propio perfil estudiantil.'
            );
        }
    }

    /*
     * =====================================================
     * CARRERA
     * =====================================================
     */

    $id_carrera = isset($data['id_carrera'])
        ? (int) $data['id_carrera']
        : (int) $estudianteExistente['id_carrera'];

    if ($id_carrera <= 0) {
        jsonError(
            'Carrera inválida',
            400,
            'Debes seleccionar una carrera válida.'
        );
    }

    $stmtCarrera = $pdo->prepare("
        SELECT id_carrera
        FROM carreras
        WHERE id_carrera = ?
        LIMIT 1
    ");

    $stmtCarrera->execute([
        $id_carrera
    ]);

    if (!$stmtCarrera->fetch()) {
        jsonError(
            'Carrera inexistente',
            404,
            "La carrera seleccionada con ID #$id_carrera no existe."
        );
    }

    /*
     * =====================================================
     * SEMESTRE
     * =====================================================
     */

    $semestre = isset($data['semestre'])
        ? (int) $data['semestre']
        : (int) $estudianteExistente['semestre'];

    if ($semestre < 1 || $semestre > 12) {
        jsonError(
            'Semestre inválido',
            400,
            'El semestre académico debe estar comprendido entre 1 y 12.'
        );
    }

    /*
     * =====================================================
     * REGISTRO UNIVERSITARIO
     * =====================================================
     */

    $ru = array_key_exists(
        'registro_universitario',
        $data
    )
        ? trim((string) $data['registro_universitario'])
        : trim((string) $estudianteExistente['registro_universitario']);

    if ($ru === '') {
        jsonError(
            'Registro Universitario obligatorio',
            400,
            'Debes proporcionar el Registro Universitario (RU).'
        );
    }

    if (mb_strlen($ru) > 30) {
        jsonError(
            'Registro Universitario demasiado largo',
            400,
            'El Registro Universitario no puede superar los 30 caracteres.'
        );
    }

    /*
     * Formato permitido:
     * letras, números, guiones y espacios.
     */
    if (!preg_match('/^[A-Za-z0-9ÁÉÍÓÚáéíóúÑñÜü\-\s]+$/u', $ru)) {
        jsonError(
            'Registro Universitario inválido',
            400,
            'El RU solamente puede contener letras, números, espacios y guiones.'
        );
    }

    /*
     * =====================================================
     * EVITAR RU DUPLICADO
     * =====================================================
     */

    $stmtDupRU = $pdo->prepare("
        SELECT id_estudiante
        FROM estudiantes
        WHERE registro_universitario = ?
          AND id_estudiante != ?
        LIMIT 1
    ");

    $stmtDupRU->execute([
        $ru,
        $id_estudiante
    ]);

    if ($stmtDupRU->fetch()) {
        jsonError(
            'Registro Universitario duplicado',
            409,
            "El Registro Universitario '$ru' ya está asignado a otro estudiante."
        );
    }

    /*
     * =====================================================
     * ACTUALIZAR
     * =====================================================
     */

    try {

        $model->actualizar(
            $id_estudiante,
            [
                'id_carrera' => $id_carrera,
                'semestre' => $semestre,
                'registro_universitario' => $ru
            ]
        );

        jsonSuccess(
            [
                'id_estudiante' => $id_estudiante,
                'id_carrera' => $id_carrera,
                'semestre' => $semestre,
                'registro_universitario' => $ru
            ],
            'Datos de estudiante actualizados correctamente'
        );

    } catch (PDOException $e) {

        if ((string) $e->getCode() === '23000') {

            jsonError(
                'Datos duplicados',
                409,
                'El Registro Universitario ya está registrado para otro estudiante.'
            );
        }

        jsonError(
            'Error al actualizar estudiante',
            500,
            'No fue posible actualizar los datos del estudiante.'
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