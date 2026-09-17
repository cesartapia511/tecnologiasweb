<?php

class TutorModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT t.id_tutor,
                       t.id_usuario,
                       t.especialidad,
                       t.biografia,
                       u.nombre,
                       u.apellido,
                       u.correo,
                       u.usuario,
                       u.estado
                FROM tutores t
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                ORDER BY t.id_tutor DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $sql = "SELECT t.*,
                       u.nombre,
                       u.apellido,
                       u.usuario,
                       u.correo
                FROM tutores t
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                WHERE t.id_tutor = :id";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function obtenerUsuariosDisponibles()
    {
        $sql = "SELECT u.id_usuario,
                       u.nombre,
                       u.apellido,
                       u.usuario
                FROM usuarios u
                INNER JOIN roles r ON u.id_rol = r.id_rol
                LEFT JOIN tutores t ON u.id_usuario = t.id_usuario
                WHERE r.nombre_rol = 'tutor'
                AND t.id_tutor IS NULL
                AND u.estado = 'activo'
                ORDER BY u.nombre, u.apellido";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO tutores
                (id_usuario, especialidad, biografia)
                VALUES
                (:id_usuario, :especialidad, :biografia)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_usuario' => $datos['id_usuario'],
            ':especialidad' => $datos['especialidad'],
            ':biografia' => $datos['biografia']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE tutores
                SET especialidad = :especialidad,
                    biografia = :biografia
                WHERE id_tutor = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':especialidad' => $datos['especialidad'],
            ':biografia' => $datos['biografia'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM tutores WHERE id_tutor = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}