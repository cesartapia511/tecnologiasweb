<?php

class RolModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        return $this->pdo
            ->query("SELECT id_rol, nombre_rol FROM roles ORDER BY id_rol ASC")
            ->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM roles WHERE id_rol = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO roles (nombre_rol)
                VALUES (:nombre_rol)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_rol' => $datos['nombre_rol']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE roles
                SET nombre_rol = :nombre_rol
                WHERE id_rol = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_rol' => $datos['nombre_rol'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM roles WHERE id_rol = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}