<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$model = new UsuarioModel($pdo);

if (!$id) {
    jsonError('ID de usuario no especificado', 400);
}

if ($method === 'GET') {
    $usuario = $model->obtenerPorId($id);
    if (!$usuario) {
        jsonError('Usuario no encontrado', 404);
    }
    unset($usuario['contrasena_hash']);
    jsonSuccess($usuario);
} elseif ($method === 'PUT') {
    $data = getJsonInput();
    
    $datos = [
        'id_rol'   => $data['id_rol'] ?? '',
        'nombre'   => trim($data['nombre'] ?? ''),
        'apellido' => trim($data['apellido'] ?? ''),
        'correo'   => trim($data['correo'] ?? ''),
        'usuario'  => trim($data['usuario'] ?? ''),
        'estado'   => $data['estado'] ?? 'activo',
    ];

    if (empty($datos['id_rol']) || empty($datos['nombre']) || empty($datos['apellido']) || empty($datos['correo']) || empty($datos['usuario'])) {
        jsonError('Todos los campos requeridos deben ser completados');
    }

    try {
        $model->actualizar($id, $datos);

        // Si enviaron contraseña nueva, actualizarla
        if (!empty($data['clave'])) {
            $hash = password_hash($data['clave'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE usuarios SET contrasena_hash = ? WHERE id_usuario = ?");
            $stmt->execute([$hash, $id]);
        }

        jsonSuccess(null, 'Usuario actualizado correctamente');
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonError('El usuario o correo ya está en uso por otra cuenta');
        }
        jsonError('Error al actualizar usuario: ' . $e->getMessage(), 500);
    }
} elseif ($method === 'DELETE') {
    try {
        $model->eliminar($id);
        jsonSuccess(null, 'Usuario eliminado correctamente');
    } catch (PDOException $e) {
        jsonError('No se puede eliminar este usuario porque tiene tutorías, registros de tutor o estudiante vinculados.', 409);
    }
} else {
    jsonError('Método no permitido', 405);
}
