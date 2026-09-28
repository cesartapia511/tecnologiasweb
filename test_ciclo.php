<?php
require_once __DIR__ . '/config/conexion.php';
require_once __DIR__ . '/models/SolicitudMateriaModel.php';

$model = new SolicitudMateriaModel($pdo);

// Cleanup before test
$pdo->exec("DELETE FROM solicitudes_materias");

try {
    echo "1. Creando Solicitud A...\n";
    $id_a = $model->crear(1, 1, 'Lunes', '07:30:00', '10:30:00');
    echo "   - Creada ID: $id_a\n";
    
    echo "   - Rechazando Solicitud A...\n";
    $model->actualizarEstado($id_a, 'rechazada');
    
    echo "2. Creando Solicitud B...\n";
    $id_b = $model->crear(1, 2, 'Lunes', '07:30:00', '10:30:00');
    echo "   - Creada ID: $id_b (PASS)\n";
    
    echo "   - Rechazando Solicitud B...\n";
    $model->actualizarEstado($id_b, 'rechazada');
    
    echo "3. Creando Solicitud C...\n";
    $id_c = $model->crear(1, 3, 'Lunes', '07:30:00', '10:30:00');
    echo "   - Creada ID: $id_c (PASS)\n";
    
    echo "4. Intentando crear Solicitud D (pendiente duplicada)...\n";
    try {
        $id_d = $model->crear(1, 4, 'Lunes', '07:30:00', '10:30:00');
        echo "   - FAIL: Se creó D cuando debía fallar.\n";
    } catch (Exception $e) {
        echo "   - PASS: Rechazada correctamente (" . $e->getMessage() . ")\n";
    }
} catch (Exception $e) {
    echo "FAIL General: " . $e->getMessage() . "\n";
}
