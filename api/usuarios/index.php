<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new UsuarioModel($pdo);

if ($method === 'GET') {
    requerirPermiso($pdo, 'listar_usuario');
    $usuarios = $model->obtenerTodos();
    jsonSuccess($usuarios, 'Usuarios obtenidos correctamente');
} elseif ($method === 'POST') {
    $usuarioAuth = requerirPermiso($pdo, 'crear_usuario');
    $data = getJsonInput();
    
    $id_rol   = isset($data['id_rol']) ? (int)$data['id_rol'] : 0;
    $nombre   = trim($data['nombre'] ?? '');
    $apellido = trim($data['apellido'] ?? '');
    $correo   = trim($data['correo'] ?? '');
    $usuario  = trim($data['usuario'] ?? '');
    $clave    = trim($data['clave'] ?? '');
    $telefono = trim($data['telefono'] ?? '');
    $estado   = in_array($data['estado'] ?? 'activo', ['activo', 'inactivo']) ? $data['estado'] : 'activo';

    $errores = [];

    if (empty($nombre) || mb_strlen($nombre) < 2 || mb_strlen($nombre) > 100) {
        $errores['nombre'] = 'El nombre es obligatorio y debe tener entre 2 y 100 caracteres.';
    }

    if (empty($apellido) || mb_strlen($apellido) < 2 || mb_strlen($apellido) > 100) {
        $errores['apellido'] = 'El apellido es obligatorio y debe tener entre 2 y 100 caracteres.';
    }

    if (empty($correo) || !filter_var($correo, FILTER_VALIDATE_EMAIL) || mb_strlen($correo) > 150) {
        $errores['correo'] = 'Debe proporcionar una dirección de correo electrónico válida.';
    }

    if (empty($usuario) || mb_strlen($usuario) < 3 || mb_strlen($usuario) > 50 || !preg_match('/^[a-zA-Z0-9._-]+$/', $usuario)) {
        $errores['usuario'] = 'El nombre de usuario debe tener entre 3 y 50 caracteres (solo letras, números, puntos o guiones).';
    }

    if (empty($clave) || mb_strlen($clave) < 6) {
        $errores['clave'] = 'La contraseña es obligatoria y debe tener al menos 6 caracteres.';
    }

    if (!empty($telefono) && (!preg_match('/^[0-9+\s-]{7,20}$/', $telefono))) {
        $errores['telefono'] = 'El formato de teléfono es inválido (debe contener entre 7 y 20 dígitos numéricos).';
    }

    // Validar rol existente
    if ($id_rol <= 0) {
        $errores['id_rol'] = 'Debe seleccionar un rol válido para el usuario.';
    } else {
        $stmtRol = $pdo->prepare("SELECT id_rol FROM roles WHERE id_rol = ?");
        $stmtRol->execute([$id_rol]);
        if (!$stmtRol->fetch()) {
            $errores['id_rol'] = "El rol especificado con ID #$id_rol no existe en el sistema.";
        }
    }

    if (!empty($errores)) {
        jsonError('Datos de usuario inválidos', 400, 'Verifica los campos obligatorios y sus formatos.', $errores);
    }

    // Validar registros duplicados (usuario o correo)
    $stmtDupU = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE LOWER(usuario) = LOWER(?) LIMIT 1");
    $stmtDupU->execute([$usuario]);
    if ($stmtDupU->fetch()) {
        jsonError('Nombre de usuario ya en uso', 409, "El nombre de usuario '@$usuario' ya ha sido registrado por otra cuenta.");
    }

    $stmtDupC = $pdo->prepare("SELECT id_usuario FROM usuarios WHERE LOWER(correo) = LOWER(?) LIMIT 1");
    $stmtDupC->execute([$correo]);
    if ($stmtDupC->fetch()) {
        jsonError('Correo electrónico ya registrado', 409, "El correo electrónico '$correo' ya se encuentra registrado.");
    }

    try {
        $hash = password_hash($clave, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO usuarios (id_rol, nombre, apellido, correo, usuario, contrasena_hash, telefono, estado) 
                               VALUES (:id_rol, :nombre, :apellido, :correo, :usuario, :hash, :telefono, :estado)");
        $stmt->execute([
            ':id_rol'   => $id_rol,
            ':nombre'   => $nombre,
            ':apellido' => $apellido,
            ':correo'   => $correo,
            ':usuario'  => $usuario,
            ':hash'     => $hash,
            ':telefono' => $telefono ?: null,
            ':estado'   => $estado,
        ]);
        $newId = (int)$pdo->lastInsertId();

        // Crear registro de tutor o estudiante correspondiente
        if ($id_rol === 2) {
            $stmtTutor = $pdo->prepare("INSERT INTO tutores (id_usuario, especialidad, biografia) VALUES (?, ?, ?)");
            $stmtTutor->execute([$newId, $data['especialidad'] ?? 'Docente Tutor UPDS', $data['biografia'] ?? 'Docente tutor asignado para reforzamiento académico.']);
        } elseif ($id_rol === 3) {
            $id_carrera = !empty($data['id_carrera']) ? (int)$data['id_carrera'] : 1;
            $semestre = !empty($data['semestre']) ? (int)$data['semestre'] : 1;
            $ru = !empty($data['registro_universitario']) ? trim($data['registro_universitario']) : ('RU-' . date('Y') . '-' . str_pad($newId, 4, '0', STR_PAD_LEFT));

            $stmtEst = $pdo->prepare("INSERT INTO estudiantes (id_usuario, id_carrera, semestre, registro_universitario) VALUES (?, ?, ?, ?)");
            $stmtEst->execute([$newId, $id_carrera, $semestre, $ru]);
        }

        jsonSuccess([
            'id_usuario' => $newId,
            'usuario'    => $usuario,
            'correo'     => $correo,
            'nombre'     => $nombre,
            'apellido'   => $apellido,
            'id_rol'     => $id_rol
        ], 'Usuario creado con éxito', 201);
    } catch (PDOException $e) {
        jsonError('Error al crear usuario', 500, 'Error interno en la base de datos: ' . $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET y POST en esta ruta.');
}
