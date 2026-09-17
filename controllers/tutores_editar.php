<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorModel.php';

$tutorModel = new TutorModel($pdo);

$id = $_GET['id'] ?? $_POST['id_tutor'] ?? null;

if (!$id) {
    header("Location: tutores_listar.php");
    exit;
}

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'especialidad' => trim($_POST['especialidad'] ?? ''),
        'biografia' => trim($_POST['biografia'] ?? '')
    ];

    if ($datos['especialidad'] === '') {
        $errores[] = "La especialidad es obligatoria.";
    }

    if (empty($errores)) {

        try {

            $tutorModel->actualizar($id, $datos);

            header("Location: tutores_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar el tutor.";
        }
    }
}

$tutor_actual = $tutorModel->obtenerPorId($id);

if (!$tutor_actual) {
    header("Location: tutores_listar.php");
    exit;
}

require_once __DIR__ . '/../views/tutores/editar.php';