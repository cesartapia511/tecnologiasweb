<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RolModel.php';

$rolModel = new RolModel($pdo);

$id = $_GET['id'] ?? $_POST['id_rol'] ?? null;

if (!$id) {
    header("Location: roles_listar.php");
    exit;
}

$errores = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $datos = [
        'nombre_rol' => trim($_POST['nombre_rol'] ?? '')
    ];

    if ($datos['nombre_rol'] === '') {
        $errores[] = "El nombre del rol es obligatorio.";
    }

    if (empty($errores)) {

        try {

            $rolModel->actualizar($id, $datos);

            header("Location: roles_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo actualizar el rol.";
        }
    }
}

$rol_actual = $rolModel->obtenerPorId($id);

if (!$rol_actual) {
    header("Location: roles_listar.php");
    exit;
}

require_once __DIR__ . '/../views/roles/editar.php';