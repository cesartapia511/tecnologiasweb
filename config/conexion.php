<?php
// Configurar zona horaria de Bolivia para PHP
date_default_timezone_set('America/La_Paz');

$host = getenv('DB_HOST');
$db   = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');

if (!$host || !$db || !$user || !$pass) {
    die("Error interno: Configuración de base de datos incompleta.");
}

$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$opciones = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",
];

try {
    $pdo = new PDO($dsn, $user, $pass, $opciones);
    $pdo->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
    // Configurar zona horaria de Bolivia para la base de datos MySQL
    $pdo->exec("SET time_zone = '-04:00'");
} catch (PDOException $e) {
    die("Error de conexión a la base de datos: " . $e->getMessage());
}

