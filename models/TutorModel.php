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
                       u.telefono,
                       u.estado
                FROM tutores t
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                ORDER BY u.nombre ASC";

        $tutores = $this->pdo->query($sql)->fetchAll();

        foreach ($tutores as &$tutor) {
            $tutor['materias'] = $this->obtenerMaterias($tutor['id_tutor']);

            $stmtCal = $this->pdo->prepare("SELECT AVG(ev.calificacion) as promedio, COUNT(ev.id_evaluacion) as total_evaluaciones
                                            FROM tutorias tu
                                            INNER JOIN evaluaciones_tutoria ev ON tu.id_tutoria = ev.id_tutoria
                                            WHERE tu.id_tutor = ?");
            $stmtCal->execute([$tutor['id_tutor']]);
            $cal = $stmtCal->fetch();
            $tutor['calificacion_promedio'] = $cal['promedio'] ? round((float)$cal['promedio'], 1) : 5.0;
            $tutor['total_evaluaciones'] = $cal['total_evaluaciones'] ?? 0;

            $stmtTut = $this->pdo->prepare("SELECT COUNT(*) FROM tutorias WHERE id_tutor = ? AND estado = 'realizada'");
            $stmtTut->execute([$tutor['id_tutor']]);
            $tutor['tutorias_realizadas'] = (int) $stmtTut->fetchColumn();
        }

        return $tutores;
    }

    public function obtenerPorId($id)
    {
        $sql = "SELECT t.*,
                       u.nombre,
                       u.apellido,
                       u.usuario,
                       u.correo,
                       u.telefono,
                       u.estado
                FROM tutores t
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                WHERE t.id_tutor = :id";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        $tutor = $stmt->fetch();
        if ($tutor) {
            $tutor['materias'] = $this->obtenerMaterias($tutor['id_tutor']);
        }
        return $tutor;
    }

    public function obtenerPorUsuario($id_usuario)
    {
        $sql = "SELECT t.*, u.nombre, u.apellido, u.correo, u.usuario
                FROM tutores t
                INNER JOIN usuarios u ON t.id_usuario = u.id_usuario
                WHERE t.id_usuario = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$id_usuario]);
        return $stmt->fetch();
    }

    public function obtenerMaterias($id_tutor)
    {
        $stmt = $this->pdo->prepare("SELECT m.id_materia, m.nombre_materia, c.nombre_carrera
                                     FROM tutor_materia tm
                                     INNER JOIN materias m ON tm.id_materia = m.id_materia
                                     LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
                                     WHERE tm.id_tutor = ?");
        $stmt->execute([$id_tutor]);
        return $stmt->fetchAll();
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

        $res = $stmt->execute([
            ':id_usuario' => $datos['id_usuario'],
            ':especialidad' => $datos['especialidad'],
            ':biografia' => $datos['biografia']
        ]);

        $id_tutor = $this->pdo->lastInsertId();

        if (isset($datos['materias_ids']) && is_array($datos['materias_ids']) && $id_tutor) {
            $this->asignarMaterias($id_tutor, $datos['materias_ids']);
        }

        return $res;
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE tutores
                SET especialidad = :especialidad,
                    biografia = :biografia
                WHERE id_tutor = :id";

        $stmt = $this->pdo->prepare($sql);

        $res = $stmt->execute([
            ':especialidad' => $datos['especialidad'] ?? '',
            ':biografia' => $datos['biografia'] ?? '',
            ':id' => $id
        ]);

        if (isset($datos['materias_ids']) && is_array($datos['materias_ids'])) {
            $this->asignarMaterias($id, $datos['materias_ids']);
        }

        return $res;
    }

    public function asignarMaterias($id_tutor, array $materias_ids)
    {
        $this->pdo->prepare("DELETE FROM tutor_materia WHERE id_tutor = ?")->execute([$id_tutor]);
        $stmt = $this->pdo->prepare("INSERT INTO tutor_materia (id_tutor, id_materia) VALUES (?, ?)");
        foreach ($materias_ids as $mId) {
            if (!empty($mId)) {
                $stmt->execute([$id_tutor, intval($mId)]);
            }
        }
        return true;
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