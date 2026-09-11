<?php
$conexion = new mysqli("localhost", "biblioteca_user", "12345", "testdb");

if ($conexion->connect_error) {
    die("Error de conexion: " . $conexion->connect_error);
}

// Comenta o elimina esta línea:
// echo "Conexion exitosa a la base de datos";
?>