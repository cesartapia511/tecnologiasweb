<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EvaluacionModel.php';


$evaluacionModel = new EvaluacionModel($pdo);


$id = $_GET['id'] ?? $_POST['id_evaluacion'] ?? null;


if (!$id) {

    header("Location: evaluaciones_listar.php");

    exit;

}


$errores = [];


if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $datos = [

        'calificacion' => $_POST['calificacion'] ?? '',

        'comentario' => trim($_POST['comentario'] ?? '')

    ];



    if (
        $datos['calificacion'] < 1 ||
        $datos['calificacion'] > 5
    ) {

        $errores[] = "La calificación debe estar entre 1 y 5.";

    }



    if (empty($errores)) {


        try {

            $evaluacionModel->actualizar($id, $datos);


            header("Location: evaluaciones_listar.php");

            exit;


        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar la evaluación.";

        }

    }

}



$evaluacion_actual = $evaluacionModel->obtenerPorId($id);


if (!$evaluacion_actual) {

    header("Location: evaluaciones_listar.php");

    exit;

}



require_once __DIR__ . '/../views/evaluaciones/editar.php';