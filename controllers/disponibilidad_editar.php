<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/DisponibilidadModel.php';
require_once __DIR__ . '/../models/TutorModel.php';

$disponibilidadModel = new DisponibilidadModel($pdo);
$tutorModel = new TutorModel($pdo);

$id = $_GET['id'] ?? $_POST['id_disponibilidad'] ?? null;

if (!$id) {
    header("Location: disponibilidad_listar.php");
    exit;
}

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_tutor' => $_POST['id_tutor'] ?? '',
        'dia_semana' => $_POST['dia_semana'] ?? '',
        'hora_inicio' => $_POST['hora_inicio'] ?? '',
        'hora_fin' => $_POST['hora_fin'] ?? ''
    ];

    if ($datos['id_tutor'] === '') {
        $errores[] = "Debe seleccionar un tutor.";
    }

    if ($datos['dia_semana'] === '') {
        $errores[] = "Debe seleccionar un día.";
    }

    if ($datos['hora_inicio'] === '' || $datos['hora_fin'] === '') {
        $errores[] = "Debe ingresar las horas.";
    }

    if (
        $datos['hora_inicio'] !== '' &&
        $datos['hora_fin'] !== '' &&
        $datos['hora_fin'] <= $datos['hora_inicio']
    ) {
        $errores[] = "La hora de fin debe ser mayor que la hora de inicio.";
    }

    if (empty($errores)) {

        try {

            $disponibilidadModel->actualizar($id, $datos);

            header("Location: disponibilidad_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar la disponibilidad.";
        }
    }
}

$disponibilidad_actual = $disponibilidadModel->obtenerPorId($id);

if (!$disponibilidad_actual) {
    header("Location: disponibilidad_listar.php");
    exit;
}

$tutores = $tutorModel->obtenerTodos();

require_once __DIR__ . '/../views/disponibilidad/editar.php';