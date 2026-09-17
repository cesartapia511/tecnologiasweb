<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorMateriaModel.php';
require_once __DIR__ . '/../models/TutorModel.php';
require_once __DIR__ . '/../models/MateriaModel.php';

$tutorMateriaModel = new TutorMateriaModel($pdo);
$tutorModel = new TutorModel($pdo);
$materiaModel = new MateriaModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_tutor' => $_POST['id_tutor'] ?? '',
        'id_materia' => $_POST['id_materia'] ?? ''
    ];

    if ($datos['id_tutor'] === '') {
        $errores[] = "Debe seleccionar un tutor.";
    }

    if ($datos['id_materia'] === '') {
        $errores[] = "Debe seleccionar una materia.";
    }

    if (empty($errores)) {

        try {

            $tutorMateriaModel->crear($datos);

            header("Location: tutor_materia_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "Esta materia ya está asignada a este tutor.";
        }
    }
}

$tutores = $tutorModel->obtenerTodos();
$materias = $materiaModel->obtenerTodos();

require_once __DIR__ . '/../views/tutor_materia/crear.php';