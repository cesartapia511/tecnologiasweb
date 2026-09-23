<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getJsonInput();
    $correo = trim($data['correo'] ?? '');

    if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        jsonError('Correo inválido', 400, 'Por favor ingresa un correo electrónico válido.');
    }

    $stmt = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE LOWER(correo) = LOWER(?) LIMIT 1");
    $stmt->execute([$correo]);
    $usuario = $stmt->fetch();

    $recovery_url = null;

    if ($usuario) {
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);
        $expira = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $stmtToken = $pdo->prepare("INSERT INTO password_reset_tokens (id_usuario, token_hash, expira_en) VALUES (?, ?, ?)");
        $stmtToken->execute([$usuario['id_usuario'], $hash, $expira]);

        // NOTA: Como no hay servidor SMTP configurado, no enviamos correo. 
        // En entorno de desarrollo local, generamos la URL para poder probar.
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
        $host = "localhost:5173"; // Por defecto Vite usa el puerto 5173
        
        $recovery_url = $protocol . $host . "/restablecer-contrasena?token=" . $token;
    }

    // Por seguridad, siempre mostramos el mismo mensaje exista o no el correo
    // Incluimos recovery_url en desarrollo para permitir el flujo sin SMTP
    jsonSuccess(['recovery_url' => $recovery_url], 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.');
} else {
    jsonError('Método no permitido', 405);
}
