<?php

class RegistroAccesoModel
{
    private $pdo;


    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }


    public function obtenerTodos()
    {
        $sql = "SELECT 
                    ra.id_acceso,
                    ra.fecha_hora,
                    ra.ip_origen,
                    ra.resultado,
                    u.nombre,
                    u.apellido,
                    u.usuario,
                    r.nombre_rol
                FROM registro_accesos ra
                LEFT JOIN usuarios u
                    ON ra.id_usuario = u.id_usuario
                LEFT JOIN roles r
                    ON u.id_rol = r.id_rol
                ORDER BY ra.id_acceso DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerRecientes($limite = 100)
    {
        $limite = (int)$limite;
        $sql = "SELECT 
                    ra.id_acceso,
                    ra.fecha_hora,
                    ra.ip_origen,
                    ra.resultado,
                    u.nombre,
                    u.apellido,
                    u.usuario,
                    r.nombre_rol
                FROM registro_accesos ra
                LEFT JOIN usuarios u
                    ON ra.id_usuario = u.id_usuario
                LEFT JOIN roles r
                    ON u.id_rol = r.id_rol
                ORDER BY ra.id_acceso DESC
                LIMIT $limite";

        return $this->pdo->query($sql)->fetchAll();
    }
}