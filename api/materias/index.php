<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new MateriaModel($pdo);

/*
 * =========================================================
 * GET - LISTAR MATERIAS
 * =========================================================
 */

if ($method === 'GET') {

    requerirPermiso($pdo, 'listar_materia');

    $id_carrera = null;

    if (isset($_GET['id_carrera'])) {

        if (!ctype_digit((string) $_GET['id_carrera'])) {
            jsonError(
                'ID de carrera inválido',
                400,
                'El identificador de carrera debe ser numérico.'
            );
        }

        $id_carrera = (int) $_GET['id_carrera'];

        if ($id_carrera <= 0) {
            jsonError(
                'ID de carrera inválido',
                400,
                'El identificador de carrera debe ser mayor que cero.'
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
                'Carrera no encontrada',
                404,
                "No existe ninguna carrera registrada con ID #$id_carrera."
            );
        }

        $materias = $model->obtenerPorCarrera(
            $id_carrera
        );

    } else {

        $materias = $model->obtenerTodas();
    }

    jsonSuccess(
        $materias,
        'Materias obtenidas exitosamente'
    );
}

/*
 * =========================================================
 * POST - CREAR MATERIA
 * =========================================================
 */

elseif ($method === 'POST') {

    requerirPermiso($pdo, 'crear_materia');

    $data = getJsonInput();

    $nombre = trim(
        $data['nombre_materia'] ?? ''
    );

    $id_carrera = null;

    if (
        array_key_exists('id_carrera', $data) &&
        $data['id_carrera'] !== null &&
        $data['id_carrera'] !== ''
    ) {

        if (
            !is_numeric($data['id_carrera']) ||
            (int) $data['id_carrera'] <= 0
        ) {
            jsonError(
                'ID de carrera inválido',
                400,
                'La carrera seleccionada no es válida.'
            );
        }

        $id_carrera = (int) $data['id_carrera'];
    }

    /*
     * =====================================================
     * VALIDAR NOMBRE
     * =====================================================
     */

    if ($nombre === '') {
        jsonError(
            'Nombre de materia obligatorio',
            400,
            'Debes ingresar el nombre oficial de la asignatura.'
        );
    }

    if (mb_strlen($nombre) < 3) {
        jsonError(
            'Nombre demasiado corto',
            400,
            'El nombre de la materia debe tener al menos 3 caracteres.'
        );
    }

    if (mb_strlen($nombre) > 150) {
        jsonError(
            'Nombre demasiado largo',
            400,
            'El nombre de la materia no puede superar los 150 caracteres.'
        );
    }

    /*
     * =====================================================
     * VALIDAR CARRERA
     * =====================================================
     */

    if ($id_carrera !== null) {

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
                "No existe ninguna carrera registrada con ID #$id_carrera."
            );
        }
    }

    /*
     * =====================================================
     * EVITAR DUPLICADOS
     * =====================================================
     */

    if ($id_carrera !== null) {

        $stmtDup = $pdo->prepare("
            SELECT id_materia
            FROM materias
            WHERE LOWER(TRIM(nombre_materia)) =
                  LOWER(TRIM(?))
              AND id_carrera = ?
            LIMIT 1
        ");

        $stmtDup->execute([
            $nombre,
            $id_carrera
        ]);

    } else {

        $stmtDup = $pdo->prepare("
            SELECT id_materia
            FROM materias
            WHERE LOWER(TRIM(nombre_materia)) =
                  LOWER(TRIM(?))
              AND id_carrera IS NULL
            LIMIT 1
        ");

        $stmtDup->execute([
            $nombre
        ]);
    }

    if ($stmtDup->fetch()) {

        jsonError(
            'Materia duplicada',
            409,
            "Ya existe una materia registrada con el nombre '$nombre' en la carrera seleccionada."
        );
    }

    /*
     * =====================================================
     * CREAR
     * =====================================================
     */

    try {

        $model->crear([
            'nombre_materia' => $nombre,
            'id_carrera' => $id_carrera
        ]);

        $newId = (int) $pdo->lastInsertId();

        jsonSuccess(
            [
                'id_materia' => $newId,
                'nombre_materia' => $nombre,
                'id_carrera' => $id_carrera
            ],
            'Materia registrada exitosamente',
            201
        );

    } catch (PDOException $e) {

        if ((string) $e->getCode() === '23000') {
            jsonError(
                'Materia duplicada',
                409,
                'La materia ya se encuentra registrada.'
            );
        }

        jsonError(
            'Error al crear materia',
            500,
            'No fue posible registrar la materia.'
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
        'Solo se admiten solicitudes GET y POST en esta ruta.'
    );
}