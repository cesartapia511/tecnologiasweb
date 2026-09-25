<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/InformeAvanceModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new InformeAvanceModel($pdo);
$tutoriaModel = new TutoriaModel($pdo);

if ($method === 'GET') {
    $usuarioAuth = requerirPermiso($pdo, 'listar_tutoria');

    $id_tutoria = isset($_GET['id_tutoria']) ? (int)$_GET['id_tutoria'] : 0;
    if ($id_tutoria <= 0) {
        jsonError('Tutoría no especificada', 400);
    }

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
        $informes = $model->obtenerPorTutoria($id_tutoria);
        jsonSuccess($informes, 'Informes consultados exitosamente');
    } catch (PDOException $e) {
        error_log("PDOException en informes GET: " . $e->getMessage());
        jsonError('Error de base de datos al obtener informes.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en informes GET: " . $e->getMessage());
        jsonError('Error al obtener informes', 500, $e->getMessage());
    }

} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'editar_tutoria');

    $data = getJsonInput();

    $id_tutoria = isset($data['id_tutoria']) ? (int)$data['id_tutoria'] : 0;
    $numero_informe = isset($data['numero_informe']) ? (int)$data['numero_informe'] : 0;
    $fecha_limite = trim($data['fecha_limite'] ?? '');
    $descripcion_avance = trim($data['descripcion_avance'] ?? '');
    $porcentaje_avance = isset($data['porcentaje_avance']) ? (int)$data['porcentaje_avance'] : -1;
    
    if ($id_tutoria <= 0) {
        jsonError('Tutoría no válida', 400);
    }
    
    if ($usuarioAuth['rol'] !== 'tutor' && $usuarioAuth['rol'] !== 'administrador') {
         jsonError('Sólo los tutores o administradores pueden registrar informes', 403);
    }

    try {
        $tutoria = $tutoriaModel->obtenerPorId($id_tutoria);
        if (!$tutoria) {
            jsonError('Tutoría inexistente', 404);
        }

        if ($usuarioAuth['rol'] === 'tutor' && $tutoria['id_tutor'] != $usuarioAuth['id_tutor']) {
            jsonError('Acceso denegado. No eres el tutor de esta tutoría.', 403);
        }

        if (empty($descripcion_avance)) {
            jsonError('Faltan datos obligatorios', 400, 'La descripción del avance es requerida.');
        }

        if ($porcentaje_avance < 0 || $porcentaje_avance > 100) {
            jsonError('Porcentaje inválido', 400, 'El porcentaje debe estar entre 0 y 100.');
        }

        if ($numero_informe <= 0) {
            // Auto calculate if not provided or invalid
            $numero_informe = $model->obtenerProximoNumero($id_tutoria);
        } else {
            // Check duplicates
            if ($model->existeNumeroInforme($id_tutoria, $numero_informe)) {
                jsonError('Número de informe duplicado', 400, "Ya existe un informe #$numero_informe para esta tutoría.");
            }
        }

        $id_informe = $model->crear([
            'id_tutoria' => $id_tutoria,
            'numero_informe' => $numero_informe,
            'fecha_limite' => $fecha_limite,
            'descripcion_avance' => $descripcion_avance,
            'porcentaje_avance' => $porcentaje_avance,
            'registrado_por' => (int)$usuarioAuth['id_usuario']
        ]);

        jsonSuccess(['id_informe' => $id_informe], 'Informe registrado exitosamente', 201);
    } catch (PDOException $e) {
        error_log("PDOException en informes POST: " . $e->getMessage());
        jsonError('Error de base de datos al registrar informe.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en informes POST: " . $e->getMessage());
        jsonError('Error al registrar informe', 500, $e->getMessage());
    }

} else {
    jsonError('Método no permitido', 405);
}
