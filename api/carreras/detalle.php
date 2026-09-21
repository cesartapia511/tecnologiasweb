<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CarreraModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$model = new CarreraModel($pdo);

if (!$id || $id <= 0) {
    jsonError('ID de carrera inválido o no proporcionado', 400, 'Debes especificar un identificador numérico de carrera válido.');
}

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_carrera');
    $carrera = $model->obtenerPorId($id);
    if (!$carrera) {
        jsonError('Carrera no encontrada', 404, "No existe ninguna carrera registrada con el identificador #$id.");
    }
    jsonSuccess($carrera, 'Detalle de carrera obtenido correctamente');
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_carrera');
    $carrera = $model->obtenerPorId($id);
    if (!$carrera) {
        jsonError('Carrera no encontrada', 404, "No se puede editar: la carrera con ID #$id no existe.");
    }

    $data = getJsonInput();
    $nombre = trim($data['nombre_carrera'] ?? '');

    if (empty($nombre)) {
        jsonError('El nombre de la carrera es obligatorio', 400, 'El campo nombre_carrera no puede estar vacío.');
    }

    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 150) {
        jsonError('Longitud inválida para la carrera', 400, 'El nombre debe contener entre 3 y 150 caracteres.');
    }

    // Comprobar duplicados en otros registros
    $stmtDup = $pdo->prepare("SELECT id_carrera FROM carreras WHERE LOWER(TRIM(nombre_carrera)) = LOWER(TRIM(?)) AND id_carrera != ? LIMIT 1");
    $stmtDup->execute([$nombre, $id]);
    if ($stmtDup->fetch()) {
        jsonError('Nombre de carrera ya en uso', 409, "Ya existe otra carrera registrada con el nombre '$nombre'.");
    }

    try {
        $model->actualizar($id, $nombre);
        jsonSuccess(['id_carrera' => $id, 'nombre_carrera' => $nombre], 'Carrera actualizada correctamente');
    } catch (PDOException $e) {
        jsonError('Error al actualizar carrera', 500, 'Error en el servidor de base de datos: ' . $e->getMessage());
    }
} elseif ($method === 'DELETE') {
    $usuarioAuth = requerirPermiso($pdo, 'eliminar_carrera');
    $carrera = $model->obtenerPorId($id);
    if (!$carrera) {
        jsonError('Carrera no encontrada', 404, "No se puede eliminar: la carrera #$id no existe.");
    }

    // Validar relaciones existentes antes de eliminar
    $stmtMat = $pdo->prepare("SELECT COUNT(*) FROM materias WHERE id_carrera = ?");
    $stmtMat->execute([$id]);
    $totalMaterias = (int)$stmtMat->fetchColumn();

    $stmtEst = $pdo->prepare("SELECT COUNT(*) FROM estudiantes WHERE id_carrera = ?");
    $stmtEst->execute([$id]);
    $totalEst = (int)$stmtEst->fetchColumn();

    if ($totalMaterias > 0 || $totalEst > 0) {
        $detalle = [];
        if ($totalMaterias > 0) $detalle[] = "$totalMaterias asignatura(s) asociada(s)";
        if ($totalEst > 0) $detalle[] = "$totalEst estudiante(s) matriculado(s)";
        $motivo = "No se puede eliminar la carrera porque tiene " . implode(' y ', $detalle) . ". Debes reasignar o eliminar esos registros primero.";
        jsonError('Integridad referencial comprometida', 409, $motivo);
    }

    try {
        $model->eliminar($id);
        jsonSuccess(['id_carrera' => $id], 'Carrera eliminada correctamente');
    } catch (PDOException $e) {
        jsonError('No se pudo eliminar la carrera', 500, 'Error al ejecutar la eliminación: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, PUT y DELETE en esta ruta.');
}
