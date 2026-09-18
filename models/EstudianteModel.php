<?php

class EstudianteModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT e.id_estudiante,
                       e.id_usuario,
                       e.id_carrera,
                       e.semestre,
                       e.registro_universitario,
                       u.nombre,
                       u.apellido,
                       u.correo,
                       u.usuario,
                       u.telefono,
                       u.estado,
                       c.nombre_carrera
                FROM estudiantes e
                INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                ORDER BY e.id_estudiante DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorUsuario($id_usuario)
    {
        $sql = "SELECT e.*, c.nombre_carrera, u.nombre, u.apellido, u.correo, u.telefono
                FROM estudiantes e
                INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
                LEFT JOIN carreras c ON e.id_carrera = c.id_carrera
                WHERE e.id_usuario = :id_usuario";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_usuario' => $id_usuario]);
        return $stmt->fetch();
    }

    public function obtenerPorId($id)
    {
        $sql = "SELECT e.*,
                       u.nombre,
                       u.apellido,
                       u.usuario
                FROM estudiantes e
                INNER JOIN usuarios u ON e.id_usuario = u.id_usuario
                WHERE e.id_estudiante = :id";

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
                LEFT JOIN estudiantes e ON u.id_usuario = e.id_usuario
                WHERE r.nombre_rol = 'estudiante'
                AND e.id_estudiante IS NULL
                AND u.estado = 'activo'
                ORDER BY u.nombre, u.apellido";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO estudiantes
                (id_usuario, id_carrera, semestre, registro_universitario)
                VALUES
                (:id_usuario, :id_carrera, :semestre, :registro_universitario)";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_usuario' => $datos['id_usuario'],
            ':id_carrera' => $datos['id_carrera'],
            ':semestre' => $datos['semestre'],
            ':registro_universitario' =>
                $datos['registro_universitario'] !== ''
                    ? $datos['registro_universitario']
                    : null
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE estudiantes
                SET id_carrera = :id_carrera,
                    semestre = :semestre,
                    registro_universitario = :registro_universitario
                WHERE id_estudiante = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_carrera' => $datos['id_carrera'],
            ':semestre' => $datos['semestre'],
            ':registro_universitario' =>
                $datos['registro_universitario'] !== ''
                    ? $datos['registro_universitario']
                    : null,
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM estudiantes WHERE id_estudiante = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}