<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EvaluacionModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EvaluacionModel($pdo);

if ($method === 'GET') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_evaluacion');
    $id_tutor = isset($_GET['id_tutor']) ? (int)$_GET['id_tutor'] : null;

    if ($usuarioAuth['rol'] === 'tutor') {
        $id_tutor = $usuarioAuth['id_tutor'] ?? -1;
    }

    $evaluaciones = $model->obtenerTodas($id_tutor);
    jsonSuccess($evaluaciones, 'Evaluaciones obtenidas correctamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_evaluacion');
    $data = getJsonInput();
    $id_tutoria = isset($data['id_tutoria']) ? (int)$data['id_tutoria'] : 0;
    $calificacion = isset($data['calificacion']) ? (int)$data['calificacion'] : 0;
    $comentario = trim($data['comentario'] ?? '');

    if ($id_tutoria <= 0) {
        jsonError('ID de tutoría obligatorio', 400, 'Debes indicar la tutoría que deseas evaluar.');
    }

    if ($calificacion < 1 || $calificacion > 5) {
        jsonError('Calificación fuera de rango', 400, 'La calificación debe ser un valor entero entre 1 y 5 estrellas.');
    }

    if (mb_strlen($comentario) > 1000) {
        jsonError('Comentario demasiado extenso', 400, 'El comentario no puede exceder los 1000 caracteres.');
    }

    // Verificar que la tutoría exista
    $tutoriaModel = new TutoriaModel($pdo);
    $tutoria = $tutoriaModel->obtenerPorId($id_tutoria);
    if (!$tutoria) {
        jsonError('Tutoría no encontrada', 404, "No existe ninguna tutoría registrada con ID #$id_tutoria.");
    }

    // Verificar que esté en estado 'realizada'
    if ($tutoria['estado'] !== 'realizada') {
        jsonError('Tutoría no finalizada', 400, "Solo puedes calificar sesiones que ya hayan sido concluidas y marcadas como 'realizada'.");
    }

    // Si el usuario es estudiante, verificar que sea el dueño de la tutoría
    if ($usuarioAuth['rol'] === 'estudiante') {
        if (!isset($usuarioAuth['id_estudiante']) || (int)$usuarioAuth['id_estudiante'] !== (int)$tutoria['id_estudiante']) {
            jsonError('Acceso denegado', 403, 'Solo puedes evaluar las sesiones de tutoría a las que asististe.');
        }
    }

    // Verificar que no haya sido evaluada previamente
    $stmtCheck = $pdo->prepare("SELECT id_evaluacion FROM evaluaciones_tutoria WHERE id_tutoria = ? LIMIT 1");
    $stmtCheck->execute([$id_tutoria]);
    if ($stmtCheck->fetch()) {
        jsonError('Evaluación duplicada', 409, 'Esta tutoría ya ha sido evaluada previamente y no admite duplicados.');
    }

    try {
        $id_eval = $model->crear([
            'id_tutoria'   => $id_tutoria,
            'calificacion' => $calificacion,
            'comentario'   => $comentario,
        ]);
        jsonSuccess(['id_evaluacion' => $id_eval, 'id_tutoria' => $id_tutoria], 'Evaluación de calidad registrada exitosamente', 201);
    } catch (PDOException $e) {
        jsonError('Error al guardar evaluación', 500, 'Error interno: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y POST en esta ruta.');
}
