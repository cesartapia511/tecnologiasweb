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
    $mail_mode = getenv('MAIL_MODE') ?: 'sandbox';

    if ($mail_mode === 'smtp') {
        // En entorno SMTP no conectamos a servidor, pero evitamos distinguir cuentas devolviendo success falso internamente o mostrando error sin conexión.
        jsonError('Servicio no disponible', 500, 'El canal SMTP no está configurado en este entorno.');
    }

    if ($usuario) {
        $token = bin2hex(random_bytes(32));
        $hash = hash('sha256', $token);
        $expira = date('Y-m-d H:i:s', strtotime('+15 minutes'));

        try {
            $pdo->beginTransaction();

            // Eliminar tokens anteriores para cumplir el requerimiento
            $stmtDelete = $pdo->prepare("DELETE FROM password_reset_tokens WHERE id_usuario = ?");
            $stmtDelete->execute([$usuario['id_usuario']]);

            $stmtToken = $pdo->prepare("INSERT INTO password_reset_tokens (id_usuario, token_hash, expira_en) VALUES (?, ?, ?)");
            $stmtToken->execute([$usuario['id_usuario'], $hash, $expira]);

            $pdo->commit();

            if ($mail_mode === 'sandbox') {
                $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                $host = "localhost:5174";
                $recovery_url = $protocol . $host . "/restablecer-contrasena?token=" . $token;
            }
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            error_log('Error al generar token de recuperación: ' . $e->getMessage());
            jsonError('Error interno del servidor', 500, 'No se pudo procesar la solicitud.');
        }
    }

    $response_data = [];
    if ($recovery_url) {
        $response_data['recovery_url'] = $recovery_url;
    }

    // Respuesta general de seguridad (idéntica para éxito y usuario no existente)
    jsonSuccess($response_data, 'Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.');
} else {
    jsonError('Método no permitido', 405);
}
