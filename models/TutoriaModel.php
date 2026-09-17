<?php

class TutoriaModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT tu.id_tutoria,
                       tu.fecha,
                       tu.hora_inicio,
                       tu.hora_fin,
                       tu.modalidad,
                       tu.lugar_o_enlace,
                       tu.estado,
                       tu.observaciones,
                       tu.fecha_solicitud,

                       ue.nombre AS estudiante_nombre,
                       ue.apellido AS estudiante_apellido,

                       ut.nombre AS tutor_nombre,
                       ut.apellido AS tutor_apellido,

                       m.nombre_materia

                FROM tutorias tu

                INNER JOIN estudiantes e
                    ON tu.id_estudiante = e.id_estudiante

                INNER JOIN usuarios ue
                    ON e.id_usuario = ue.id_usuario

                INNER JOIN tutores t
                    ON tu.id_tutor = t.id_tutor

                INNER JOIN usuarios ut
                    ON t.id_usuario = ut.id_usuario

                INNER JOIN materias m
                    ON tu.id_materia = m.id_materia

                ORDER BY tu.fecha DESC, tu.hora_inicio DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPorId($id)
    {
        $stmt = $this->pdo->prepare(
            "SELECT * FROM tutorias
             WHERE id_tutoria = :id"
        );

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch();
    }

    public function tutorTieneMateria($id_tutor, $id_materia)
    {
        $sql = "SELECT COUNT(*)
                FROM tutor_materia
                WHERE id_tutor = :id_tutor
                AND id_materia = :id_materia";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':id_tutor' => $id_tutor,
            ':id_materia' => $id_materia
        ]);

        return $stmt->fetchColumn() > 0;
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO tutorias
                (
                    id_estudiante,
                    id_tutor,
                    id_materia,
                    fecha,
                    hora_inicio,
                    hora_fin,
                    modalidad,
                    lugar_o_enlace,
                    estado,
                    observaciones
                )
                VALUES
                (
                    :id_estudiante,
                    :id_tutor,
                    :id_materia,
                    :fecha,
                    :hora_inicio,
                    :hora_fin,
                    :modalidad,
                    :lugar_o_enlace,
                    :estado,
                    :observaciones
                )";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_estudiante' => $datos['id_estudiante'],
            ':id_tutor' => $datos['id_tutor'],
            ':id_materia' => $datos['id_materia'],
            ':fecha' => $datos['fecha'],
            ':hora_inicio' => $datos['hora_inicio'],
            ':hora_fin' => $datos['hora_fin'],
            ':modalidad' => $datos['modalidad'],
            ':lugar_o_enlace' => $datos['lugar_o_enlace'],
            ':estado' => $datos['estado'],
            ':observaciones' => $datos['observaciones']
        ]);
    }

    public function actualizar($id, $datos)
    {
        $sql = "UPDATE tutorias
                SET id_estudiante = :id_estudiante,
                    id_tutor = :id_tutor,
                    id_materia = :id_materia,
                    fecha = :fecha,
                    hora_inicio = :hora_inicio,
                    hora_fin = :hora_fin,
                    modalidad = :modalidad,
                    lugar_o_enlace = :lugar_o_enlace,
                    estado = :estado,
                    observaciones = :observaciones

                WHERE id_tutoria = :id";

        $stmt = $this->pdo->prepare($sql);

        return $stmt->execute([
            ':id_estudiante' => $datos['id_estudiante'],
            ':id_tutor' => $datos['id_tutor'],
            ':id_materia' => $datos['id_materia'],
            ':fecha' => $datos['fecha'],
            ':hora_inicio' => $datos['hora_inicio'],
            ':hora_fin' => $datos['hora_fin'],
            ':modalidad' => $datos['modalidad'],
            ':lugar_o_enlace' => $datos['lugar_o_enlace'],
            ':estado' => $datos['estado'],
            ':observaciones' => $datos['observaciones'],
            ':id' => $id
        ]);
    }

    public function eliminar($id)
    {
        $stmt = $this->pdo->prepare(
            "DELETE FROM tutorias
             WHERE id_tutoria = :id"
        );

        return $stmt->execute([
            ':id' => $id
        ]);
    }
}