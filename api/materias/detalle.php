<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/MateriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$model = new MateriaModel($pdo);

if (!$id || $id <= 0) {
    jsonError('ID de materia inválido o no proporcionado', 400, 'Debes enviar un identificador numérico de materia válido.');
}

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_materia');
    $materia = $model->obtenerPorId($id);
    if (!$materia) {
        jsonError('Materia no encontrada', 404, "No se encontró ninguna asignatura con ID #$id.");
    }
    jsonSuccess($materia, 'Detalle de materia obtenido correctamente');
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_materia');
    $materia = $model->obtenerPorId($id);
    if (!$materia) {
        jsonError('Materia no encontrada', 404, "No se puede editar: la asignatura con ID #$id no existe.");
    }

    $data = getJsonInput();
    $nombre = trim($data['nombre_materia'] ?? '');
    $id_carrera = !empty($data['id_carrera']) ? (int)$data['id_carrera'] : null;

    if (empty($nombre)) {
        jsonError('El nombre de la materia es obligatorio', 400, 'El campo nombre_materia no puede estar vacío.');
    }

    if (mb_strlen($nombre) < 3 || mb_strlen($nombre) > 150) {
        jsonError('Longitud de nombre inválida', 400, 'El nombre debe tener entre 3 y 150 caracteres.');
    }

    // Verificar existencia de la carrera si fue enviada
    if ($id_carrera !== null) {
        $stmtCarrera = $pdo->prepare("SELECT id_carrera FROM carreras WHERE id_carrera = ?");
        $stmtCarrera->execute([$id_carrera]);
        if (!$stmtCarrera->fetch()) {
            jsonError('Carrera asociada inválida', 404, "La carrera especificada con ID #$id_carrera no existe.");
        }
    }

    // Evitar duplicados excluyendo el id actual
    if ($id_carrera !== null) {
        $stmtDup = $pdo->prepare("SELECT id_materia FROM materias WHERE LOWER(TRIM(nombre_materia)) = LOWER(TRIM(?)) AND id_carrera = ? AND id_materia != ? LIMIT 1");
        $stmtDup->execute([$nombre, $id_carrera, $id]);
    } else {
        $stmtDup = $pdo->prepare("SELECT id_materia FROM materias WHERE LOWER(TRIM(nombre_materia)) = LOWER(TRIM(?)) AND id_carrera IS NULL AND id_materia != ? LIMIT 1");
        $stmtDup->execute([$nombre, $id]);
    }

    if ($stmtDup->fetch()) {
        jsonError('Materia duplicada', 409, "Ya existe otra materia con el nombre '$nombre' en la misma carrera.");
    }

    try {
        $model->actualizar($id, [
            'nombre_materia' => $nombre,
            'id_carrera'     => $id_carrera
        ]);
        jsonSuccess(['id_materia' => $id, 'nombre_materia' => $nombre], 'Materia actualizada correctamente');
    } catch (PDOException $e) {
        jsonError('Error al actualizar materia', 500, 'Error interno: ' . $e->getMessage());
    }
} elseif ($method === 'DELETE') {
    $usuarioAuth = requerirPermiso($pdo, 'eliminar_materia');
    $materia = $model->obtenerPorId($id);
    if (!$materia) {
        jsonError('Materia no encontrada', 404, "No se puede eliminar: la asignatura #$id no existe.");
    }

    // Validar tutorías y relaciones existentes
    $stmtTut = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE id_materia = ?");
    $stmtTut->execute([$id]);
    $totalTutorias = (int)$stmtTut->fetchColumn();

    $stmtDoc = $pdo->prepare("SELECT COUNT(*) FROM tutor_materia WHERE id_materia = ?");
    $stmtDoc->execute([$id]);
    $totalDocentes = (int)$stmtDoc->fetchColumn();

    if ($totalTutorias > 0 || $totalDocentes > 0) {
        $detalle = [];
        if ($totalTutorias > 0) $detalle[] = "$totalTutorias tutoría(s) agendada(s)";
        if ($totalDocentes > 0) $detalle[] = "$totalDocentes tutor(es) docente(s) asignado(s)";
        $motivo = "No se puede eliminar la materia porque tiene " . implode(' y ', $detalle) . ". Debes reasignar las tutorías y materias docentes primero.";
        jsonError('No se puede eliminar la materia', 409, $motivo);
    }

    try {
        $model->eliminar($id);
        jsonSuccess(['id_materia' => $id], 'Materia eliminada correctamente');
    } catch (PDOException $e) {
        jsonError('Error al eliminar materia', 500, 'Error al ejecutar la eliminación: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, PUT y DELETE en esta ruta.');
}
