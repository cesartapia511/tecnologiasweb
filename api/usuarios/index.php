<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new UsuarioModel($pdo);

if ($method === 'GET') {
    $usuarios = $model->obtenerTodos();
    jsonSuccess($usuarios);
} elseif ($method === 'POST') {
    $data = getJsonInput();
    
    $id_rol = $data['id_rol'] ?? '';
    $nombre = trim($data['nombre'] ?? '');
    $apellido = trim($data['apellido'] ?? '');
    $correo = trim($data['correo'] ?? '');
    $usuario = trim($data['usuario'] ?? '');
    $clave = $data['clave'] ?? 'password';

    if (empty($id_rol) || empty($nombre) || empty($apellido) || empty($correo) || empty($usuario)) {
        jsonError('Todos los campos obligatorios deben ser completados');
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        jsonError('El formato de correo no es válido');
    }

    try {
        $hash = password_hash($clave, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (id_rol, nombre, apellido, correo, usuario, contrasena_hash, estado) 
                               VALUES (:id_rol, :nombre, :apellido, :correo, :usuario, :hash, 'activo')");
        $stmt->execute([
            ':id_rol'   => $id_rol,
            ':nombre'   => $nombre,
            ':apellido' => $apellido,
            ':correo'   => $correo,
            ':usuario'  => $usuario,
            ':hash'     => $hash,
        ]);
        $newId = $pdo->lastInsertId();

        // Si es tutor o estudiante, crear registro correspondiente si no existe
        if ($id_rol == 2) {
            $stmtTutor = $pdo->prepare("INSERT INTO tutores (id_usuario, especialidad, biografia) VALUES (?, ?, ?)");
            $stmtTutor->execute([$newId, $data['especialidad'] ?? 'Docente Tutor UPDS', $data['biografia'] ?? '']);
        } elseif ($id_rol == 3) {
            $stmtEst = $pdo->prepare("INSERT INTO estudiantes (id_usuario, id_carrera, semestre, registro_universitario) VALUES (?, ?, ?, ?)");
            $stmtEst->execute([$newId, $data['id_carrera'] ?? 1, $data['semestre'] ?? 1, $data['registro_universitario'] ?? ('RU-' . rand(10000, 99999))]);
        }

        jsonSuccess(['id_usuario' => $newId], 'Usuario creado con éxito', 201);
    } catch (PDOException $e) {
        if ($e->getCode() == 23000) {
            jsonError('El nombre de usuario o correo ya se encuentra registrado');
        }
        jsonError('Error al crear usuario: ' . $e->getMessage(), 500);
    }
} else {
    jsonError('Método no soportado', 405);
}
