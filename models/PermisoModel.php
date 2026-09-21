<?php

class PermisoModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Obtener todos los permisos registrados en el sistema ordenados por ID
     */
    public function obtenerTodos()
    {
        $stmt = $this->pdo->query("SELECT id_permiso, nombre_permiso, modulo, descripcion FROM permisos ORDER BY id_permiso ASC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener lista de nombres de permisos asignados a un rol específico
     */
    public function obtenerNombresPorRol($id_rol)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.nombre_permiso 
            FROM permisos p
            INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
            WHERE rp.id_rol = ?
            ORDER BY p.id_permiso ASC
        ");
        $stmt->execute([$id_rol]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Obtener permisos completos agrupados o listados para un rol
     */
    public function obtenerPorRol($id_rol)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.id_permiso, p.nombre_permiso, p.modulo, p.descripcion
            FROM permisos p
            INNER JOIN rol_permisos rp ON p.id_permiso = rp.id_permiso
            WHERE rp.id_rol = ?
            ORDER BY p.id_permiso ASC
        ");
        $stmt->execute([$id_rol]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Obtener todos los nombres de permisos de un usuario a partir de su ID
     */
    public function obtenerPorUsuario($id_usuario)
    {
        $stmt = $this->pdo->prepare("
            SELECT p.nombre_permiso
            FROM usuarios u
            INNER JOIN rol_permisos rp ON u.id_rol = rp.id_rol
            INNER JOIN permisos p ON rp.id_permiso = p.id_permiso
            WHERE u.id_usuario = ? AND u.estado = 'activo'
            GROUP BY p.id_permiso, p.nombre_permiso
            ORDER BY p.id_permiso ASC
        ");
        $stmt->execute([$id_usuario]);
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    /**
     * Asignar un permiso a un rol si no existe
     */
    public function asignarPermiso($id_rol, $id_permiso)
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO rol_permisos (id_rol, id_permiso) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol)
        ");
        return $stmt->execute([$id_rol, $id_permiso]);
    }

    /**
     * Remover un permiso de un rol
     */
    public function removerPermiso($id_rol, $id_permiso)
    {
        $stmt = $this->pdo->prepare("
            DELETE FROM rol_permisos 
            WHERE id_rol = ? AND id_permiso = ?
        ");
        return $stmt->execute([$id_rol, $id_permiso]);
    }
}
