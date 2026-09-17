<?php

class CarreraModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT * FROM carreras ORDER BY id_carrera DESC";
        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM carreras WHERE id_carrera = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO carreras (nombre_carrera)
                VALUES (:nombre_carrera)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_carrera' => $datos['nombre_carrera']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE carreras
                SET nombre_carrera = :nombre_carrera
                WHERE id_carrera = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_carrera' => $datos['nombre_carrera'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM carreras WHERE id_carrera = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}