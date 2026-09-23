<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

// Aceptar GET o POST
$token = '';
if ($method === 'POST') {
    $data = getJsonInput();
    $token = trim($data['token'] ?? '');
} else if ($method === 'GET') {
    $token = trim($_GET['token'] ?? '');
}

if (empty($token)) {
    jsonError('Token no proporcionado', 400);
}

$hash = hash('sha256', $token);

$stmt = $pdo->prepare("SELECT expira_en, id_usuario FROM password_reset_tokens WHERE token_hash = ? LIMIT 1");
$stmt->execute([$hash]);
$tokenRow = $stmt->fetch();

if (!$tokenRow) {
    jsonError('El enlace de recuperación es inválido o ya ha sido utilizado.', 400);
}

if (strtotime($tokenRow['expira_en']) < time()) {
    jsonError('El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.', 400);
}

jsonSuccess(['valido' => true], 'Token válido.');
