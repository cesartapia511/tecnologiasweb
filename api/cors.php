<?php
// Configuración global de CORS y respuestas JSON para la API UPDS Tarija
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Manejo global de excepciones para evitar errores HTTP 500 con HTML o texto plano
set_exception_handler(function ($e) {
    http_response_code(500);
    
    // Registrar el error real en los logs del servidor para no perderlo
    error_log(sprintf(
        "[%s] %s %s - Excepción no controlada: %s en %s:%d",
        date('Y-m-d H:i:s'),
        $_SERVER['REQUEST_METHOD'],
        $_SERVER['REQUEST_URI'],
        $e->getMessage(),
        $e->getFile(),
        $e->getLine()
    ));

    // Devolver un JSON limpio al frontend
    $response = [
        'success' => false,
        'message' => 'Error interno del servidor. Por favor, contacte al administrador.',
        'data' => null
    ];
    
    // Si estamos en desarrollo, podríamos mostrar el error real, pero según HU-019 no debemos exponer datos sensibles
    if ($e instanceof PDOException) {
        $response['motivo'] = 'Ocurrió un problema de base de datos.';
    } else {
        $response['motivo'] = $e->getMessage();
    }

    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
});

function getJsonInput() {
    $raw = file_get_contents('php://input');
    if (!empty($raw)) {
        $decoded = json_decode($raw, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            return $decoded;
        }
    }
    return $_POST;
}

function jsonSuccess($data = null, $message = 'Operación realizada correctamente', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message = 'Error en la petición', $code = 400, $motivo = null, $errors = []) {
    http_response_code($code);
    $response = [
        'success' => false,
        'message' => $message,
    ];
    if ($motivo !== null && $motivo !== '') {
        $response['motivo'] = $motivo;
    }
    if (!empty($errors)) {
        $response['errors'] = $errors;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../includes/auth_helper.php';

