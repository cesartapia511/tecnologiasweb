<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/CarreraModel.php';

$carreraModel = new CarreraModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {

        $carreraModel->eliminar($id);

    } catch (PDOException $e) {

        die("No se puede eliminar esta carrera porque tiene estudiantes o materias asociados.");
    }
}

header("Location: carreras_listar.php");
exit;