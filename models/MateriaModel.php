<?php

class MateriaModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT m.id_materia, m.nombre_materia, m.id_carrera,
                       c.nombre_carrera
                FROM materias m
                LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
                ORDER BY m.id_materia DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerTodas()
    {
        $sql = "SELECT m.id_materia, m.nombre_materia, m.id_carrera,
                       c.nombre_carrera,
                       (SELECT COUNT(*) FROM tutor_materia tm WHERE tm.id_materia = m.id_materia) AS total_tutores
                FROM materias m
                LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
                ORDER BY m.nombre_materia ASC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorCarrera($id_carrera)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM materias WHERE id_carrera = :id_carrera ORDER BY nombre_materia ASC");
        $stmt->execute([':id_carrera' => $id_carrera]);
        return $stmt->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM materias WHERE id_materia = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO materias (nombre_materia, id_carrera)
                VALUES (:nombre_materia, :id_carrera)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_materia' => $datos['nombre_materia'],
            ':id_carrera' => $datos['id_carrera']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE materias
                SET nombre_materia = :nombre_materia,
                    id_carrera = :id_carrera
                WHERE id_materia = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':nombre_materia' => $datos['nombre_materia'],
            ':id_carrera' => $datos['id_carrera'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM materias WHERE id_materia = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}