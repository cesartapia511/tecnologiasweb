<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/MateriaModel.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$materiaModel = new MateriaModel($pdo);
$carreraModel = new CarreraModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'nombre_materia' => trim($_POST['nombre_materia'] ?? ''),
        'id_carrera' => $_POST['id_carrera'] ?? ''
    ];

    if ($datos['nombre_materia'] === '') {
        $errores[] = "El nombre de la materia es obligatorio.";
    }

    if ($datos['id_carrera'] === '') {
        $errores[] = "Debe seleccionar una carrera.";
    }

    if (empty($errores)) {

        try {
            $materiaModel->crear($datos);

            header("Location: materias_listar.php");
            exit;

        } catch (PDOException $e) {
            $errores[] = "No se pudo registrar la materia.";
        }
    }
}

$carreras = $carreraModel->obtenerTodos();

require_once __DIR__ . '/../views/materias/crear.php';