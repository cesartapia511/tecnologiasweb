<?php

require_once __DIR__ . '/../config/conexion.php';
require_once __DIR__ . '/../models/RegistroAccesoModel.php';


$model = new RegistroAccesoModel($pdo);


$accesos = $model->obtenerTodos();


require_once __DIR__ . '/../views/accesos/listar.php';