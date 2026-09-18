<?php
require_once __DIR__ . '/../conexion.php';

class UsuarioModelo {
    public static function guardar($nombre, $apellido, $correo, $usuario, $contrasena) {
        global $conexion;
        
        // Asignamos rol de 'estudiante' (ID 3) por defecto
        $id_rol = 3;
        
        // Generamos el hash de la contraseña como pide el comentario del script
        $contrasena_hash = password_hash($contrasena, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO usuarios (id_rol, nombre, apellido, correo, usuario, contrasena_hash) 
                VALUES ($id_rol, '$nombre', '$apellido', '$correo', '$usuario', '$contrasena_hash')";
                
        return $conexion->query($sql);
    }
}
?>