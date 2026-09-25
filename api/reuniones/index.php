<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/ReunionModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new ReunionModel($pdo);
$tutoriaModel = new TutoriaModel($pdo);

if ($method === 'GET') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutoria');

    $id_tutoria = isset($_GET['id_tutoria']) ? (int)$_GET['id_tutoria'] : 0;
    if ($id_tutoria <= 0) {
        jsonError('Tutoría no especificada', 400);
    }

    // Validate access to the tutoria
    $tutoria = $tutoriaModel->obtenerPorId($id_tutoria);
    if (!$tutoria) {
        jsonError('Tutoría no encontrada', 404);
    }

    if ($usuarioAuth['rol'] === 'tutor' && $tutoria['id_tutor'] != $usuarioAuth['id_tutor']) {
        jsonError('Acceso denegado. No eres el tutor de esta tutoría.', 403);
    }

    if ($usuarioAuth['rol'] === 'estudiante' && $tutoria['id_estudiante'] != $usuarioAuth['id_estudiante']) {
        jsonError('Acceso denegado. No eres el estudiante de esta tutoría.', 403);
    }

    try {
        $reuniones = $model->obtenerPorTutoria($id_tutoria);
        jsonSuccess($reuniones, 'Reuniones consultadas exitosamente');
    } catch (PDOException $e) {
        error_log("PDOException en reuniones GET: " . $e->getMessage());
        jsonError('Error de base de datos al obtener reuniones.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en reuniones GET: " . $e->getMessage());
        jsonError('Error al obtener reuniones', 500, $e->getMessage());
    }

} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_tutoria');

    $data = getJsonInput();

    $id_tutoria = isset($data['id_tutoria']) ? (int)$data['id_tutoria'] : 0;
    $fecha = trim($data['fecha'] ?? '');
    $hora_inicio = trim($data['hora_inicio'] ?? '');
    $hora_fin = trim($data['hora_fin'] ?? '');
    $lugar_o_enlace = trim($data['lugar_o_enlace'] ?? '');
    $asistio_estudiante = trim($data['asistio_estudiante'] ?? '');
    $minutos_tardanza = isset($data['minutos_tardanza']) ? (int)$data['minutos_tardanza'] : 0;
    $evidencia_url = trim($data['evidencia_url'] ?? '');
    $observaciones = trim($data['observaciones'] ?? '');

    if ($id_tutoria <= 0) {
        jsonError('Tutoría no válida', 400);
    }
    
    // Only tutors can create meetings for their tutorias
    if ($usuarioAuth['rol'] !== 'tutor' && $usuarioAuth['rol'] !== 'administrador') {
         jsonError('Sólo los tutores o administradores pueden registrar reuniones', 403);
    }

    try {
        $tutoria = $tutoriaModel->obtenerPorId($id_tutoria);
        if (!$tutoria) {
            jsonError('Tutoría inexistente', 404);
        }

        if ($usuarioAuth['rol'] === 'tutor' && $tutoria['id_tutor'] != $usuarioAuth['id_tutor']) {
            jsonError('Acceso denegado. No eres el tutor de esta tutoría.', 403);
        }

        if (empty($fecha) || empty($hora_inicio) || empty($hora_fin) || empty($asistio_estudiante)) {
            jsonError('Faltan datos obligatorios', 400, 'Fecha, horas y estado de asistencia son requeridos.');
        }

        if (strtotime($hora_fin) <= strtotime($hora_inicio)) {
            jsonError('Horario inválido', 400, 'La hora de fin debe ser posterior a la hora de inicio.');
        }

        $estadosValidos = ['si', 'no', 'tardanza', 'no_aplica'];
        if (!in_array($asistio_estudiante, $estadosValidos)) {
            jsonError('Estado de asistencia inválido', 400);
        }

        if ($asistio_estudiante === 'tardanza' && $minutos_tardanza <= 0) {
            jsonError('Tardanza inválida', 400, 'Los minutos de tardanza deben ser mayores a 0 si el estado es "tardanza".');
        }

        if ($asistio_estudiante !== 'tardanza') {
            $minutos_tardanza = 0;
        }

        if ($minutos_tardanza < 0) {
            jsonError('Tardanza inválida', 400, 'Los minutos no pueden ser negativos.');
        }

        if (!empty($evidencia_url) && !filter_var($evidencia_url, FILTER_VALIDATE_URL)) {
            jsonError('URL de evidencia inválida', 400, 'Debe proporcionar una URL válida.');
        }

        $id_reunion = $model->crear([
            'id_tutoria' => $id_tutoria,
            'fecha' => $fecha,
            'hora_inicio' => $hora_inicio,
            'hora_fin' => $hora_fin,
            'lugar_o_enlace' => $lugar_o_enlace,
            'asistio_estudiante' => $asistio_estudiante,
            'minutos_tardanza' => $minutos_tardanza,
            'evidencia_url' => $evidencia_url,
            'observaciones' => $observaciones
        ]);

        jsonSuccess(['id_reunion' => $id_reunion], 'Reunión registrada exitosamente', 201);
    } catch (PDOException $e) {
        error_log("PDOException en reuniones POST: " . $e->getMessage());
        jsonError('Error de base de datos al registrar reunión.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en reuniones POST: " . $e->getMessage());
        jsonError('Error al registrar reunión', 500, $e->getMessage());
    }

} elseif ($method === 'PUT') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutoria'); // Base auth

    $data = getJsonInput();
    $id_reunion = isset($data['id_reunion']) ? (int)$data['id_reunion'] : 0;
    $accion = trim($data['accion'] ?? '');

    if ($id_reunion <= 0 || empty($accion)) {
        jsonError('Datos incompletos', 400, 'Se requiere id_reunion y accion.');
    }

    try {
        if ($accion === 'firmar_tutor') {
            if ($usuarioAuth['rol'] !== 'tutor') {
                jsonError('Acceso denegado', 403, 'Solo el tutor puede realizar esta firma.');
            }
            if (!$model->verificarAccesoTutor($id_reunion, $usuarioAuth['id_tutor'])) {
                jsonError('Acceso denegado', 403, 'No tienes permisos sobre esta reunión.');
            }
            $model->firmarTutor($id_reunion);
            jsonSuccess(null, 'Firma del tutor registrada exitosamente.');
        } elseif ($accion === 'firmar_estudiante') {
            if ($usuarioAuth['rol'] !== 'estudiante') {
                jsonError('Acceso denegado', 403, 'Solo el estudiante puede realizar esta firma.');
            }
            if (!$model->verificarAccesoEstudiante($id_reunion, $usuarioAuth['id_estudiante'])) {
                jsonError('Acceso denegado', 403, 'No tienes permisos sobre esta reunión.');
            }
            $model->firmarEstudiante($id_reunion);
            jsonSuccess(null, 'Firma del estudiante registrada exitosamente.');
        } else {
            jsonError('Acción inválida', 400);
        }
    } catch (PDOException $e) {
        error_log("PDOException en reuniones PUT: " . $e->getMessage());
        jsonError('Error de base de datos al actualizar la reunión.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en reuniones PUT: " . $e->getMessage());
        jsonError('Error al actualizar la reunión', 500, $e->getMessage());
    }

} else {
    jsonError('Método no permitido', 405);
}
