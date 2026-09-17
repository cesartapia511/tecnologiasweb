<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorModel.php';

$tutorModel = new TutorModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_usuario' => $_POST['id_usuario'] ?? '',
        'especialidad' => trim($_POST['especialidad'] ?? ''),
        'biografia' => trim($_POST['biografia'] ?? '')
    ];

    if ($datos['id_usuario'] === '') {
        $errores[] = "Debe seleccionar un usuario.";
    }

    if ($datos['especialidad'] === '') {
        $errores[] = "La especialidad es obligatoria.";
    }

    if (empty($errores)) {

        try {

            $tutorModel->crear($datos);

            header("Location: tutores_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar el tutor.";
        }
    }
}

$usuarios = $tutorModel->obtenerUsuariosDisponibles();

require_once __DIR__ . '/../views/tutores/crear.php';