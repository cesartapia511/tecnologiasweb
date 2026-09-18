<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';
require_once __DIR__ . '/../../models/TutorModel.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Método no permitido', 405);
}

$input = getJsonInput();
$usuarioInput = trim($input['usuario'] ?? '');
$contrasenaInput = $input['contrasena'] ?? '';

if (empty($usuarioInput) || empty($contrasenaInput)) {
    jsonError('Debe proporcionar usuario o correo y contraseña');
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

    // Cargar detalles específicos según rol
    if ($usuario['nombre_rol'] === 'tutor') {
        $tutorModel = new TutorModel($pdo);
        $perfilTutor = $tutorModel->obtenerPorUsuario($usuario['id_usuario']);
        if ($perfilTutor) {
            $usuario['id_tutor'] = $perfilTutor['id_tutor'];
            $usuario['especialidad'] = $perfilTutor['especialidad'];
            $usuario['biografia'] = $perfilTutor['biografia'];
        }
    } else if ($usuario['nombre_rol'] === 'estudiante') {
        $estModel = new EstudianteModel($pdo);
        $perfilEst = $estModel->obtenerPorUsuario($usuario['id_usuario']);
        if ($perfilEst) {
            $usuario['id_estudiante'] = $perfilEst['id_estudiante'];
            $usuario['id_carrera'] = $perfilEst['id_carrera'];
            $usuario['semestre'] = $perfilEst['semestre'];
            $usuario['registro_universitario'] = $perfilEst['registro_universitario'];
            $usuario['nombre_carrera'] = $perfilEst['nombre_carrera'] ?? '';
        }
    }

    // Token seguro para mantener sesión en frontend React
    $token = base64_encode($usuario['id_usuario'] . ':' . $usuario['usuario'] . ':' . time());
    $usuario['token'] = $token;

    jsonSuccess($usuario, 'Inicio de sesión exitoso');
} else {
    // Registrar intento fallido
    if ($usuario) {
        try {
            $stmt = $pdo->prepare("INSERT INTO registro_accesos (id_usuario, ip_origen, resultado) VALUES (?, ?, 'fallido')");
            $stmt->execute([$usuario['id_usuario'], $ip]);
        } catch (Exception $e) {}
    }
    jsonError('Credenciales incorrectas o usuario inactivo', 401);
}
