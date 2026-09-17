<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/MateriaModel.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$materiaModel = new MateriaModel($pdo);
$carreraModel = new CarreraModel($pdo);

$id = $_GET['id'] ?? $_POST['id_materia'] ?? null;

if (!$id) {
    header("Location: materias_listar.php");
    exit;
}

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
            $materiaModel->actualizar($id, $datos);

            header("Location: materias_listar.php");
            exit;

        } catch (PDOException $e) {
            $errores[] = "No se pudo actualizar la materia.";
        }
    }
}

$materia_actual = $materiaModel->obtenerPorId($id);

if (!$materia_actual) {
    header("Location: materias_listar.php");
    exit;
}

$carreras = $carreraModel->obtenerTodos();

require_once __DIR__ . '/../views/materias/editar.php';