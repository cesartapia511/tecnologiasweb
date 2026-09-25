<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CartaDesignacionModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$method = $_SERVER['REQUEST_METHOD'];
$model = new CartaDesignacionModel($pdo);
$tutoriaModel = new TutoriaModel($pdo);

if ($method === 'GET') {
    $usuarioAuth = requerirAutenticacion($pdo);
    $rol = strtolower($usuarioAuth['rol'] ?? '');

    $filtros = [];
    if (!empty($_GET['tipo_firma'])) {
        $filtros['tipo_firma'] = trim($_GET['tipo_firma']);
    }

    if ($rol === 'tutor') {
        if (empty($usuarioAuth['id_tutor'])) {
            jsonError('Perfil de tutor no encontrado', 403, 'El usuario no tiene perfil de tutor.');
        }
        $filtros['id_tutor'] = (int)$usuarioAuth['id_tutor'];
    } elseif ($rol === 'estudiante') {
        if (empty($usuarioAuth['id_estudiante'])) {
            jsonError('Perfil de estudiante no encontrado', 403, 'El usuario no tiene perfil de estudiante.');
        }
        $filtros['id_estudiante'] = (int)$usuarioAuth['id_estudiante'];
    } else {
        if (!empty($_GET['id_tutor'])) {
            $filtros['id_tutor'] = (int)$_GET['id_tutor'];
        }
        if (!empty($_GET['id_estudiante'])) {
            $filtros['id_estudiante'] = (int)$_GET['id_estudiante'];
        }
    }

    try {
        $cartas = $model->obtenerTodas($filtros);
        jsonSuccess($cartas, 'Cartas de designación obtenidas correctamente');
    } catch (PDOException $e) {
        error_log("PDOException en cartas_designacion GET: " . $e->getMessage());
        jsonError('Error de base de datos al obtener cartas.', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        error_log("Exception en cartas_designacion GET: " . $e->getMessage());
        jsonError('Error al obtener cartas', 500, $e->getMessage());
    }

} elseif ($method === 'POST') {
    $usuarioAuth = requerirAutenticacion($pdo);
    $rol = strtolower($usuarioAuth['rol'] ?? '');

    $data = getJsonInput();
    $id_tutor = isset($data['id_tutor']) ? (int)$data['id_tutor'] : 0;
    $id_estudiante = isset($data['id_estudiante']) ? (int)$data['id_estudiante'] : 0;
    $id_modalidad = isset($data['id_modalidad']) ? (int)$data['id_modalidad'] : 1;

    if ($id_tutor <= 0 || $id_estudiante <= 0) {
        jsonError('Datos incompletos', 400, 'Se requieren id_tutor e id_estudiante.');
    }

    try {
        $pdo->beginTransaction();

        // Find a materia for the tutor
        $stmtMateria = $pdo->prepare("SELECT id_materia FROM tutor_materia WHERE id_tutor = ? LIMIT 1");
        $stmtMateria->execute([$id_tutor]);
        $id_materia = $stmtMateria->fetchColumn() ?: 1;

        // Create tutoria
        $datosTutoria = [
            'id_estudiante' => $id_estudiante,
            'id_tutor' => $id_tutor,
            'id_materia' => $id_materia,
            'fecha' => date('Y-m-d'),
            'hora_inicio' => '00:00:00',
            'hora_fin' => '00:00:00',
            'modalidad' => 'presencial',
            'estado' => 'pendiente',
            'observaciones' => 'Designación para modalidad de graduación'
        ];
        
        // We need to pass id_modalidad if supported, so let's just insert directly to handle id_modalidad
        $sqlTutoria = "INSERT INTO tutorias (id_estudiante, id_tutor, id_materia, id_modalidad, fecha, hora_inicio, hora_fin, modalidad, estado, observaciones) 
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmtIns = $pdo->prepare($sqlTutoria);
        $stmtIns->execute([
            $id_estudiante, $id_tutor, $id_materia, $id_modalidad, date('Y-m-d'), '00:00:00', '00:00:00', 'presencial', 'pendiente', 'Designación'
        ]);
        $id_tutoria = $pdo->lastInsertId();

        $datosCarta = [
            'id_tutoria' => $id_tutoria,
            'id_tutor' => $id_tutor,
            'id_estudiante' => $id_estudiante,
            'creado_por' => (int)$usuarioAuth['id_usuario']
        ];
        $id_carta = $model->crear($datosCarta);
        
        $pdo->commit();
        jsonSuccess(['id_carta' => $id_carta, 'id_tutoria' => $id_tutoria], 'Carta de designación creada con éxito', 201);
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("PDOException en cartas_designacion POST: " . $e->getMessage());
        jsonError('Error de base de datos al crear la designación. Posible problema de integridad (ej: materia o tutor inválidos).', 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Exception en cartas_designacion POST: " . $e->getMessage());
        jsonError('Error al crear carta', 500, $e->getMessage());
    }

} elseif ($method === 'PUT') {
    $usuarioAuth = requerirAutenticacion($pdo);
    $rol = strtolower($usuarioAuth['rol'] ?? '');

    $data = getJsonInput();
    $id_carta = isset($data['id_carta']) ? (int)$data['id_carta'] : 0;
    $accion = trim($data['accion'] ?? '');

    if ($id_carta <= 0 || !in_array($accion, ['aceptar', 'rechazar'])) {
        jsonError('Datos incompletos', 400, 'ID de carta o acción (aceptar/rechazar) inválida.');
    }

    $carta = $model->obtenerPorId($id_carta);
    if (!$carta) {
        jsonError('Carta no encontrada', 404, "No existe la carta con ID $id_carta.");
    }

    if ($carta['tipo_firma'] !== 'pendiente') {
        jsonError('Carta procesada', 400, "La carta ya se encuentra {$carta['tipo_firma']}.");
    }

    if ($rol === 'tutor') {
        if (empty($usuarioAuth['id_tutor']) || (int)$usuarioAuth['id_tutor'] !== (int)$carta['id_tutor']) {
            jsonError('Acceso denegado', 403, 'Solo puedes gestionar tus propias cartas de designación.');
        }
    } elseif ($rol === 'estudiante') {
        jsonError('Acceso denegado', 403, 'Los estudiantes no pueden aceptar o rechazar cartas de designación.');
    }

    try {
        $pdo->beginTransaction();

        if ($accion === 'aceptar') {
            $model->aceptar($id_carta);
            $tutoriaModel->actualizarEstado((int)$carta['id_tutoria'], 'asignada');
        } else {
            $motivo = trim($data['motivo'] ?? '');
            if ($motivo === '') {
                jsonError('Motivo requerido', 400, 'Debes proporcionar un motivo de rechazo.');
            }
            $model->rechazar($id_carta, $motivo);
            $tutoriaModel->actualizarEstado((int)$carta['id_tutoria'], 'en_reasignacion');
        }

        $pdo->commit();
        jsonSuccess(null, "Carta de designación $accion con éxito.");
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("PDOException en cartas_designacion PUT ($accion): " . $e->getMessage());
        jsonError("Error de base de datos al $accion la carta.", 500, 'Problema técnico en la BD.');
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Exception en cartas_designacion PUT ($accion): " . $e->getMessage());
        jsonError("Error al $accion carta", 500, $e->getMessage());
    }

} else {
    jsonError('Método no permitido', 405);
}
