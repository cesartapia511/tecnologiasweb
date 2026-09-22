<?php
require_once __DIR__ . '/../../config/conexion.php';
ini_set('display_errors', 1);
error_reporting(E_ALL);

$whereClause = "1=1";
$params = [];

try {
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
    echo "SQL Fecha OK\n";

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
    echo "SQL Eval OK\n";

    $sqlEstado = "
        SELECT tu.estado as name, COUNT(tu.id_tutoria) as value 
        FROM tutorias tu
        INNER JOIN materias m ON tu.id_materia = m.id_materia
        WHERE $whereClause 
        GROUP BY tu.estado
    ";
    $stmtEstado = $pdo->prepare($sqlEstado);
    $stmtEstado->execute($params);
    echo "SQL Estado OK\n";
    
    echo "All specific queries passed!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
