<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/UsuarioModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new UsuarioModel($pdo);

if ($method === 'GET') {

    requerirPermiso($pdo, 'listar_usuario');

    $usuarios = $model->obtenerTodos();

    jsonSuccess(
        $usuarios,
        'Usuarios obtenidos correctamente'
    );

} elseif ($method === 'POST') {

    requerirPermiso($pdo, 'crear_usuario');

    $data = getJsonInput();

    $id_rol   = isset($data['id_rol']) ? (int)$data['id_rol'] : 0;
    $nombre   = trim($data['nombre'] ?? '');
    $apellido = trim($data['apellido'] ?? '');
    $correo   = trim($data['correo'] ?? '');
    $usuario  = trim($data['usuario'] ?? '');
    $clave    = trim($data['clave'] ?? '');
    $telefono = trim($data['telefono'] ?? '');

    $estado = $data['estado'] ?? 'activo';

    $errores = [];

    /*
     * =====================================================
     * VALIDACIONES GENERALES
     * =====================================================
     */

    if (
        $nombre === '' ||
        mb_strlen($nombre) < 2 ||
        mb_strlen($nombre) > 100
    ) {
        $errores['nombre'] =
            'El nombre es obligatorio y debe tener entre 2 y 100 caracteres.';
    }

    if (
        $apellido === '' ||
        mb_strlen($apellido) < 2 ||
        mb_strlen($apellido) > 100
    ) {
        $errores['apellido'] =
            'El apellido es obligatorio y debe tener entre 2 y 100 caracteres.';
    }

    if (
        $correo === '' ||
        !filter_var($correo, FILTER_VALIDATE_EMAIL) ||
        mb_strlen($correo) > 150
    ) {
        $errores['correo'] =
            'Debe proporcionar una dirección de correo electrónico válida.';
    }

    if (
        $usuario === '' ||
        mb_strlen($usuario) < 3 ||
        mb_strlen($usuario) > 50 ||
        !preg_match('/^[a-zA-Z0-9._-]+$/', $usuario)
    ) {
        $errores['usuario'] =
            'El nombre de usuario debe tener entre 3 y 50 caracteres y solo puede contener letras, números, puntos, guiones y guion bajo.';
    }

    if (
        $clave === '' ||
        mb_strlen($clave) < 6 ||
        mb_strlen($clave) > 255
    ) {
        $errores['clave'] =
            'La contraseña es obligatoria y debe tener entre 6 y 255 caracteres.';
    }

    if (
        $telefono !== '' &&
        !preg_match('/^[0-9+\s-]{7,20}$/', $telefono)
    ) {
        $errores['telefono'] =
            'El formato de teléfono no es válido.';
    }

    /*
     * Estado estrictamente permitido
     */
    if (!in_array($estado, ['activo', 'inactivo'], true)) {
        $errores['estado'] =
            'El estado debe ser activo o inactivo.';
    }

    /*
     * =====================================================
     * VALIDAR ROL
     * =====================================================
     */

    if ($id_rol <= 0) {

        $errores['id_rol'] =
            'Debe seleccionar un rol válido.';

    } else {

        $stmtRol = $pdo->prepare(
            'SELECT id_rol, nombre_rol
             FROM roles
             WHERE id_rol = ?
             LIMIT 1'
        );

        $stmtRol->execute([$id_rol]);

        $rol = $stmtRol->fetch(PDO::FETCH_ASSOC);

        if (!$rol) {

            $errores['id_rol'] =
                "El rol #$id_rol no existe en el sistema.";
        }
    }

    /*
     * =====================================================
     * VALIDACIONES PARA TUTOR
     * =====================================================
     */

    $especialidad = trim($data['especialidad'] ?? '');
    $biografia = trim($data['biografia'] ?? '');

    if ($id_rol === 2) {

        if ($especialidad === '') {
            $especialidad = 'Docente Tutor UPDS';
        }

        if (
            mb_strlen($especialidad) < 3 ||
            mb_strlen($especialidad) > 150
        ) {
            $errores['especialidad'] =
                'La especialidad debe tener entre 3 y 150 caracteres.';
        }

        if (mb_strlen($biografia) > 2000) {
            $errores['biografia'] =
                'La biografía no puede superar los 2000 caracteres.';
        }
    }

    /*
     * =====================================================
     * VALIDACIONES PARA ESTUDIANTE
     * =====================================================
     */

    $id_carrera = isset($data['id_carrera'])
        ? (int)$data['id_carrera']
        : 1;

    $semestre = isset($data['semestre'])
        ? (int)$data['semestre']
        : 1;

    $ru = trim($data['registro_universitario'] ?? '');

    if ($id_rol === 3) {

        if ($id_carrera <= 0) {

            $errores['id_carrera'] =
                'Debe seleccionar una carrera válida.';

        } else {

            $stmtCarrera = $pdo->prepare(
                'SELECT id_carrera
                 FROM carreras
                 WHERE id_carrera = ?
                 LIMIT 1'
            );

            $stmtCarrera->execute([$id_carrera]);

            if (!$stmtCarrera->fetch()) {

                $errores['id_carrera'] =
                    "La carrera #$id_carrera no existe.";
            }
        }

        if ($semestre < 1 || $semestre > 12) {

            $errores['semestre'] =
                'El semestre debe estar entre 1 y 12.';
        }

        /*
         * Si no se proporciona RU, se genera automáticamente
         * después de crear el usuario.
         */
        if ($ru !== '' && mb_strlen($ru) > 30) {

            $errores['registro_universitario'] =
                'El Registro Universitario no puede superar los 30 caracteres.';
        }
    }

    /*
     * Detener si existen errores
     */
    if (!empty($errores)) {

        jsonError(
            'Datos de usuario inválidos',
            400,
            'Verifica los campos indicados antes de continuar.',
            $errores
        );
    }

    /*
     * =====================================================
     * COMPROBAR DUPLICADOS
     * =====================================================
     */

    $stmtDupU = $pdo->prepare(
        'SELECT id_usuario
         FROM usuarios
         WHERE LOWER(usuario) = LOWER(?)
         LIMIT 1'
    );

    $stmtDupU->execute([$usuario]);

    if ($stmtDupU->fetch()) {

        jsonError(
            'Nombre de usuario ya en uso',
            409,
            "El nombre de usuario '$usuario' ya está registrado."
        );
    }

    $stmtDupC = $pdo->prepare(
        'SELECT id_usuario
         FROM usuarios
         WHERE LOWER(correo) = LOWER(?)
         LIMIT 1'
    );

    $stmtDupC->execute([$correo]);

    if ($stmtDupC->fetch()) {

        jsonError(
            'Correo electrónico ya registrado',
            409,
            "El correo '$correo' ya está siendo utilizado."
        );
    }

    /*
     * =====================================================
     * CREACIÓN TRANSACCIONAL
     * =====================================================
     *
     * Si falla el usuario o su perfil relacionado,
     * se revierte toda la operación.
     */

    try {

        $pdo->beginTransaction();

        $hash = password_hash(
            $clave,
            PASSWORD_DEFAULT
        );

        $stmt = $pdo->prepare("
            INSERT INTO usuarios (
                id_rol,
                nombre,
                apellido,
                correo,
                usuario,
                contrasena_hash,
                telefono,
                estado
            )
            VALUES (
                :id_rol,
                :nombre,
                :apellido,
                :correo,
                :usuario,
                :hash,
                :telefono,
                :estado
            )
        ");

        $stmt->execute([
            ':id_rol'   => $id_rol,
            ':nombre'   => $nombre,
            ':apellido' => $apellido,
            ':correo'   => $correo,
            ':usuario'  => $usuario,
            ':hash'     => $hash,
            ':telefono' => $telefono !== '' ? $telefono : null,
            ':estado'   => $estado
        ]);

        $newId = (int)$pdo->lastInsertId();

        /*
         * =================================================
         * CREAR PERFIL DE TUTOR
         * =================================================
         */

        if ($id_rol === 2) {

            $stmtTutor = $pdo->prepare("
                INSERT INTO tutores (
                    id_usuario,
                    especialidad,
                    biografia
                )
                VALUES (?, ?, ?)
            ");

            $stmtTutor->execute([
                $newId,
                $especialidad,
                $biografia
            ]);
        }

        /*
         * =================================================
         * CREAR PERFIL DE ESTUDIANTE
         * =================================================
         */

        if ($id_rol === 3) {

            if ($ru === '') {

                $ru = 'RU-' .
                    date('Y') .
                    '-' .
                    str_pad(
                        (string)$newId,
                        4,
                        '0',
                        STR_PAD_LEFT
                    );
            }

            /*
             * Comprobar RU generado o recibido
             */
            $stmtDupRU = $pdo->prepare("
                SELECT id_estudiante
                FROM estudiantes
                WHERE registro_universitario = ?
                LIMIT 1
            ");

            $stmtDupRU->execute([$ru]);

            if ($stmtDupRU->fetch()) {

                throw new RuntimeException(
                    'El Registro Universitario ya se encuentra registrado.'
                );
            }

            $stmtEst = $pdo->prepare("
                INSERT INTO estudiantes (
                    id_usuario,
                    id_carrera,
                    semestre,
                    registro_universitario
                )
                VALUES (?, ?, ?, ?)
            ");

            $stmtEst->execute([
                $newId,
                $id_carrera,
                $semestre,
                $ru
            ]);
        }

        $pdo->commit();

        jsonSuccess(
            [
                'id_usuario' => $newId,
                'usuario'    => $usuario,
                'correo'     => $correo,
                'nombre'     => $nombre,
                'apellido'   => $apellido,
                'id_rol'     => $id_rol
            ],
            'Usuario creado correctamente',
            201
        );

    } catch (Throwable $e) {

        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        /*
         * No exponemos detalles internos de la base de datos
         * al cliente.
         */
        if (
            $e instanceof PDOException &&
            (string)$e->getCode() === '23000'
        ) {

            jsonError(
                'Datos duplicados o relación inválida',
                409,
                'El usuario o alguno de sus datos relacionados ya existe.'
            );
        }

        jsonError(
            'Error al crear usuario',
            500,
            'No fue posible completar el registro del usuario.'
        );
    }

} else {

    jsonError(
        'Método no permitido',
        405,
        'Solo se admiten solicitudes GET y POST en esta ruta.'
    );
}