<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes POST en esta ruta.');
}

$usuarioAuth = requerirAutenticacion($pdo);
$id_usuario = $usuarioAuth['id_usuario'];

if (!isset($_FILES['foto'])) {
    jsonError('No se recibió ningún archivo', 400, 'Debe adjuntar una imagen en el campo "foto".');
}

$file = $_FILES['foto'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    jsonError('Error al subir el archivo', 400, 'Hubo un error en la carga del archivo.');
}

$maxSize = 2 * 1024 * 1024; // 2 MB
if ($file['size'] > $maxSize) {
    jsonError('Archivo demasiado grande', 400, 'La fotografía no puede superar los 2MB.');
}

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
if (!in_array($mime, $allowedMimes)) {
    jsonError('Formato inválido', 400, 'Solo se admiten imágenes JPG, JPEG, PNG y WebP.');
}

$ext = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
    default => 'jpg'
};

$uploadDir = __DIR__ . '/../../uploads/perfiles/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Para mayor seguridad, invalidar cualquier ejecución PHP
$htaccessPath = $uploadDir . '.htaccess';
if (!file_exists($htaccessPath)) {
    file_put_contents($htaccessPath, "RemoveHandler .php .phtml .php3 .php4 .php5 .php8\nRemoveType .php .phtml .php3 .php4 .php5 .php8\nphp_flag engine off\n");
}

$filename = 'avatar_' . $id_usuario . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
$targetPath = $uploadDir . $filename;

// Si el usuario ya tenía foto, intentar borrarla
$stmtGet = $pdo->prepare("SELECT foto_perfil FROM usuarios WHERE id_usuario = ?");
$stmtGet->execute([$id_usuario]);
$oldFoto = $stmtGet->fetchColumn();

if ($oldFoto && file_exists($uploadDir . $oldFoto)) {
    unlink($uploadDir . $oldFoto);
}

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
    jsonError('Error al guardar el archivo', 500, 'No se pudo mover la imagen al directorio destino.');
}

// Actualizar BD
$stmtUpdate = $pdo->prepare("UPDATE usuarios SET foto_perfil = ? WHERE id_usuario = ?");
$stmtUpdate->execute([$filename, $id_usuario]);

jsonSuccess(['foto_perfil' => $filename], 'Fotografía actualizada correctamente.');
