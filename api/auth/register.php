<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError(
        'Método no permitido',
        405,
        'Este endpoint solo admite solicitudes POST.'
    );
}

$input = getJsonInput();

$nombre = trim($input['nombre'] ?? '');
$apellido = trim($input['apellido'] ?? '');
$correo = trim($input['correo'] ?? '');
$usuario = trim($input['usuario'] ?? '');
$clave = $input['clave'] ?? '';
$id_rol = isset($input['id_rol']) ? (int)$input['id_rol'] : 3;

$errores = [];

/*
 * SEGURIDAD:
 * El registro público solamente permite crear:
 * 2 = tutor
 * 3 = estudiante
 *
 * El rol 1 (administrador) solamente puede ser asignado
 * desde el sistema administrativo.
 */
if (!in_array($id_rol, [2, 3], true)) {
    $errores['id_rol'] = 'El rol seleccionado no está permitido para el registro público.';
}

if ($nombre === '' || mb_strlen($nombre) < 2 || mb_strlen($nombre) > 100) {
    $errores['nombre'] = 'El nombre debe tener entre 2 y 100 caracteres.';
}

if ($apellido === '' || mb_strlen($apellido) < 2 || mb_strlen($apellido) > 100) {
    $errores['apellido'] = 'El apellido debe tener entre 2 y 100 caracteres.';
}

if (
    $correo === '' ||
    !filter_var($correo, FILTER_VALIDATE_EMAIL) ||
    mb_strlen($correo) > 150
) {
    $errores['correo'] = 'Debes proporcionar un correo electrónico válido.';
}

if (
    $usuario === '' ||
    mb_strlen($usuario) < 3 ||
    mb_strlen($usuario) > 50 ||
    !preg_match('/^[a-zA-Z0-9._-]+$/', $usuario)
) {
    $errores['usuario'] =
        'El usuario debe tener entre 3 y 50 caracteres y solo puede contener letras, números, puntos, guiones y guion bajo.';
}

if ($clave === '' || mb_strlen($clave) < 6) {
    $errores['clave'] =
        'La contraseña debe tener al menos 6 caracteres.';
}

/*
 * Validaciones específicas para estudiantes
 */
if ($id_rol === 3) {
    $id_carrera = isset($input['id_carrera'])
        ? (int)$input['id_carrera']
        : 0;

    $semestre = isset($input['semestre'])
        ? (int)$input['semestre']
        : 0;

    if ($id_carrera <= 0) {
        $errores['id_carrera'] =
            'Debes seleccionar una carrera válida.';
    }

    if ($semestre < 1 || $semestre > 10) {
        $errores['semestre'] =
            'El semestre debe estar entre 1 y 10.';
    }
}

/*
 * Validaciones específicas para tutores
 */
if ($id_rol === 2) {
    $especialidad = trim($input['especialidad'] ?? '');

    if ($especialidad === '' || mb_strlen($especialidad) < 3 || mb_strlen($especialidad) > 150) {
        $errores['especialidad'] =
            'La especialidad del tutor debe tener entre 3 y 150 caracteres.';
    }
}

if (!empty($errores)) {
    jsonError(
        'Datos de registro inválidos',
        400,
        'Corrige los campos indicados antes de continuar.',
        $errores
    );
}

$usuarioModel = new UsuarioModel($pdo);

/*
 * Verificar usuario y correo duplicados
 */
$existente = $usuarioModel->obtenerPorUsuario($usuario);

if ($existente) {
    if (strcasecmp($existente['usuario'], $usuario) === 0) {
        jsonError(
            'Nombre de usuario ya registrado',
            409,
            "El usuario '$usuario' ya está siendo utilizado."
        );
    }

    if (
        isset($existente['correo']) &&
        strcasecmp($existente['correo'], $correo) === 0
    ) {
        jsonError(
            'Correo electrónico ya registrado',
            409,
            "El correo '$correo' ya está siendo utilizado."
        );
    }

    jsonError(
        'Datos de registro duplicados',
        409,
        'El usuario o correo electrónico ya se encuentra registrado.'
    );
}

/*
 * Validar carrera existente cuando se registra estudiante
 */
if ($id_rol === 3) {
    $id_carrera = (int)$input['id_carrera'];

    $stmtCarrera = $pdo->prepare(
        'SELECT id_carrera FROM carreras WHERE id_carrera = ? LIMIT 1'
    );

    $stmtCarrera->execute([$id_carrera]);

    if (!$stmtCarrera->fetch()) {
        jsonError(
            'Carrera no encontrada',
            404,
            "No existe una carrera registrada con el ID #$id_carrera."
        );
    }
}

try {
    $id_usuario = $usuarioModel->registrar([
        'id_rol' => $id_rol,
        'nombre' => $nombre,
        'apellido' => $apellido,
        'correo' => $correo,
        'usuario' => $usuario,
        'clave' => $clave,
        'id_carrera' => $input['id_carrera'] ?? 1,
        'semestre' => $input['semestre'] ?? 1,
        'registro_universitario' => $input['registro_universitario'] ?? '',
        'especialidad' => $input['especialidad'] ?? '',
        'biografia' => $input['biografia'] ?? '',
    ]);

    jsonSuccess(
        [
            'id_usuario' => (int)$id_usuario,
            'usuario' => $usuario,
            'correo' => $correo,
            'nombre_rol' => $id_rol === 2 ? 'tutor' : 'estudiante',
        ],
        'Registro completado exitosamente. Ahora puedes iniciar sesión con tu cuenta.',
        201
    );

} catch (PDOException $e) {

    if ((string)$e->getCode() === '23000') {
        jsonError(
            'Datos duplicados',
            409,
            'El usuario, correo o registro relacionado ya se encuentra registrado.'
        );
    }

    jsonError(
        'Error al procesar el registro',
        500,
        'Ocurrió un error interno al registrar la cuenta.'
    );
}