<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new MateriaModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_materia');
    $id_carrera = isset($_GET['id_carrera']) && is_numeric($_GET['id_carrera']) ? (int)$_GET['id_carrera'] : null;
    if ($id_carrera) {
        $materias = $model->obtenerPorCarrera($id_carrera);
    } else {
        $materias = $model->obtenerTodas();
    }
    jsonSuccess($materias, 'Materias obtenidas exitosamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_materia');
    $data = getJsonInput();
    $nombre = trim($data['nombre_materia'] ?? '');
    $id_carrera = !empty($data['id_carrera']) ? (int)$data['id_carrera'] : null;

    if (empty($nombre)) {
        jsonError('El nombre de la materia es obligatorio', 400, 'Debes ingresar el nombre oficial de la asignatura.');
    }

    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 150) {
        jsonError('Longitud de nombre inválida', 400, 'El nombre de la materia debe tener entre 3 y 150 caracteres.');
    }

    // Verificar existencia de la carrera asociada si fue indicada
    if ($id_carrera !== null) {
        $stmtCarrera = $pdo->prepare("SELECT id_carrera, nombre_carrera FROM carreras WHERE id_carrera = ?");
        $stmtCarrera->execute([$id_carrera]);
        if (!$stmtCarrera->fetch()) {
            jsonError('Carrera asociada inexistente', 404, "No existe ninguna carrera registrada con ID #$id_carrera.");
        }
    }

    // Evitar materias duplicadas en la misma carrera
    if ($id_carrera !== null) {
        $stmtDup = $pdo->prepare("SELECT id_materia FROM materias WHERE LOWER(TRIM(nombre_materia)) = LOWER(TRIM(?)) AND id_carrera = ? LIMIT 1");
        $stmtDup->execute([$nombre, $id_carrera]);
    } else {
        $stmtDup = $pdo->prepare("SELECT id_materia FROM materias WHERE LOWER(TRIM(nombre_materia)) = LOWER(TRIM(?)) AND id_carrera IS NULL LIMIT 1");
        $stmtDup->execute([$nombre]);
    }

    if ($stmtDup->fetch()) {
        jsonError('Asignatura duplicada', 409, "Ya existe una materia registrada con el nombre '$nombre' en la carrera seleccionada.");
    }

    try {
        $model->crear([
            'nombre_materia' => $nombre,
            'id_carrera'     => $id_carrera
        ]);
        $newId = (int)$pdo->lastInsertId();
        jsonSuccess(['id_materia' => $newId, 'nombre_materia' => $nombre], 'Materia registrada exitosamente', 201);
    } catch (PDOException $e) {
        jsonError('Error al crear materia', 500, 'Error interno en la base de datos: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y POST en esta ruta.');
}
