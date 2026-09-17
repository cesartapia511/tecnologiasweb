<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EvaluacionModel.php';


$evaluacionModel = new EvaluacionModel($pdo);

$errores = [];


if ($_SERVER['REQUEST_METHOD'] === 'POST') {


    $datos = [

        'id_tutoria' => $_POST['id_tutoria'] ?? '',

        'calificacion' => $_POST['calificacion'] ?? '',

        'comentario' => trim($_POST['comentario'] ?? '')

    ];


    if ($datos['id_tutoria'] === '') {

        $errores[] = "Debe seleccionar una tutoría.";

    }


    if (
        $datos['calificacion'] < 1 ||
        $datos['calificacion'] > 5
    ) {

        $errores[] = "La calificación debe estar entre 1 y 5.";

    }



    if (empty($errores)) {


        try {

            $evaluacionModel->crear($datos);

            header("Location: evaluaciones_listar.php");

            exit;


        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar la evaluación.";

        }

    }

}


$tutorias = $evaluacionModel->obtenerTutoriasDisponibles();


require_once __DIR__ . '/../views/evaluaciones/crear.php';