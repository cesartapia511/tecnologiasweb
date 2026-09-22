<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

// Validar que el usuario es administrador
$usuario = requerirPermiso($pdo, 'ver_dashboard'); // Administrador tiene este permiso y vamos a validar rol
$rol = strtolower($usuario['rol'] ?? '');

if ($rol !== 'administrador') {
    jsonError('Acceso denegado', 403, 'Solo el administrador puede consultar los reportes.');
}

// Recibir filtros
$fecha_inicio = $_GET['fecha_inicio'] ?? null;
$fecha_fin = $_GET['fecha_fin'] ?? null;
$estado = $_GET['estado'] ?? null;
$id_carrera = $_GET['id_carrera'] ?? null;
$id_materia = $_GET['id_materia'] ?? null;

// Construir condiciones
$whereConditions = ["1=1"];
$params = [];

if ($fecha_inicio) {
    $whereConditions[] = "tu.fecha >= :fecha_inicio";
    $params[':fecha_inicio'] = $fecha_inicio;
}
if ($fecha_fin) {
    $whereConditions[] = "tu.fecha <= :fecha_fin";
    $params[':fecha_fin'] = $fecha_fin;
}
if ($estado && $estado !== 'Todos') {
    $whereConditions[] = "tu.estado = :estado";
    $params[':estado'] = $estado;
}
if ($id_materia && $id_materia !== 'Todas') {
    $whereConditions[] = "tu.id_materia = :id_materia";
    $params[':id_materia'] = $id_materia;
}
if ($id_carrera && $id_carrera !== 'Todas') {
    $whereConditions[] = "m.id_carrera = :id_carrera";
    $params[':id_carrera'] = $id_carrera;
}

$whereClause = implode(" AND ", $whereConditions);

/*
 * 1. KPIs Generales (Totales con y sin filtro)
 */
$sqlTutoriasTotales = "
    SELECT 
        COUNT(tu.id_tutoria) as total_tutorias,
        SUM(CASE WHEN tu.estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN tu.estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN tu.estado = 'realizada' THEN 1 ELSE 0 END) as realizadas,
        SUM(CASE WHEN tu.estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    WHERE $whereClause
";
$stmtTotales = $pdo->prepare($sqlTutoriasTotales);
$stmtTotales->execute($params);
$kpisTutorias = $stmtTotales->fetch(PDO::FETCH_ASSOC);

$sqlEstudiantes = "SELECT COUNT(*) as total FROM estudiantes";
$totalEstudiantes = $pdo->query($sqlEstudiantes)->fetchColumn();

$sqlTutores = "SELECT COUNT(*) as total FROM tutores";
$totalTutores = $pdo->query($sqlTutores)->fetchColumn();

$sqlMaterias = "SELECT COUNT(*) as total FROM materias";
$totalMaterias = $pdo->query($sqlMaterias)->fetchColumn();

/*
 * 2. Tutorías por Estado (Gráfico Pastel)
 */
$sqlEstado = "
    SELECT tu.estado as name, COUNT(tu.id_tutoria) as value 
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    WHERE $whereClause 
    GROUP BY tu.estado
";
$stmtEstado = $pdo->prepare($sqlEstado);
$stmtEstado->execute($params);
$tutoriasPorEstado = $stmtEstado->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorEstado as &$row) {
    $row['value'] = (int) $row['value'];
    $row['name'] = ucfirst(strtolower($row['name']));
}

/*
 * 3. Tutorías por Carrera (Gráfico Barras)
 */
$sqlCarrera = "
    SELECT c.nombre_carrera as name, COUNT(tu.id_tutoria) as total 
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    INNER JOIN carreras c ON m.id_carrera = c.id_carrera
    WHERE $whereClause 
    GROUP BY c.id_carrera, c.nombre_carrera
    ORDER BY total DESC
";
$stmtCarrera = $pdo->prepare($sqlCarrera);
$stmtCarrera->execute($params);
$tutoriasPorCarrera = $stmtCarrera->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorCarrera as &$row) {
    $row['total'] = (int) $row['total'];
}

