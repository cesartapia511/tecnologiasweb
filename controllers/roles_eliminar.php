<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RolModel.php';

$rolModel = new RolModel($pdo);

$id = $_GET['id'] ?? null;

if ($id) {

    try {

        $rolModel->eliminar($id);

    } catch (PDOException $e) {

        die("No se puede eliminar este rol porque existen usuarios que lo están utilizando.");
    }
}

header("Location: roles_listar.php");
exit;