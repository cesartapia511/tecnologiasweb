<?php

class DisponibilidadModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT d.id_disponibilidad,
                       d.id_tutor,
                       d.dia_semana,
                       d.hora_inicio,
                       d.hora_fin,
                       u.nombre,
                       u.apellido
                FROM disponibilidad_tutor d
                INNER JOIN tutores t ON d.id_tutor = t.id_tutor
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                ORDER BY d.id_disponibilidad DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM disponibilidad_tutor
             WHERE id_disponibilidad = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO disponibilidad_tutor
                (id_tutor, dia_semana, hora_inicio, hora_fin)
                VALUES
                (:id_tutor, :dia_semana, :hora_inicio, :hora_fin)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_tutor' => $datos['id_tutor'],
            ':dia_semana' => $datos['dia_semana'],
            ':hora_inicio' => $datos['hora_inicio'],
            ':hora_fin' => $datos['hora_fin']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE disponibilidad_tutor
                SET id_tutor = :id_tutor,
                    dia_semana = :dia_semana,
                    hora_inicio = :hora_inicio,
                    hora_fin = :hora_fin
                WHERE id_disponibilidad = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_tutor' => $datos['id_tutor'],
            ':dia_semana' => $datos['dia_semana'],
            ':hora_inicio' => $datos['hora_inicio'],
            ':hora_fin' => $datos['hora_fin'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM disponibilidad_tutor
             WHERE id_disponibilidad = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}