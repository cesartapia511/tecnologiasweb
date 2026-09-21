<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';
require_once __DIR__ . '/../../models/TutorModel.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';
require_once __DIR__ . '/../../models/PermisoModel.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405, 'Este endpoint solo admite solicitudes HTTP POST.');
}

$input = getJsonInput();
$usuarioInput = trim($input['usuario'] ?? '');
$contrasenaInput = $input['contrasena'] ?? '';

if (empty($usuarioInput) || empty($contrasenaInput)) {
    jsonError('Debe proporcionar usuario o correo y contraseña', 400, 'Los campos usuario/correo y contraseña son obligatorios.');
}

$usuarioModel = new UsuarioModel($pdo);
$usuario = $usuarioModel->obtenerPorUsuario($usuarioInput);

$ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

if ($usuario && $usuario['estado'] === 'activo' && password_verify($contrasenaInput, $usuario['contrasena_hash'])) {
    // Registrar acceso exitoso en bitácora de auditoría
    try {
        $stmt = $pdo->prepare("INSERT INTO registro_accesos (id_usuario, ip_origen, resultado) VALUES (?, ?, 'exitoso')");
        $stmt->execute([$usuario['id_usuario'], $ip]);
    } catch (Exception $e) {}

    // Eliminar el hash de la respuesta JSON por seguridad
    unset($usuario['contrasena_hash']);

    // Cargar permisos oficiales asignados a este usuario
    $permisoModel = new PermisoModel($pdo);
    $usuario['permisos'] = $permisoModel->obtenerPorUsuario($usuario['id_usuario']);

    // Normalizar propiedad de rol
    $usuario['rol'] = strtolower($usuario['nombre_rol']);

    // Cargar detalles específicos según rol
    if ($usuario['rol'] === 'tutor') {
        $tutorModel = new TutorModel($pdo);
        $perfilTutor = $tutorModel->obtenerPorUsuario($usuario['id_usuario']);
        if ($perfilTutor) {
            $usuario['id_tutor'] = (int)$perfilTutor['id_tutor'];
            $usuario['especialidad'] = $perfilTutor['especialidad'];
            $usuario['biografia'] = $perfilTutor['biografia'];
        }
    } else if ($usuario['rol'] === 'estudiante') {
        $estModel = new EstudianteModel($pdo);
        $perfilEst = $estModel->obtenerPorUsuario($usuario['id_usuario']);
        if ($perfilEst) {
            $usuario['id_estudiante'] = (int)$perfilEst['id_estudiante'];
            $usuario['id_carrera'] = (int)$perfilEst['id_carrera'];
            $usuario['semestre'] = (int)$perfilEst['semestre'];
            $usuario['registro_universitario'] = $perfilEst['registro_universitario'];
            $usuario['nombre_carrera'] = $perfilEst['nombre_carrera'] ?? '';
        }
    }

    // Token firmado con HMAC-SHA256 para mantener sesión en frontend React
    $usuario['token'] = generarToken($usuario);

    jsonSuccess($usuario, 'Inicio de sesión exitoso');
} else {
    // Registrar intento fallido
    if ($usuario) {
        try {
            $stmt = $pdo->prepare("INSERT INTO registro_accesos (id_usuario, ip_origen, resultado) VALUES (?, ?, 'fallido')");
            $stmt->execute([$usuario['id_usuario'], $ip]);
        } catch (Exception $e) {}
    }
    
    $motivo = 'Verifica que tu nombre de usuario y contraseña sean correctos y que tu cuenta se encuentre en estado activo.';
    jsonError('Credenciales incorrectas o usuario inactivo', 401, $motivo);
}
