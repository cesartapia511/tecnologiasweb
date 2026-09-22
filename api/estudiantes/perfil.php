<?php
require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

$method = $_SERVER['REQUEST_METHOD'];
$usuarioAuth = requerirAutenticacion($pdo);
$id_usuario = $usuarioAuth['id_usuario'];

if ($usuarioAuth['rol'] !== 'estudiante') {
    jsonError('Acceso denegado', 403, 'Solo los estudiantes pueden acceder a este perfil.');
}

if ($method === 'GET') {
    $stmt = $pdo->prepare("
        SELECT u.id_usuario, u.nombre, u.apellido, u.correo, u.telefono, u.usuario, u.foto_perfil,
               e.id_estudiante, e.semestre, e.registro_universitario, c.nombre_carrera
        FROM usuarios u
        INNER JOIN estudiantes e ON u.id_usuario = e.id_usuario
        INNER JOIN carreras c ON e.id_carrera = c.id_carrera
        WHERE u.id_usuario = ?
    ");
    $stmt->execute([$id_usuario]);
    $perfil = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$perfil) {
        jsonError('Perfil no encontrado', 404);
    }
    jsonSuccess($perfil, 'Perfil obtenido correctamente');
} elseif ($method === 'PUT') {
    // Para la actualización, delegamos en usuarios/detalle.php internamente o simplemente procesamos aquí.
    // Como el Frontend espera actualizar correo y teléfono por aquí (o lo cambiaremos para usar usuarios/detalle.php).
    // Es mejor que la actualización la haga /usuarios/detalle.php para unificar lógica, pero por compatibilidad
    // de la llamada actual `estudiantesService.updatePerfil()`, implementaremos la lógica o lo redireccionaremos.
    
    // Lo más seguro es que modifiquemos `estudiantesService.updatePerfil()` para que llame a `usuarios/detalle.php`
    // y elimine la necesidad de duplicar código aquí. Pero si el estudiante también pudiera modificar `semestre`, 
    // se haría aquí. El requerimiento dice: "Los campos que no deban ser editables por el estudiante deben permanecer como solo lectura."
    // Carrera, RU y Semestre suelen ser de solo lectura. Así que dejamos este endpoint solo para GET, o para
    // devolver un error invitando a usar el endpoint de usuario.
    
    jsonError('Endpoint obsoleto para actualización', 400, 'Utiliza el endpoint /usuarios/detalle.php para actualizar tus datos personales.');
} else {
    jsonError('Método no permitido', 405);
}
