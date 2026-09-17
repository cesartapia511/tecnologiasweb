<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EvaluacionModel.php';


$evaluacionModel = new EvaluacionModel($pdo);


$id = $_GET['id'] ?? null;



if ($id) {


    try {

        $evaluacionModel->eliminar($id);


    } catch (PDOException $e) {


        die("No se pudo eliminar la evaluación.");

    }

}



header("Location: evaluaciones_listar.php");

exit;