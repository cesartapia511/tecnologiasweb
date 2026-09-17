<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutoriaModel.php';

$tutoriaModel = new TutoriaModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {

        $tutoriaModel->eliminar($id);

    } catch (PDOException $e) {

        die("No se pudo eliminar la tutoría.");
    }
}

header("Location: tutorias_listar.php");
exit;