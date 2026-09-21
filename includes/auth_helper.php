<?php
// =========================================================
// HELPER DE AUTENTICACIÓN Y AUTORIZACIÓN BASADO EN PERMISOS (RBAC)
// UPDS Tarija - Sistema Web de Apoyo Académico para Tutorías
// =========================================================

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/PermisoModel.php';

const AUTH_SECRET_KEY = 'UPDS_TARIJA_TUTORIAS_SECRET_KEY_2026';

/**
 * Obtener el token Bearer del encabezado HTTP de la petición
 */
function getBearerToken() {
    $header = null;

    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = trim($_SERVER['HTTP_AUTHORIZATION']);
    } elseif (isset($_SERVER['Authorization'])) {
        $header = trim($_SERVER['Authorization']);
    } elseif (function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $headers = array_combine(array_map('ucwords', array_keys($headers)), array_values($headers));
        if (isset($headers['Authorization'])) {
            $header = trim($headers['Authorization']);
        }
    }

    if ($header && preg_match('/Bearer\s(\S+)/i', $header, $matches)) {
        return $matches[1];
    }

    // Alternativa: consultar $_GET['token'] o sesión si existe
    if (isset($_GET['token']) && !empty($_GET['token'])) {
        return trim($_GET['token']);
    }

    if (session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['token'])) {
        return $_SESSION['token'];
    }

    return null;
}

/**
 * Generar un token seguro firmado con HMAC-SHA256
 */
function generarToken($usuario) {
    $payload = [
        'id_usuario' => $usuario['id_usuario'],
        'usuario'    => $usuario['usuario'],
        'id_rol'     => $usuario['id_rol'],
        'timestamp'  => time(),
    ];
    $json = json_encode($payload);
    $b64Payload = base64_encode($json);
    $signature = hash_hmac('sha256', $b64Payload, AUTH_SECRET_KEY);
    return $b64Payload . '.' . $signature;
}

/**
 * Decodificar y validar el token de usuario
 */
function decodificarToken($token) {
    if (empty($token)) {
        return null;
    }

    // Formato 1: payload.signature (HMAC seguro)
    if (strpos($token, '.') !== false) {
        $partes = explode('.', $token, 2);
        if (count($partes) === 2) {
            list($b64Payload, $signature) = $partes;
            $expectedSignature = hash_hmac('sha256', $b64Payload, AUTH_SECRET_KEY);
            if (hash_equals($expectedSignature, $signature)) {
                $decoded = json_decode(base64_decode($b64Payload), true);
                if (is_array($decoded) && isset($decoded['id_usuario'])) {
                    return $decoded['id_usuario'];
                }
            }
        }
    }

    // Formato 2: compatibilidad con base64("id:usuario:timestamp")
    $decodedRaw = base64_decode($token, true);
    if ($decodedRaw && strpos($decodedRaw, ':') !== false) {
        $partes = explode(':', $decodedRaw);
        if (count($partes) >= 2 && is_numeric($partes[0])) {
            return (int)$partes[0];
        }
    }

    return null;
}

/**
 * Obtener el usuario autenticado actual a partir del token o sesión
 */
function obtenerUsuarioAutenticado($pdo) {
    static $usuarioCache = null;
    if ($usuarioCache !== null) {
        return $usuarioCache;
    }

    $idUsuario = null;

    // 1. Intentar desde Bearer Token
    $token = getBearerToken();
    if ($token) {
        $idUsuario = decodificarToken($token);
    }

    // 2. Si no hay token en encabezado, intentar desde sesión PHP tradicional
    if (!$idUsuario && session_status() === PHP_SESSION_ACTIVE && isset($_SESSION['id_usuario'])) {
        $idUsuario = (int)$_SESSION['id_usuario'];
    }

    if (!$idUsuario) {
        return null;
    }

    // Consultar usuario en base de datos asegurando estado 'activo'
    $stmt = $pdo->prepare("
        SELECT u.id_usuario, u.id_rol, u.nombre, u.apellido, u.correo, u.usuario, u.telefono, u.estado,
               r.nombre_rol
        FROM usuarios u
        INNER JOIN roles r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = ? AND u.estado = 'activo'
        LIMIT 1
    ");
    $stmt->execute([$idUsuario]);
    $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$usuario) {
        return null;
    }

    // Normalizar nombres de roles
    $usuario['rol'] = strtolower($usuario['nombre_rol']);

    // Cargar permisos del usuario desde la base de datos
    $permisoModel = new PermisoModel($pdo);
    $usuario['permisos'] = $permisoModel->obtenerPorUsuario($usuario['id_usuario']);

    // Cargar IDs de perfil de tutor o estudiante si aplican
    if ($usuario['rol'] === 'tutor') {
        $stmtT = $pdo->prepare("SELECT id_tutor, especialidad FROM tutores WHERE id_usuario = ?");
        $stmtT->execute([$usuario['id_usuario']]);
        $tut = $stmtT->fetch(PDO::FETCH_ASSOC);
        if ($tut) {
            $usuario['id_tutor'] = (int)$tut['id_tutor'];
            $usuario['especialidad'] = $tut['especialidad'];
        }
    } elseif ($usuario['rol'] === 'estudiante') {
        $stmtE = $pdo->prepare("SELECT id_estudiante, id_carrera, semestre, registro_universitario FROM estudiantes WHERE id_usuario = ?");
        $stmtE->execute([$usuario['id_usuario']]);
        $est = $stmtE->fetch(PDO::FETCH_ASSOC);
        if ($est) {
            $usuario['id_estudiante'] = (int)$est['id_estudiante'];
            $usuario['id_carrera'] = (int)$est['id_carrera'];
            $usuario['semestre'] = (int)$est['semestre'];
            $usuario['registro_universitario'] = $est['registro_universitario'];
        }
    }

    $usuarioCache = $usuario;
    return $usuario;
}

