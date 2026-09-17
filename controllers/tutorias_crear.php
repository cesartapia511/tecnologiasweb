<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutoriaModel.php';
require_once __DIR__ . '/../models/EstudianteModel.php';
require_once __DIR__ . '/../models/TutorModel.php';
require_once __DIR__ . '/../models/MateriaModel.php';

$tutoriaModel = new TutoriaModel($pdo);
$estudianteModel = new EstudianteModel($pdo);
$tutorModel = new TutorModel($pdo);
$materiaModel = new MateriaModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_estudiante' => $_POST['id_estudiante'] ?? '',
        'id_tutor' => $_POST['id_tutor'] ?? '',
        'id_materia' => $_POST['id_materia'] ?? '',
        'fecha' => $_POST['fecha'] ?? '',
        'hora_inicio' => $_POST['hora_inicio'] ?? '',
        'hora_fin' => $_POST['hora_fin'] ?? '',
        'modalidad' => $_POST['modalidad'] ?? '',
        'lugar_o_enlace' => trim($_POST['lugar_o_enlace'] ?? ''),
        'estado' => $_POST['estado'] ?? 'pendiente',
        'observaciones' => trim($_POST['observaciones'] ?? '')
    ];

    if ($datos['id_estudiante'] === '') {
        $errores[] = "Debe seleccionar un estudiante.";
    }

    if ($datos['id_tutor'] === '') {
        $errores[] = "Debe seleccionar un tutor.";
    }

    if ($datos['id_materia'] === '') {
        $errores[] = "Debe seleccionar una materia.";
    }

    if ($datos['fecha'] === '') {
        $errores[] = "Debe seleccionar una fecha.";
    }

    if ($datos['hora_inicio'] === '' || $datos['hora_fin'] === '') {
        $errores[] = "Debe ingresar el horario.";
    }

    if (
        $datos['hora_inicio'] !== '' &&
        $datos['hora_fin'] !== '' &&
        $datos['hora_fin'] <= $datos['hora_inicio']
    ) {
        $errores[] = "La hora final debe ser mayor que la hora inicial.";
    }

    if (!in_array($datos['modalidad'], ['presencial', 'virtual'], true)) {
        $errores[] = "Seleccione una modalidad válida.";
    }

    if (
        $datos['id_tutor'] !== '' &&
        $datos['id_materia'] !== '' &&
        !$tutoriaModel->tutorTieneMateria(
            $datos['id_tutor'],
            $datos['id_materia']
        )
    ) {
        $errores[] = "La materia seleccionada no está asignada a este tutor.";
    }

    if (empty($errores)) {

        try {

            $tutoriaModel->crear($datos);

            header("Location: tutorias_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar la tutoría.";
        }
    }
}

$estudiantes = $estudianteModel->obtenerTodos();
$tutores = $tutorModel->obtenerTodos();
$materias = $materiaModel->obtenerTodos();

require_once __DIR__ . '/../views/tutorias/crear.php';