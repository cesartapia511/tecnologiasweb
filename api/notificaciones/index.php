<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/NotificacionModel.php';

$usuarioAuth = requerirAutenticacion($pdo);
$id_usuario = (int)$usuarioAuth['id_usuario'];
$method = $_SERVER['REQUEST_METHOD'];
$model = new NotificacionModel($pdo);

if ($method === 'GET') {
    // Listar notificaciones
    $limite = isset($_GET['limite']) ? (int)$_GET['limite'] : 50;
    
    try {
        $notificaciones = $model->obtenerPorUsuario($id_usuario, $limite);
        $no_leidas = $model->contarNoLeidas($id_usuario);
        
        jsonSuccess([
            'notificaciones' => $notificaciones,
            'no_leidas' => $no_leidas
        ]);
    } catch (Exception $e) {
        jsonError('Error al obtener notificaciones', 500, $e->getMessage());
    }

} elseif ($method === 'PUT') {
    // Marcar como leída
    $data = getJsonInput();
    
    try {
        if (isset($data['marcar_todas']) && $data['marcar_todas'] === true) {
            $model->marcarTodasComoLeidas($id_usuario);
            jsonSuccess(['mensaje' => 'Todas las notificaciones marcadas como leídas']);
        } elseif (isset($data['id_notificacion'])) {
            $id_notificacion = (int)$data['id_notificacion'];
            $model->marcarComoLeida($id_notificacion, $id_usuario);
            jsonSuccess(['mensaje' => 'Notificación marcada como leída']);
        } else {
            jsonError('Faltan parámetros', 400);
        }
    } catch (Exception $e) {
        jsonError('Error al actualizar notificación', 500, $e->getMessage());
    }
} else {
    jsonError('Método no permitido', 405);
}
