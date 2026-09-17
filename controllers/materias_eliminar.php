<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/MateriaModel.php';

$materiaModel = new MateriaModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {
        $materiaModel->eliminar($id);

    } catch (PDOException $e) {
        die("No se puede eliminar esta materia porque está siendo utilizada en el sistema.");
    }
}

header("Location: materias_listar.php");
exit;