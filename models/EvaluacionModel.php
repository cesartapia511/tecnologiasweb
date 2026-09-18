<?php

class EvaluacionModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }


    public function obtenerTodos()
    {
        $sql = "SELECT e.id_evaluacion,
                       e.id_tutoria,
                       e.calificacion,
                       e.comentario,
                       e.fecha_evaluacion,
                       t.fecha,
                       m.nombre_materia,
                       ue.nombre AS estudiante_nombre,
                       ue.apellido AS estudiante_apellido

                FROM evaluaciones_tutoria e

                INNER JOIN tutorias t
                    ON e.id_tutoria = t.id_tutoria

                INNER JOIN estudiantes es
                    ON t.id_estudiante = es.id_estudiante

                INNER JOIN usuarios ue
                    ON es.id_usuario = ue.id_usuario

                INNER JOIN materias m
                    ON t.id_materia = m.id_materia

                ORDER BY e.id_evaluacion DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerTodas($id_tutor = null)
    {
        $sql = "SELECT ev.*, tu.fecha, tu.modalidad, m.nombre_materia,
                       ue.nombre AS estudiante_nombre, ue.apellido AS estudiante_apellido,
                       ut.nombre AS tutor_nombre, ut.apellido AS tutor_apellido
                FROM evaluaciones_tutoria ev
                INNER JOIN tutorias tu ON ev.id_tutoria = tu.id_tutoria
                INNER JOIN materias m ON tu.id_materia = m.id_materia
                INNER JOIN estudiantes es ON tu.id_estudiante = es.id_estudiante
                INNER JOIN usuarios ue ON es.id_usuario = ue.id_usuario
                INNER JOIN tutores t ON tu.id_tutor = t.id_tutor
                INNER JOIN usuarios ut ON t.id_usuario = ut.id_usuario
                WHERE 1=1";
        $params = [];
        if ($id_tutor) {
            $sql .= " AND tu.id_tutor = ?";
            $params[] = $id_tutor;
        }
        $sql .= " ORDER BY ev.fecha_evaluacion DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function obtenerPorTutoria($id_tutoria)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM evaluaciones_tutoria WHERE id_tutoria = ?");
        $stmt->execute([$id_tutoria]);
        return $stmt->fetch();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT *
             FROM evaluaciones_tutoria
             WHERE id_evaluacion = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function obtenerTutoriasDisponibles()
    {
        $sql = "SELECT t.id_tutoria,
                       t.fecha,
                       m.nombre_materia,
                       u.nombre,
                       u.apellido
                FROM tutorias t
                INNER JOIN estudiantes e
                ON t.id_estudiante = e.id_estudiante
                INNER JOIN usuarios u
                ON e.id_usuario = u.id_usuario
                INNER JOIN materias m
                ON t.id_materia = m.id_materia
                LEFT JOIN evaluaciones_tutoria ev
                ON t.id_tutoria = ev.id_tutoria
                WHERE ev.id_evaluacion IS NULL
                AND t.estado = 'realizada'";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO evaluaciones_tutoria
                (
                    id_tutoria,
                    calificacion,
                    comentario
                )
                VALUES
                (
                    :id_tutoria,
                    :calificacion,
                    :comentario
                )";

        $stmt = $this->pdo->prepare($sql);

        $ok = $stmt->execute([
            ':id_tutoria' => $datos['id_tutoria'],
            ':calificacion' => $datos['calificacion'],
            ':comentario' => $datos['comentario'] ?? ''
        ]);

        return $ok ? $this->pdo->lastInsertId() : false;
    }


    public function actualizar($id, $datos)
    {
        $sql = "UPDATE evaluaciones_tutoria

                SET calificacion = :calificacion,
                    comentario = :comentario

                WHERE id_evaluacion = :id";


        $stmt = $this->pdo->prepare($sql);


        return $stmt->execute([
            ':calificacion' => $datos['calificacion'],
            ':comentario' => $datos['comentario'],
            ':id' => $id
        ]);
    }


    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM evaluaciones_tutoria
             WHERE id_evaluacion = :id"
        );


        return $stmt->execute([
            ':id' => $id
        ]);
    }
}