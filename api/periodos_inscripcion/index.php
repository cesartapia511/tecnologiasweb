<?php

require_once __DIR__ . '/../../models/PeriodoInscripcion.php';

header("Content-Type: application/json; charset=UTF-8");

try {
    $periodo = new PeriodoInscripcion();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'GET') {

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

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Error interno del servidor',
        'error' => $e->getMessage()
    ]);
}
