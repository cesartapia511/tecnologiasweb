<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

/*
 * Endpoint para estadísticas avanzadas del Dashboard Institucional (Solo Administrador)
 */
$usuario = requerirPermiso($pdo, 'ver_dashboard');

$rol = strtolower($usuario['rol'] ?? '');

if ($rol !== 'administrador') {
    jsonError('Acceso denegado', 403, 'Solo el administrador puede consultar estas estadísticas.');
}

/*
 * 1. Tutorías por Mes (últimos 6 meses)
 * MySQL: Agrupar por mes y año basándose en el campo `fecha` de `tutorias`
 */
$sqlPorMes = "
    SELECT 
        DATE_FORMAT(fecha, '%Y-%m') as mes_anio,
        COUNT(id_tutoria) as total
    FROM tutorias
    WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
    GROUP BY mes_anio
    ORDER BY mes_anio ASC
";
$stmtPorMes = $pdo->query($sqlPorMes);
$tutoriasPorMesRaw = $stmtPorMes->fetchAll(PDO::FETCH_ASSOC);

$mesesData = [];
foreach ($tutoriasPorMesRaw as $row) {
    $mesesData[$row['mes_anio']] = (int) $row['total'];
}

$mesesNombres = [
    '01' => 'Ene', '02' => 'Feb', '03' => 'Mar', '04' => 'Abr', '05' => 'May', '06' => 'Jun',
    '07' => 'Jul', '08' => 'Ago', '09' => 'Sep', '10' => 'Oct', '11' => 'Nov', '12' => 'Dic'
];

$tutoriasPorMes = [];
for ($i = 5; $i >= 0; $i--) {
    $fecha = date('Y-m', strtotime("-$i months"));
    $partes = explode('-', $fecha);
    $nombreMes = $mesesNombres[$partes[1]] ?? $partes[1];
    $tutoriasPorMes[] = [
        'name' => $nombreMes . ' ' . substr($partes[0], 2),
        'total' => $mesesData[$fecha] ?? 0
    ];
}

/*
 * 2. Tutorías por Estado
 */
$sqlPorEstado = "
    SELECT 
        estado as name,
        COUNT(id_tutoria) as value
    FROM tutorias
    GROUP BY estado
";
$stmtPorEstado = $pdo->query($sqlPorEstado);
$tutoriasPorEstado = $stmtPorEstado->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorEstado as &$row) {
    $row['value'] = (int) $row['value'];
    $row['name'] = ucfirst(strtolower($row['name']));
}

/*
 * 3. Tutorías por Carrera
 */
$sqlPorCarrera = "
    SELECT 
        c.nombre_carrera as name,
        COUNT(tu.id_tutoria) as total
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    INNER JOIN carreras c ON m.id_carrera = c.id_carrera
    GROUP BY c.id_carrera, c.nombre_carrera
    ORDER BY total DESC
";
$stmtPorCarrera = $pdo->query($sqlPorCarrera);
$tutoriasPorCarrera = $stmtPorCarrera->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorCarrera as &$row) {
    $row['total'] = (int) $row['total'];
}

/*
 * 4. Tutorías por Materia (Top 5)
 */
$sqlPorMateria = "
    SELECT 
        m.nombre_materia as name,
        COUNT(tu.id_tutoria) as total
    FROM tutorias tu
    INNER JOIN materias m ON tu.id_materia = m.id_materia
    GROUP BY m.id_materia, m.nombre_materia
    ORDER BY total DESC
    LIMIT 5
";
$stmtPorMateria = $pdo->query($sqlPorMateria);
$tutoriasPorMateria = $stmtPorMateria->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutoriasPorMateria as &$row) {
    $row['total'] = (int) $row['total'];
}

/*
 * 5. Resumen de Evaluaciones (Distribución de calificaciones)
 */
$sqlEvaluaciones = "
    SELECT 
        calificacion as name,
        COUNT(id_evaluacion) as total
    FROM evaluaciones_tutoria
    GROUP BY calificacion
";
$stmtEvaluaciones = $pdo->query($sqlEvaluaciones);
$evaluacionesDistribucionRaw = $stmtEvaluaciones->fetchAll(PDO::FETCH_ASSOC);

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


jsonSuccess([
    'tutorias_por_mes' => $tutoriasPorMes,
    'tutorias_por_estado' => $tutoriasPorEstado,
    'tutorias_por_carrera' => $tutoriasPorCarrera,
    'tutorias_por_materia' => $tutoriasPorMateria,
    'evaluaciones_distribucion' => $evaluacionesDistribucion
]);