/**
 * Función reutilizable para verificar si un usuario tiene un permiso específico
 *
 * @param array $usuario Datos del usuario con sus permisos y rol
 * @param string $permiso Nombre del permiso a verificar (ej. 'crear_carrera')
 * @return bool true si tiene el permiso, false en caso contrario
 */
function verificarPermiso($usuario, $permiso) {
    if (!$usuario || !is_array($usuario)) {
        return false;
    }

    // El Administrador del sistema tiene acceso total y bypass de permisos
    $rol = strtolower($usuario['rol'] ?? $usuario['nombre_rol'] ?? '');
    if ($rol === 'administrador') {
        return true;
    }

    $permisosUsuario = $usuario['permisos'] ?? [];

    // Verificación directa
    if (in_array($permiso, $permisosUsuario, true)) {
        return true;
    }

    // Mapa de equivalencias singular/plural para máxima tolerancia
    $equivalencias = [
        'listar_usuarios' => 'listar_usuario',
        'listar_usuario'  => 'listar_usuarios',
        'listar_roles'    => 'listar_rol',
        'listar_rol'      => 'listar_roles',
        'listar_carreras' => 'listar_carrera',
        'listar_carrera'  => 'listar_carreras',
        'listar_materias' => 'listar_materia',
        'listar_materia'  => 'listar_materias',
        'listar_tutores'  => 'listar_tutor',
        'listar_tutor'    => 'listar_tutores',
        'listar_estudiantes' => 'listar_estudiante',
        'listar_estudiante'  => 'listar_estudiantes',
        'listar_tutorias' => 'listar_tutoria',
        'listar_tutoria'  => 'listar_tutorias',
        'listar_evaluaciones' => 'listar_evaluacion',
        'listar_evaluacion'   => 'listar_evaluaciones',
        'listar_accesos'  => 'listar_acceso',
        'listar_acceso'   => 'listar_accesos',
        'listar_disponibilidades' => 'listar_disponibilidad',
        'listar_disponibilidad'   => 'listar_disponibilidades',
    ];

    if (isset($equivalencias[$permiso]) && in_array($equivalencias[$permiso], $permisosUsuario, true)) {
        return true;
    }

    return false;
}

/**
 * Exigir autenticación obligatoria. Si no está autenticado, responde JSON 401 y termina la ejecución.
 *
 * @param PDO $pdo
 * @return array Usuario autenticado
 */
function requerirAutenticacion($pdo) {
    $usuario = obtenerUsuarioAutenticado($pdo);
    if (!$usuario) {
        jsonError('Usuario no autenticado o sesión expirada', 401, 'Debes iniciar sesión con tus credenciales institucionales para acceder a este recurso.');
    }
    return $usuario;
}

/**
 * Exigir un permiso obligatorio.
 * Flujo estricto:
 * 1. Valida que el usuario esté autenticado (401 si no lo está).
 * 2. Obtiene el rol del usuario.
 * 3. Verifica el permiso requerido con verificarPermiso($usuario, $permiso).
 * 4. Si no tiene permiso, responde JSON 403 con mensaje claro y motivo descriptivo.
 *
 * @param PDO $pdo
 * @param string $permiso
 * @return array Usuario autenticado
 */
function requerirPermiso($pdo, $permiso) {
    $usuario = requerirAutenticacion($pdo);

    if (!verificarPermiso($usuario, $permiso)) {
        $rolNombre = strtoupper($usuario['rol'] ?? 'INVITADO');
        $motivo = "Tu perfil institucional ($rolNombre) no cuenta con el privilegio requerido '$permiso' para ejecutar esta operación.";
        jsonError('No tiene permisos para realizar esta acción', 403, $motivo);
    }

    return $usuario;
}
