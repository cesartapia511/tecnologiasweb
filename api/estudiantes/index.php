<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new EstudianteModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_estudiante');
    $id_usuario = isset($_GET['id_usuario']) ? (int)$_GET['id_usuario'] : null;
    if ($id_usuario) {
        $estudiante = $model->obtenerPorUsuario($id_usuario);
        if (!$estudiante) {
            jsonError('Estudiante no encontrado', 404, "No existe registro de estudiante para el usuario #$id_usuario.");
        }
        jsonSuccess($estudiante, 'Datos de estudiante obtenidos');
    } else {
        $estudiantes = $model->obtenerTodos();
        jsonSuccess($estudiantes, 'Padrón de estudiantes obtenido exitosamente');
    }
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_estudiante');
    $data = getJsonInput();
    $id_estudiante = isset($data['id_estudiante']) ? (int)$data['id_estudiante'] : 0;

    if ($id_estudiante <= 0) {
        jsonError('ID de estudiante inválido o no proporcionado', 400, 'Debes enviar el identificador numérico del estudiante.');
    }

    // Si el usuario es estudiante (no admin), solo puede editar sus propios datos académicos
    if ($usuarioAuth['rol'] === 'estudiante' && (!isset($usuarioAuth['id_estudiante']) || $usuarioAuth['id_estudiante'] !== $id_estudiante)) {
        jsonError('Acceso denegado', 403, 'Solo puedes actualizar tu propio perfil estudiantil.');
    }

    $estudianteExistente = $model->obtenerPorId($id_estudiante);
    if (!$estudianteExistente) {
        jsonError('Estudiante no encontrado', 404, "No existe ningún estudiante registrado con ID #$id_estudiante.");
    }

    $id_carrera = isset($data['id_carrera']) ? (int)$data['id_carrera'] : (int)$estudianteExistente['id_carrera'];
    $semestre = isset($data['semestre']) ? (int)$data['semestre'] : (int)$estudianteExistente['semestre'];
    $ru = trim($data['registro_universitario'] ?? $estudianteExistente['registro_universitario']);

    $errores = [];

    // Validar carrera existente
    $stmtCarrera = $pdo->prepare("SELECT id_carrera FROM carreras WHERE id_carrera = ?");
    $stmtCarrera->execute([$id_carrera]);
    if (!$stmtCarrera->fetch()) {
        $errores['id_carrera'] = "La carrera seleccionada con ID #$id_carrera no existe.";
    }

    // Validar semestre
    if ($semestre < 1 || $semestre > 12) {
        $errores['semestre'] = 'El semestre académico debe estar comprendido entre 1 y 12.';
    }

    // Validar RU
    if (empty($ru) || mb_strlen($ru) > 30) {
        $errores['registro_universitario'] = 'El Registro Universitario (RU) es obligatorio y no puede superar 30 caracteres.';
    } else {
        // Verificar que el RU no esté duplicado en otro estudiante
        $stmtDupRU = $pdo->prepare("SELECT id_estudiante FROM estudiantes WHERE registro_universitario = ? AND id_estudiante != ? LIMIT 1");
        $stmtDupRU->execute([$ru, $id_estudiante]);
        if ($stmtDupRU->fetch()) {
            $errores['registro_universitario'] = "El Registro Universitario '$ru' ya está asignado a otro estudiante.";
        }
    }

    if (!empty($errores)) {
        jsonError('Datos académicos inválidos', 400, 'Verifica los campos del formulario estudiantil.', $errores);
    }

    try {
        $model->actualizar($id_estudiante, [
            'id_carrera'             => $id_carrera,
            'semestre'               => $semestre,
            'registro_universitario' => $ru
        ]);
        jsonSuccess(['id_estudiante' => $id_estudiante], 'Datos de estudiante actualizados con éxito');
    } catch (PDOException $e) {
        jsonError('Error al actualizar estudiante', 500, 'Error en la base de datos: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y PUT en esta ruta.');
}
