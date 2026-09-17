<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EstudianteModel.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$estudianteModel = new EstudianteModel($pdo);
$carreraModel = new CarreraModel($pdo);

$id = $_GET['id'] ?? $_POST['id_estudiante'] ?? null;

if (!$id) {
    header("Location: estudiantes_listar.php");
    exit;
}

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_carrera' => $_POST['id_carrera'] ?? '',
        'semestre' => $_POST['semestre'] ?? '',
        'registro_universitario' => trim(
            $_POST['registro_universitario'] ?? ''
        )
    ];

    if ($datos['id_carrera'] === '') {
        $errores[] = "Debe seleccionar una carrera.";
    }

    if (
        $datos['semestre'] === '' ||
        !is_numeric($datos['semestre']) ||
        (int)$datos['semestre'] < 1
    ) {
        $errores[] = "El semestre debe ser un número válido.";
    }

    if (empty($errores)) {

        try {

            $estudianteModel->actualizar($id, $datos);

            header("Location: estudiantes_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar el estudiante. El registro universitario podría estar repetido.";
        }
    }
}

$estudiante_actual = $estudianteModel->obtenerPorId($id);

if (!$estudiante_actual) {
    header("Location: estudiantes_listar.php");
    exit;
}

$carreras = $carreraModel->obtenerTodos();

require_once __DIR__ . '/../views/estudiantes/editar.php';