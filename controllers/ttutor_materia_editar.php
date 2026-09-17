<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorMateriaModel.php';
require_once __DIR__ . '/../models/TutorModel.php';
require_once __DIR__ . '/../models/MateriaModel.php';

$tutorMateriaModel = new TutorMateriaModel($pdo);
$tutorModel = new TutorModel($pdo);
$materiaModel = new MateriaModel($pdo);

$id_tutor = $_GET['id_tutor'] ?? $_POST['id_tutor_original'] ?? null;
$id_materia = $_GET['id_materia'] ?? $_POST['id_materia_original'] ?? null;

if (!$id_tutor || !$id_materia) {
    header("Location: tutor_materia_listar.php");
    exit;
}

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

            $tutorMateriaModel->actualizar(
                $id_tutor,
                $id_materia,
                $datos
            );

            header("Location: tutor_materia_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar. Esa asignación ya puede existir.";
        }
    }
}

$asignacion_actual = $tutorMateriaModel->obtenerPorIds(
    $id_tutor,
    $id_materia
);

if (!$asignacion_actual) {
    header("Location: tutor_materia_listar.php");
    exit;
}

$tutores = $tutorModel->obtenerTodos();
$materias = $materiaModel->obtenerTodos();

require_once __DIR__ . '/../views/tutor_materia/editar.php';