<?php
require_once __DIR__ . '/../modelo/usuarioModelo.php';

class UsuarioControlador {
    public function crear() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $nombre     = $_POST['nombre'] ?? '';
            $apellido   = $_POST['apellido'] ?? '';
            $correo     = $_POST['correo'] ?? '';
            $usuario    = $_POST['usuario'] ?? '';
            $contrasena = $_POST['contrasena'] ?? '';

            if (!empty($nombre) && !empty($apellido) && !empty($correo) && !empty($usuario) && !empty($contrasena)) {
                try {
                    if (UsuarioModelo::guardar($nombre, $apellido, $correo, $usuario, $contrasena)) {
                        echo "<p style='color: green; font-weight: bold;'>¡Usuario registrado exitosamente!</p>";
                    } else {
                        echo "<p style='color: red;'>Error al registrar en la base de datos.</p>";
                    }
                } catch (Exception $e) {
                    echo "<p style='color: red; font-weight: bold;'>Error en la BD: " . $e->getMessage() . "</p>";
                }
            } else {
                echo "<p style='color: orange;'>Por favor completa todos los campos.</p>";
            }
        }

        require_once __DIR__ . '/../vista/crearUsuario.php';
    }
}
?>