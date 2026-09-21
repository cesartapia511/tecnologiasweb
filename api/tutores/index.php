<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutorModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new TutorModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_tutor');
    $tutores = $model->obtenerTodos();
    jsonSuccess($tutores, 'Directorio de tutores obtenido exitosamente');
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_tutor');
    $data = getJsonInput();
    $id_tutor = isset($data['id_tutor']) ? (int)$data['id_tutor'] : 0;

    if ($id_tutor <= 0) {
        jsonError('ID de tutor inválido o no proporcionado', 400, 'Debes enviar el identificador numérico del tutor.');
    }

    // Si el usuario es tutor (no admin), solo puede editar su propio perfil
    if ($usuarioAuth['rol'] === 'tutor' && (!isset($usuarioAuth['id_tutor']) || $usuarioAuth['id_tutor'] !== $id_tutor)) {
        jsonError('Acceso denegado', 403, 'Solo puedes actualizar tu propio perfil docente institucional.');
    }

    $tutorExistente = $model->obtenerPorId($id_tutor);
    if (!$tutorExistente) {
        jsonError('Tutor no encontrado', 404, "No existe ningún tutor registrado con ID #$id_tutor.");
    }

    $especialidad = trim($data['especialidad'] ?? '');
    $biografia = trim($data['biografia'] ?? '');

    if (empty($especialidad) || mb_strlen($especialidad) < 3 || mb_strlen($especialidad) > 150) {
        jsonError('Especialidad docente inválida', 400, 'La especialidad es obligatoria y debe tener entre 3 y 150 caracteres.');
    }

    if (mb_strlen($biografia) > 1000) {
        jsonError('Biografía demasiado extensa', 400, 'La biografía o presentación no puede exceder los 1000 caracteres.');
    }

    try {
        $model->actualizar($id_tutor, [
            'especialidad' => $especialidad,
            'biografia'    => $biografia,
            'materias_ids' => isset($data['materias_ids']) && is_array($data['materias_ids']) ? $data['materias_ids'] : []
        ]);
        jsonSuccess(['id_tutor' => $id_tutor], 'Perfil y asignaturas de tutor actualizados con éxito');
    } catch (PDOException $e) {
        jsonError('Error al actualizar perfil de tutor', 500, 'Error en el servidor: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y PUT en esta ruta.');
}
