<?php

class TutorMateriaModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT tm.id_tutor,
                       tm.id_materia,
                       u.nombre,
                       u.apellido,
                       m.nombre_materia
                FROM tutor_materia tm
                INNER JOIN tutores t ON tm.id_tutor = t.id_tutor
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                INNER JOIN materias m ON tm.id_materia = m.id_materia
                ORDER BY u.nombre, m.nombre_materia";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorIds($id_tutor, $id_materia)
    {
        $sql = "SELECT *
                FROM tutor_materia
                WHERE id_tutor = :id_tutor
                AND id_materia = :id_materia";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':id_tutor' => $id_tutor,
            ':id_materia' => $id_materia
        ]);

        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO tutor_materia (id_tutor, id_materia)
                VALUES (:id_tutor, :id_materia)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_tutor' => $datos['id_tutor'],
            ':id_materia' => $datos['id_materia']
        ]);
    }

    public function actualizar(
        $id_tutor_original,
        $id_materia_original,
        $datos
    ) {
        $sql = "UPDATE tutor_materia
                SET id_tutor = :id_tutor,
                    id_materia = :id_materia
                WHERE id_tutor = :id_tutor_original
                AND id_materia = :id_materia_original";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_tutor' => $datos['id_tutor'],
            ':id_materia' => $datos['id_materia'],
            ':id_tutor_original' => $id_tutor_original,
            ':id_materia_original' => $id_materia_original
        ]);
    }

    public function eliminar($id_tutor, $id_materia)
    {
        $sql = "DELETE FROM tutor_materia
                WHERE id_tutor = :id_tutor
                AND id_materia = :id_materia";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_tutor' => $id_tutor,
            ':id_materia' => $id_materia
        ]);
    }
}