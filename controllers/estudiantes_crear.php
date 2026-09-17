<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EstudianteModel.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$estudianteModel = new EstudianteModel($pdo);
$carreraModel = new CarreraModel($pdo);

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'id_usuario' => $_POST['id_usuario'] ?? '',
        'id_carrera' => $_POST['id_carrera'] ?? '',
        'semestre' => $_POST['semestre'] ?? '',
        'registro_universitario' => trim(
            $_POST['registro_universitario'] ?? ''
        )
    ];

    if ($datos['id_usuario'] === '') {
        $errores[] = "Debe seleccionar un usuario.";
    }

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

            $estudianteModel->crear($datos);

            header("Location: estudiantes_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar el estudiante. Verifique que el usuario o registro universitario no estén repetidos.";
        }
    }
}

$usuarios = $estudianteModel->obtenerUsuariosDisponibles();
$carreras = $carreraModel->obtenerTodos();

require_once __DIR__ . '/../views/estudiantes/crear.php';