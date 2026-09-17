<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/MateriaModel.php';

$materiaModel = new MateriaModel($pdo);

$materias = $materiaModel->obtenerTodos();

require_once __DIR__ . '/../views/materias/listar.php';