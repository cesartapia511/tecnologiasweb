<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$data = getJsonInput();
$token = trim($data['token'] ?? '');
$nueva_contrasena = $data['nueva_contrasena'] ?? '';

if (empty($token) || empty($nueva_contrasena)) {
    jsonError('Faltan datos requeridos', 400);
}

if (mb_strlen($nueva_contrasena) < 6) {
    jsonError('La contraseña debe tener al menos 6 caracteres.', 400);
}

$hash = hash('sha256', $token);

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("SELECT id_usuario, expira_en FROM password_reset_tokens WHERE token_hash = ? FOR UPDATE");
    $stmt->execute([$hash]);
    $tokenRow = $stmt->fetch();

    if (!$tokenRow) {
        $pdo->rollBack();
        jsonError('El enlace de recuperación es inválido o ya fue utilizado.', 400);
    }

    if (strtotime($tokenRow['expira_en']) < time()) {
        $pdo->rollBack();
        jsonError('El enlace de recuperación ha expirado. Por favor, solicita uno nuevo.', 400);
    }

    // Generar nuevo hash bcrypt
    $nuevo_hash_pass = password_hash($nueva_contrasena, PASSWORD_DEFAULT);
    
    // Actualizar contraseña
    $stmtUpdate = $pdo->prepare("UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?");
    $stmtUpdate->execute([$nuevo_hash_pass, $tokenRow['id_usuario']]);

    // Eliminar el token usado para evitar su reutilización
    $stmtDelete = $pdo->prepare("DELETE FROM password_reset_tokens WHERE token_hash = ?");
    $stmtDelete->execute([$hash]);

    $pdo->commit();
    jsonSuccess(null, 'Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión.');

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    jsonError('Error al procesar la solicitud.', 500);
}
