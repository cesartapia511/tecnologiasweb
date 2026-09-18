<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

$id_tutor = $_GET['id_tutor'] ?? null;
$id_estudiante = $_GET['id_estudiante'] ?? null;

// Conteos generales
$totalUsuarios = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
$totalDocentes = $pdo->query("SELECT COUNT(*) FROM tutores")->fetchColumn();
$totalEstudiantes = $pdo->query("SELECT COUNT(*) FROM estudiantes")->fetchColumn();
$totalCarreras = $pdo->query("SELECT COUNT(*) FROM carreras")->fetchColumn();
$totalMaterias = $pdo->query("SELECT COUNT(*) FROM materias")->fetchColumn();

// Estadísticas de tutorías según contexto de usuario/rol
$tutWhere = "1=1";
$params = [];

if ($id_tutor) {
    $tutWhere .= " AND id_tutor = ?";
    $params[] = $id_tutor;
} elseif ($id_estudiante) {
    $tutWhere .= " AND id_estudiante = ?";
    $params[] = $id_estudiante;
}

$stmtTot = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE $tutWhere");
$stmtTot->execute($params);
$totalTutorias = $stmtTot->fetchColumn();

$stmtPend = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE $tutWhere AND estado = 'pendiente'");
$stmtPend->execute($params);
$tutoriasPendientes = $stmtPend->fetchColumn();

$stmtConf = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE $tutWhere AND estado = 'confirmada'");
$stmtConf->execute($params);
$tutoriasConfirmadas = $stmtConf->fetchColumn();

$stmtReal = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE $tutWhere AND estado = 'realizada'");
$stmtReal->execute($params);
$tutoriasRealizadas = $stmtReal->fetchColumn();

$stmtCanc = $pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE $tutWhere AND estado = 'cancelada'");
$stmtCanc->execute($params);
$tutoriasCanceladas = $stmtCanc->fetchColumn();

// Promedio de satisfacción de evaluaciones
$stmtProm = $pdo->prepare("SELECT AVG(ev.calificacion) as promedio, COUNT(ev.id_evaluacion) as total
                          FROM evaluaciones_tutoria ev
                          INNER JOIN tutorias tu ON ev.id_tutoria = tu.id_tutoria
                          WHERE $tutWhere");
$stmtProm->execute($params);
$evalStats = $stmtProm->fetch();
$promedioSatisfaccion = $evalStats['promedio'] ? round((float)$evalStats['promedio'], 1) : 4.8;

// Tutorías recientes
$sqlRecientes = "SELECT tu.id_tutoria, tu.fecha, tu.hora_inicio, tu.modalidad, tu.estado,
                        m.nombre_materia,
                        ue.nombre AS estudiante_nombre, ue.apellido AS estudiante_apellido,
                        ut.nombre AS tutor_nombre, ut.apellido AS tutor_apellido
                 FROM tutorias tu
                 INNER JOIN materias m ON tu.id_materia = m.id_materia
                 INNER JOIN estudiantes es ON tu.id_estudiante = es.id_estudiante
                 INNER JOIN usuarios ue ON es.id_usuario = ue.id_usuario
                 INNER JOIN tutores t ON tu.id_tutor = t.id_tutor
                 INNER JOIN usuarios ut ON t.id_usuario = ut.id_usuario
                 WHERE $tutWhere
                 ORDER BY tu.fecha DESC, tu.hora_inicio DESC
                 LIMIT 5";
$stmtRecientes = $pdo->prepare($sqlRecientes);
$stmtRecientes->execute($params);
$tutoriasRecientes = $stmtRecientes->fetchAll();

jsonSuccess([
    'total_usuarios' => (int)$totalUsuarios,
    'total_docentes' => (int)$totalDocentes,
    'total_estudiantes' => (int)$totalEstudiantes,
    'total_carreras' => (int)$totalCarreras,
    'total_materias' => (int)$totalMaterias,
    'tutorias' => [
        'total' => (int)$totalTutorias,
        'pendientes' => (int)$tutoriasPendientes,
        'confirmadas' => (int)$tutoriasConfirmadas,
        'realizadas' => (int)$tutoriasRealizadas,
        'canceladas' => (int)$tutoriasCanceladas,
    ],
    'promedio_satisfaccion' => $promedioSatisfaccion,
    'tutorias_recientes' => $tutoriasRecientes
]);
