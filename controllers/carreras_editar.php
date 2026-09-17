<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$carreraModel = new CarreraModel($pdo);

$id = $_GET['id'] ?? $_POST['id_carrera'] ?? null;

if (!$id) {
    header("Location: carreras_listar.php");
    exit;
}

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

            $carreraModel->actualizar($id, $datos);

            header("Location: carreras_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar la carrera.";
        }
    }
}

$carrera_actual = $carreraModel->obtenerPorId($id);

if (!$carrera_actual) {
    header("Location: carreras_listar.php");
    exit;
}

require_once __DIR__ . '/../views/carreras/editar.php';