<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/TutorMateriaModel.php';

$tutorMateriaModel = new TutorMateriaModel($pdo);

$id_tutor = $_GET['id_tutor'] ?? null;
$id_materia = $_GET['id_materia'] ?? null;

if ($id_tutor && $id_materia) {

    try {

        $tutorMateriaModel->eliminar(
            $id_tutor,
            $id_materia
        );

    } catch (PDOException $e) {

        die("No se pudo eliminar la asignación.");
    }
}

header("Location: tutor_materia_listar.php");
exit;