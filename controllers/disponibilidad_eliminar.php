<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/DisponibilidadModel.php';

$disponibilidadModel = new DisponibilidadModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {

        $disponibilidadModel->eliminar($id);

    } catch (PDOException $e) {

        die("No se pudo eliminar la disponibilidad.");
    }
}

header("Location: disponibilidad_listar.php");
exit;