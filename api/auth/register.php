<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$input = getJsonInput();

$nombre = trim($input['nombre'] ?? '');
$apellido = trim($input['apellido'] ?? '');
$correo = trim($input['correo'] ?? '');
$usuario = trim($input['usuario'] ?? '');
$clave = $input['clave'] ?? '';
$id_rol = intval($input['id_rol'] ?? 3); // 3 = estudiante, 2 = tutor

if (empty($nombre) || empty($apellido) || empty($correo) || empty($usuario) || empty($clave)) {
    jsonError('Todos los campos son obligatorios.');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    jsonError('El formato de correo electrónico no es válido.');
}

if (strlen($clave) < 6) {
    jsonError('La contraseña debe tener al menos 6 caracteres.');
}

$usuarioModel = new UsuarioModel($pdo);

// Validar que no exista el usuario o correo
$existente = $usuarioModel->obtenerPorUsuario($usuario);
if ($existente) {
    jsonError('El nombre de usuario o correo ya está en uso por otra cuenta.');
}

try {
    $id_usuario = $usuarioModel->registrar([
        'id_rol'                 => $id_rol,
        'nombre'                 => $nombre,
        'apellido'               => $apellido,
        'correo'                 => $correo,
        'usuario'                => $usuario,
        'clave'                  => $clave,
        'id_carrera'             => $input['id_carrera'] ?? 1,
        'semestre'               => $input['semestre'] ?? 1,
        'registro_universitario' => $input['registro_universitario'] ?? '',
        'especialidad'           => $input['especialidad'] ?? '',
        'biografia'              => $input['biografia'] ?? '',
    ]);

    jsonSuccess([
        'id_usuario' => $id_usuario,
        'usuario'    => $usuario,
        'correo'     => $correo,
        'nombre_rol' => $id_rol === 2 ? 'tutor' : 'estudiante',
    ], '¡Registro completado exitosamente! Ahora puedes iniciar sesión con tu cuenta.', 201);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        jsonError('El usuario o correo ya se encuentra registrado.');
    }
    jsonError('Error al procesar el registro: ' . $e->getMessage(), 500);
}