/*
 * 4. Tutorías por Fecha (Gráfico de Líneas - Evolución temporal)
 */
$sqlFecha = "
    SELECT DATE_FORMAT(tu.fecha, '%Y-%m-%d') as fecha_exacta, COUNT(tu.id_tutoria) as total 
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    WHERE $whereClause 
    GROUP BY fecha_exacta
    ORDER BY fecha_exacta ASC
    LIMIT 30
";
$stmtFecha = $pdo->prepare($sqlFecha);
$stmtFecha->execute($params);
$tutoriasPorFecha = $stmtFecha->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorFecha as &$row) {
    $row['name'] = $row['fecha_exacta'];
    $row['total'] = (int) $row['total'];
}

/*
 * 5. Distribución de Evaluaciones (Gráfico Barras)
 */
$sqlEval = "
    SELECT ev.calificacion as name, COUNT(ev.id_evaluacion) as total
    FROM evaluaciones_tutoria ev
    INNER JOIN tutorias tu ON ev.id_tutoria = tu.id_tutoria
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    WHERE $whereClause
    GROUP BY ev.calificacion
    ORDER BY ev.calificacion DESC
";
$stmtEval = $pdo->prepare($sqlEval);
$stmtEval->execute($params);
$evaluacionesDistribucionRaw = $stmtEval->fetchAll(PDO::FETCH_ASSOC);

$evalData = [];
foreach ($evaluacionesDistribucionRaw as $row) {
    $evalData[$row['name']] = (int) $row['total'];
}

$evaluacionesDistribucion = [];
for ($i = 5; $i >= 1; $i--) {
    $evaluacionesDistribucion[] = [
        'name' => $i . ' Estrellas',
        'total' => $evalData[$i] ?? 0
    ];
}

$promedioTotal = 0;
$totalEvals = 0;
foreach ($evalData as $estrellas => $cantidad) {
    $promedioTotal += ($estrellas * $cantidad);
    $totalEvals += $cantidad;
}
$promedio = $totalEvals > 0 ? round($promedioTotal / $totalEvals, 1) : 0;

/*
 * 6. Datos detallados para la tabla (Últimas 100 tutorías)
 */
$sqlTabla = "
    SELECT 
        tu.id_tutoria,
        tu.fecha,
        tu.estado,
        m.nombre_materia,
        c.nombre_carrera,
        CONCAT(u_tutor.nombre, ' ', u_tutor.apellido) as nombre_tutor
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    INNER JOIN carreras c ON m.id_carrera = c.id_carrera
    INNER JOIN tutores t ON tu.id_tutor = t.id_tutor
    INNER JOIN usuarios u_tutor ON t.id_usuario = u_tutor.id_usuario
    WHERE $whereClause
    ORDER BY tu.fecha DESC
    LIMIT 100
";
$stmtTabla = $pdo->prepare($sqlTabla);
$stmtTabla->execute($params);
$tutoriasTabla = $stmtTabla->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasTabla as &$row) {
    $row['fecha_format'] = date('d/m/Y', strtotime($row['fecha']));
}

jsonSuccess([
    'kpis' => [
        'total_tutorias' => (int) $kpisTutorias['total_tutorias'],
        'pendientes' => (int) $kpisTutorias['pendientes'],
        'confirmadas' => (int) $kpisTutorias['confirmadas'],
        'realizadas' => (int) $kpisTutorias['realizadas'],
        'canceladas' => (int) $kpisTutorias['canceladas'],
        'total_estudiantes' => (int) $totalEstudiantes,
        'total_tutores' => (int) $totalTutores,
        'total_materias' => (int) $totalMaterias,
        'promedio_evaluaciones' => $promedio,
        'total_evaluaciones' => $totalEvals
    ],
    'tutorias_por_estado' => $tutoriasPorEstado,
    'tutorias_por_carrera' => $tutoriasPorCarrera,
    'tutorias_por_fecha' => $tutoriasPorFecha,
    'evaluaciones_distribucion' => $evaluacionesDistribucion,
    'tutorias_tabla' => $tutoriasTabla
]);
