<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$carreraModel = new CarreraModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'nombre_carrera' => trim($_POST['nombre_carrera'] ?? '')
    ];

    if ($datos['nombre_carrera'] === '') {
        $errores[] = "El nombre de la carrera es obligatorio.";
    }

    if (empty($errores)) {

        try {

            $carreraModel->crear($datos);

            header("Location: carreras_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar la carrera.";
        }
    }
}

require_once __DIR__ . '/../views/carreras/crear.php';

