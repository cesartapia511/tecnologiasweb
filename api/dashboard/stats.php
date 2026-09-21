<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

/*
 * El dashboard requiere autenticación y el permiso correspondiente.
 * El usuario se obtiene desde el token Bearer.
 */
$usuario = requerirPermiso($pdo, 'ver_dashboard');

$rol = strtolower($usuario['rol'] ?? '');

$isAdmin = ($rol === 'administrador');
$isTutor = ($rol === 'tutor');
$isEstudiante = ($rol === 'estudiante');

/*
 * =========================================================
 * DETERMINAR EL ALCANCE DE LOS DATOS
 * =========================================================
 *
 * Administrador:
 *   Puede consultar estadísticas generales del sistema.
 *
 * Tutor:
 *   Solo puede consultar sus propias tutorías.
 *
 * Estudiante:
 *   Solo puede consultar sus propias tutorías.
 *
 * IMPORTANTE:
 * No confiamos en id_tutor ni id_estudiante enviados
 * mediante GET por el cliente.
 */
$tutWhere = "1 = 1";
$params = [];

if ($isTutor) {

    if (empty($usuario['id_tutor'])) {
        jsonError(
            'Perfil de tutor no encontrado',
            403,
            'El usuario autenticado no tiene un perfil de tutor asociado.'
        );
    }

    $tutWhere .= " AND tu.id_tutor = ?";
    $params[] = (int) $usuario['id_tutor'];

} elseif ($isEstudiante) {

    if (empty($usuario['id_estudiante'])) {
        jsonError(
            'Perfil de estudiante no encontrado',
            403,
            'El usuario autenticado no tiene un perfil de estudiante asociado.'
        );
    }

    $tutWhere .= " AND tu.id_estudiante = ?";
    $params[] = (int) $usuario['id_estudiante'];
}

/*
 * =========================================================
 * ESTADÍSTICAS GENERALES
 * =========================================================
 *
 * Solamente el administrador recibe información global
 * sobre usuarios, tutores y estudiantes.
 */
$totalUsuarios = 0;
$totalDocentes = 0;
$totalEstudiantes = 0;
$totalCarreras = 0;
$totalMaterias = 0;

if ($isAdmin) {

    $totalUsuarios = (int) $pdo
        ->query("SELECT COUNT(*) FROM usuarios")
        ->fetchColumn();

    $totalDocentes = (int) $pdo
        ->query("SELECT COUNT(*) FROM tutores")
        ->fetchColumn();

    $totalEstudiantes = (int) $pdo
        ->query("SELECT COUNT(*) FROM estudiantes")
        ->fetchColumn();

    $totalCarreras = (int) $pdo
        ->query("SELECT COUNT(*) FROM carreras")
        ->fetchColumn();

    $totalMaterias = (int) $pdo
        ->query("SELECT COUNT(*) FROM materias")
        ->fetchColumn();
}

/*
 * =========================================================
 * TUTORÍAS
 * =========================================================
 */

$stmtTot = $pdo->prepare("
    SELECT COUNT(*)
    FROM tutorias tu
    WHERE $tutWhere
");

$stmtTot->execute($params);
$totalTutorias = (int) $stmtTot->fetchColumn();


$stmtPend = $pdo->prepare("
    SELECT COUNT(*)
    FROM tutorias tu
    WHERE $tutWhere
      AND tu.estado = 'pendiente'
");

$stmtPend->execute($params);
$tutoriasPendientes = (int) $stmtPend->fetchColumn();


$stmtConf = $pdo->prepare("
    SELECT COUNT(*)
    FROM tutorias tu
    WHERE $tutWhere
      AND tu.estado = 'confirmada'
");

$stmtConf->execute($params);
$tutoriasConfirmadas = (int) $stmtConf->fetchColumn();


$stmtReal = $pdo->prepare("
    SELECT COUNT(*)
    FROM tutorias tu
    WHERE $tutWhere
      AND tu.estado = 'realizada'
");

$stmtReal->execute($params);
$tutoriasRealizadas = (int) $stmtReal->fetchColumn();


$stmtCanc = $pdo->prepare("
    SELECT COUNT(*)
    FROM tutorias tu
    WHERE $tutWhere
      AND tu.estado = 'cancelada'
");

$stmtCanc->execute($params);
$tutoriasCanceladas = (int) $stmtCanc->fetchColumn();


/*
 * =========================================================
 * PROMEDIO DE SATISFACCIÓN
 * =========================================================
 *
 * Ya no usamos un valor ficticio como 4.8 cuando no existen
 * evaluaciones. Si no hay evaluaciones, devuelve 0.
 */
$stmtProm = $pdo->prepare("
    SELECT
        AVG(ev.calificacion) AS promedio,
        COUNT(ev.id_evaluacion) AS total
    FROM evaluaciones_tutoria ev
    INNER JOIN tutorias tu
        ON ev.id_tutoria = tu.id_tutoria
    WHERE $tutWhere
");

$stmtProm->execute($params);

$evalStats = $stmtProm->fetch(PDO::FETCH_ASSOC);

$promedioSatisfaccion = !empty($evalStats['promedio'])
    ? round((float) $evalStats['promedio'], 1)
    : 0;


/*
 * =========================================================
 * TUTORÍAS RECIENTES
 * =========================================================
 */

$sqlRecientes = "
    SELECT
        tu.id_tutoria,
        tu.fecha,
        tu.hora_inicio,
        tu.modalidad,
        tu.estado,

        m.nombre_materia,

        ue.nombre AS estudiante_nombre,
        ue.apellido AS estudiante_apellido,

        ut.nombre AS tutor_nombre,
        ut.apellido AS tutor_apellido

    FROM tutorias tu

    INNER JOIN materias m
        ON tu.id_materia = m.id_materia

    INNER JOIN estudiantes es
        ON tu.id_estudiante = es.id_estudiante

    INNER JOIN usuarios ue
        ON es.id_usuario = ue.id_usuario

    INNER JOIN tutores t
        ON tu.id_tutor = t.id_tutor

    INNER JOIN usuarios ut
        ON t.id_usuario = ut.id_usuario

    WHERE $tutWhere

    ORDER BY
        tu.fecha DESC,
        tu.hora_inicio DESC

    LIMIT 5
";

$stmtRecientes = $pdo->prepare($sqlRecientes);
$stmtRecientes->execute($params);

$tutoriasRecientes = $stmtRecientes->fetchAll(PDO::FETCH_ASSOC);


/*
 * =========================================================
 * RESPUESTA
 * =========================================================
 */

jsonSuccess([
    'total_usuarios' => $totalUsuarios,
    'total_docentes' => $totalDocentes,
    'total_estudiantes' => $totalEstudiantes,
    'total_carreras' => $totalCarreras,
    'total_materias' => $totalMaterias,

    'tutorias' => [
        'total' => $totalTutorias,
        'pendientes' => $tutoriasPendientes,
        'confirmadas' => $tutoriasConfirmadas,
        'realizadas' => $tutoriasRealizadas,
        'canceladas' => $tutoriasCanceladas,
    ],

    'promedio_satisfaccion' => $promedioSatisfaccion,

    'tutorias_recientes' => $tutoriasRecientes
]);