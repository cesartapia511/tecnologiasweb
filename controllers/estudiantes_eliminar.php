<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/EstudianteModel.php';

$estudianteModel = new EstudianteModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {

        $estudianteModel->eliminar($id);

    } catch (PDOException $e) {

        die("No se puede eliminar este estudiante porque tiene tutorías asociadas.");
    }
}

header("Location: estudiantes_listar.php");
exit;