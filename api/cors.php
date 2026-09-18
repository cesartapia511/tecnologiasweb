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

function cleanMojibake($data) {
    if (is_array($data)) {
        return array_map('cleanMojibake', $data);
    }
    if (is_object($data)) {
        foreach ($data as $k => $v) {
            $data->$k = cleanMojibake($v);
        }
        return $data;
    }
    if (is_string($data)) {
        $search = [
            'IngenierÃa', 'TecnologÃa', 'MarÃa', 'TutorÃas', 'TutorÃa',
            'PsicologÃa', 'ContadurÃa', 'PÃºblica', 'PÃblica',
            'AdministraciÃ³n', 'AdministraciÃn', 'ComunicaciÃ³n', 'ComunicaciÃn',
            'ProgramaciÃ³n', 'ProgramaciÃn', 'GestiÃ³n', 'GestiÃn',
            'InvestigaciÃ³n', 'InvestigaciÃn', 'OperaciÃ³nes', 'OperaciÃnes', 'OperaciÃ³n', 'OperaciÃn',
            'Ã¡', 'Ã©', 'Ã­', 'Ã³', 'Ãº', 'Ã±',
            'Ã ', 'Ã‰', 'Ã ', 'Ã“', 'Ãš', 'Ã‘',
            'Ã¼', 'Ãœ', 'Ã'
        ];
        $replace = [
            'Ingeniería', 'Tecnología', 'María', 'Tutorías', 'Tutoría',
            'Psicología', 'Contaduría', 'Pública', 'Pública',
            'Administración', 'Administración', 'Comunicación', 'Comunicación',
            'Programación', 'Programación', 'Gestión', 'Gestión',
            'Investigación', 'Investigación', 'Operaciones', 'Operaciones', 'Operación', 'Operación',
            'á', 'é', 'í', 'ó', 'ú', 'ñ',
            'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ',
            'ü', 'Ü', 'í'
        ];
        return str_replace($search, $replace, $data);
    }
    return $data;
}

function jsonSuccess($data = null, $message = 'Operación exitosa', $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'message' => cleanMojibake($message),
        'data' => cleanMojibake($data)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function jsonError($message = 'Error en la petición', $code = 400, $errors = []) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'message' => cleanMojibake($message),
        'errors' => cleanMojibake($errors)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
