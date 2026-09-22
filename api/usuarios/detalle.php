<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int)$_GET['id'] : null;
$model = new UsuarioModel($pdo);

if (!$id || $id <= 0) {
    jsonError('ID de usuario inválido o no especificado', 400, 'Debes enviar un identificador numérico de usuario válido.');
}

if ($method === 'GET') {
    $usuarioAuth = requerirAutenticacion($pdo);
    // Permitir si es el mismo usuario consultando su perfil o si tiene permiso listar_usuario
    if ($usuarioAuth['id_usuario'] !== $id && !verificarPermiso($usuarioAuth, 'listar_usuario')) {
        jsonError('No tiene permisos para ver este usuario', 403, 'Solo puedes consultar tu propio perfil o requieres el permiso listar_usuario.');
    }

    $usuario = $model->obtenerPorId($id);
    if (!$usuario) {
        jsonError('Usuario no encontrado', 404, "No existe ningún usuario registrado con el ID #$id.");
    }
    unset($usuario['contrasena_hash']);
    jsonSuccess($usuario, 'Detalle de usuario obtenido correctamente');
} elseif ($method === 'PUT') {
    $usuarioAuth = requerirAutenticacion($pdo);
    $esMismoUsuario = ($usuarioAuth['id_usuario'] === $id);
    $tienePermisoEditar = verificarPermiso($usuarioAuth, 'editar_usuario');

    if (!$esMismoUsuario && !$tienePermisoEditar) {
        jsonError('No tiene permisos para editar este usuario', 403, 'Se requiere el permiso de administración editar_usuario.');
    }

    $usuarioExistente = $model->obtenerPorId($id);
    if (!$usuarioExistente) {
        jsonError('Usuario no encontrado', 404, "No se puede editar: el usuario #$id no existe.");
    }

    $data = getJsonInput();
    
    // Si es el mismo usuario editando su perfil desde el Header, conserva su rol y estado
    $id_rol   = ($tienePermisoEditar && isset($data['id_rol'])) ? (int)$data['id_rol'] : (int)$usuarioExistente['id_rol'];
    $nombre   = trim($data['nombre'] ?? $usuarioExistente['nombre']);
    $apellido = trim($data['apellido'] ?? $usuarioExistente['apellido']);
    $correo   = trim($data['correo'] ?? $usuarioExistente['correo']);
    $usuario  = trim($data['usuario'] ?? $usuarioExistente['usuario']);
    $telefono = trim($data['telefono'] ?? ($usuarioExistente['telefono'] ?? ''));
    $estado   = ($tienePermisoEditar && isset($data['estado'])) ? $data['estado'] : $usuarioExistente['estado'];
    $clave    = trim($data['clave'] ?? '');
    $contrasena_actual = trim($data['contrasena_actual'] ?? '');

    $errores = [];

    if (empty($nombre) || mb_strlen($nombre) < 2 || mb_strlen($nombre) > 100) {
        $errores['nombre'] = 'El nombre debe tener entre 2 y 100 caracteres.';
    }

    if (empty($apellido) || mb_strlen($apellido) < 2 || mb_strlen($apellido) > 100) {
        $errores['apellido'] = 'El apellido debe tener entre 2 y 100 caracteres.';
    }

    if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 150) {
        $errores['correo'] = 'El correo electrónico no tiene un formato válido.';
    }

    if (empty($usuario) || mb_strlen($usuario) < 3 || mb_strlen($usuario) > 50 || !preg_match('/^[a-zA-Z0-9._-]+$/', $usuario)) {
        $errores['usuario'] = 'El nombre de usuario debe tener entre 3 y 50 caracteres (sin caracteres especiales).';
    }

    // Si se está intentando cambiar la contraseña
    if (!empty($clave)) {
        if (mb_strlen($clave) < 6) {
            $errores['clave'] = 'La nueva contraseña debe tener al menos 6 caracteres.';
        }
        
        // Si no es admin editando a otro, exigimos la contraseña actual
        if ($esMismoUsuario) {
            if (empty($contrasena_actual)) {
                $errores['contrasena_actual'] = 'Debes ingresar tu contraseña actual para confirmar el cambio.';
            } elseif (!password_verify($contrasena_actual, $usuarioExistente['contrasena_hash'])) {
                $errores['contrasena_actual'] = 'La contraseña actual ingresada es incorrecta.';
            }
        }
    }

    if (!empty($telefono) && !preg_match('/^[0-9+\s-]{7,20}$/', $telefono)) {
        $errores['telefono'] = 'El teléfono debe contener entre 7 y 20 dígitos.';
    }

    if (!empty($errores)) {
        jsonError('Datos de usuario inválidos', 400, 'Verifica los campos requeridos.', $errores);
    }

    // Validar duplicados en otros usuarios
    $stmtDupU = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE LOWER(usuario) = LOWER(?) AND id_usuario != ? LIMIT 1");
    $stmtDupU->execute([$usuario, $id]);
    if ($stmtDupU->fetch()) {
        jsonError('Nombre de usuario en uso', 409, "El usuario '@$usuario' ya está siendo utilizado por otra cuenta.");
    }

    $stmtDupC = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE LOWER(correo) = LOWER(?) AND id_usuario != ? LIMIT 1");
    $stmtDupC->execute([$correo, $id]);
    if ($stmtDupC->fetch()) {
        jsonError('Correo electrónico en uso', 409, "El correo '$correo' ya está siendo utilizado por otra cuenta.");
    }

    try {
        $stmt = $pdo->prepare("
            UPDATE usuarios 
            SET id_rol = :id_rol, nombre = :nombre, apellido = :apellido,
                correo = :correo, usuario = :usuario, telefono = :telefono, estado = :estado
            WHERE id_usuario = :id
        ");
        $stmt->execute([
            ':id_rol'   => $id_rol,
            ':nombre'   => $nombre,
            ':apellido' => $apellido,
            ':correo'   => $correo,
            ':usuario'  => $usuario,
            ':telefono' => $telefono ?: null,
            ':estado'   => $estado,
            ':id'       => $id,
        ]);

        // Si se envió una nueva contraseña y pasó las validaciones
        if (!empty($clave)) {
            $hash = password_hash($clave, PASSWORD_DEFAULT);
            $stmtP = $pdo->prepare("UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?");
            $stmtP->execute([$hash, $id]);
        }

        jsonSuccess([
            'id_usuario' => $id,
            'nombre'     => $nombre,
            'apellido'   => $apellido,
            'usuario'    => $usuario,
            'correo'     => $correo,
            'telefono'   => $telefono,
            'estado'     => $estado,
            'foto_perfil'=> $usuarioExistente['foto_perfil'] ?? null
        ], 'Usuario actualizado correctamente');
    } catch (PDOException $e) {
        jsonError('Error al actualizar usuario', 500, 'Error en el servidor: ' . $e->getMessage());
    }
} elseif ($method === 'DELETE') {
    $usuarioAuth = requerirPermiso($pdo, 'eliminar_usuario');

    if ($usuarioAuth['id_usuario'] === $id) {
        jsonError('Acción no permitida', 400, 'Por seguridad, no puedes eliminar tu propia cuenta en sesión activa.');
    }

    if ($id === 1) {
        jsonError('Acción protegida', 403, 'No se puede eliminar la cuenta del Administrador Principal del sistema.');
    }

    $usuario = $model->obtenerPorId($id);
    if (!$usuario) {
        jsonError('Usuario no encontrado', 404, "No existe ningún usuario registrado con ID #$id.");
    }

    // Verificar si tiene tutorías como tutor o estudiante
    $stmtTutorias = $pdo->prepare("
        SELECT COUNT(*) FROM tutorias t
        LEFT JOIN tutores tu ON t.id_tutor = tu.id_tutor
        LEFT JOIN estudiantes es ON t.id_estudiante = es.id_estudiante
        WHERE tu.id_usuario = ? OR es.id_usuario = ?
    ");
    $stmtTutorias->execute([$id, $id]);
    $totalTutorias = (int)$stmtTutorias->fetchColumn();

    if ($totalTutorias > 0) {
        jsonError('No se puede eliminar este usuario', 409, "El usuario tiene $totalTutorias tutoría(s) agendada(s) o registradas en el historial. Se recomienda cambiar su estado a 'inactivo'.");
    }

    try {
        $model->eliminar($id);
        jsonSuccess(['id_usuario' => $id], 'Usuario eliminado correctamente del sistema');
    } catch (PDOException $e) {
        jsonError('No se pudo eliminar el usuario', 500, 'Error de clave foránea o integridad referencial: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET, PUT y DELETE en esta ruta.');
}
