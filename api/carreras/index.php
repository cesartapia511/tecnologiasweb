<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CarreraModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new CarreraModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_carrera');
    $carreras = $model->obtenerTodas();
    jsonSuccess($carreras, 'Carreras obtenidas correctamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_carrera');
    $data = getJsonInput();
    $nombre = trim($data['nombre_carrera'] ?? '');

    // Validaciones
    if (empty($nombre)) {
        jsonError('El nombre de la carrera es obligatorio', 400, 'Debes ingresar el nombre oficial del programa académico.');
    }

    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 150) {
        jsonError('Longitud inválida para el nombre de carrera', 400, 'El nombre debe tener entre 3 y 150 caracteres.');
    }

    // Comprobar carrera duplicada
    $stmtDup = $pdo->prepare("SELECT id_carrera FROM carreras WHERE LOWER(TRIM(nombre_carrera)) = LOWER(TRIM(?)) LIMIT 1");
    $stmtDup->execute([$nombre]);
    if ($stmtDup->fetch()) {
        jsonError('Carrera duplicada', 409, "Ya existe un programa académico registrado con el nombre '$nombre'.");
    }

    try {
        $model->crear($nombre);
        $newId = (int)$pdo->lastInsertId();
        jsonSuccess(['id_carrera' => $newId, 'nombre_carrera' => $nombre], 'Carrera registrada con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al crear carrera', 500, 'Ocurrió un error interno en la base de datos: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y POST en esta ruta.');
}
