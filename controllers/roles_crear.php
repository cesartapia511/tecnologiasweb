<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RolModel.php';

$rolModel = new RolModel($pdo);

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

            $rolModel->crear($datos);

            header("Location: roles_listar.php");
            exit;

        } catch (PDOException $e) {

            $errores[] = "No se pudo registrar el rol. Es posible que ya exista.";
        }
    }
}

require_once __DIR__ . '/../views/roles/crear.php';