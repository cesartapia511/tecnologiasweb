<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/CarreraModel.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Endpoint público para el formulario de registro.
    // No usa requerirPermiso() para permitir acceso sin token.
    $model = new CarreraModel($pdo);
    
    try {
        $carreras = $model->obtenerTodas();
        jsonSuccess($carreras, 'Catálogo de carreras obtenido correctamente');
    } catch (PDOException $e) {
        error_log("Error en endpoint público de carreras: " . $e->getMessage());
        jsonError('Error interno', 500, 'No se pudo cargar el catálogo.');
    }
} else {
    jsonError('Método no permitido', 405, 'Solo se admiten solicitudes GET en esta ruta.');
}
