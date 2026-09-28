<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/PeriodoInscripcion.php';

try {
    $periodo = new PeriodoInscripcion();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {
        requerirAutenticacion($pdo);

        $periodos = $periodo->obtenerTodos();

        echo json_encode([
            'success' => true,
            'data' => $periodos
        ]);

        exit;
    }

    $input = json_decode(file_get_contents("php://input"), true);

    if (!is_array($input)) {
        $input = [];
    }

    if ($metodo === 'POST') {
        $usuario = requerirAutenticacion($pdo);
        $rol = strtolower($usuario['rol'] ?? $usuario['nombre_rol'] ?? '');
        if ($rol !== 'administrador') {
            jsonError('No tiene permisos para realizar esta acción', 403, 'Solo el administrador puede crear períodos de inscripción.');
        }

        $nombre = trim($input['nombre'] ?? '');
        $fechaInicio = $input['fecha_inicio'] ?? '';
        $fechaFin = $input['fecha_fin'] ?? '';

        if ($nombre === '') {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'El nombre del periodo es requerido'
            ]);

            exit;
        }

        if ($fechaInicio === '' || $fechaFin === '') {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'Las fechas de inicio y fin son requeridas'
            ]);

            exit;
        }

        if ($fechaFin < $fechaInicio) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'La fecha de fin no puede ser menor a la fecha de inicio'
            ]);

            exit;
        }

        $id = $periodo->crear([
            'nombre' => $nombre,
            'descripcion' => $input['descripcion'] ?? '',
            'fecha_inicio' => $fechaInicio,
            'fecha_fin' => $fechaFin
        ]);

        echo json_encode([
            'success' => true,
            'message' => 'Periodo registrado con éxito',
            'data' => [
                'id_periodo' => $id
            ]
        ]);

        exit;
    }

    if ($metodo === 'PUT') {
        $usuario = requerirAutenticacion($pdo);
        $rol = strtolower($usuario['rol'] ?? $usuario['nombre_rol'] ?? '');
        if ($rol !== 'administrador') {
            jsonError('No tiene permisos para realizar esta acción', 403, 'Solo el administrador puede modificar períodos de inscripción.');
        }

        $idPeriodo = (int)($input['id_periodo'] ?? 0);
        $accion = $input['accion'] ?? '';

        if ($idPeriodo <= 0) {
            http_response_code(400);

            echo json_encode([
                'success' => false,
                'message' => 'ID de periodo inválido'
            ]);

            exit;
        }

        if ($accion === 'activar') {

            $periodo->activar($idPeriodo);

            echo json_encode([
                'success' => true,
                'message' => 'Periodo activado correctamente'
            ]);

            exit;
        }

        if ($accion === 'desactivar') {

            $periodo->desactivar($idPeriodo);

            echo json_encode([
                'success' => true,
                'message' => 'Periodo desactivado correctamente'
            ]);

            exit;
        }

        http_response_code(400);

        echo json_encode([
            'success' => false,
            'message' => 'Acción no válida'
        ]);

        exit;
    }

    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);

} catch (Throwable $e) {
    error_log($e->getMessage());
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor'
    ]);
}
