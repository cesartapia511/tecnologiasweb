<?php

class ReunionModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function obtenerPorTutoria($id_tutoria) {
        $sql = "SELECT r.*,
                       t.id_materia,
                       m.nombre_materia,
                       CONCAT(u_est.nombre, ' ', u_est.apellido) AS nombre_estudiante,
                       CONCAT(u_tut.nombre, ' ', u_tut.apellido) AS nombre_tutor
                FROM reuniones r
                INNER JOIN tutorias t ON r.id_tutoria = t.id_tutoria
                INNER JOIN materias m ON t.id_materia = m.id_materia
                INNER JOIN estudiantes e ON t.id_estudiante = e.id_estudiante
                INNER JOIN usuarios u_est ON e.id_usuario = u_est.id_usuario
                INNER JOIN tutores tut ON t.id_tutor = tut.id_tutor
                INNER JOIN usuarios u_tut ON tut.id_usuario = u_tut.id_usuario
                WHERE r.id_tutoria = :id_tutoria
                ORDER BY r.fecha DESC, r.hora_inicio DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_tutoria' => $id_tutoria]);
        return $stmt->fetchAll();
    }

    public function crear($datos) {
        $sql = "INSERT INTO reuniones (
                    id_tutoria, fecha, hora_inicio, hora_fin, lugar_o_enlace,
                    asistio_estudiante, minutos_tardanza, evidencia_url, observaciones,
                    firma_tutor, firma_estudiante, fecha_registro
                ) VALUES (
                    :id_tutoria, :fecha, :hora_inicio, :hora_fin, :lugar_o_enlace,
                    :asistio_estudiante, :minutos_tardanza, :evidencia_url, :observaciones,
                    0, 0, CURRENT_TIMESTAMP
                )";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id_tutoria' => $datos['id_tutoria'],
            ':fecha' => $datos['fecha'],
            ':hora_inicio' => $datos['hora_inicio'],
            ':hora_fin' => $datos['hora_fin'],
            ':lugar_o_enlace' => $datos['lugar_o_enlace'],
            ':asistio_estudiante' => $datos['asistio_estudiante'],
            ':minutos_tardanza' => $datos['minutos_tardanza'],
            ':evidencia_url' => $datos['evidencia_url'],
            ':observaciones' => $datos['observaciones']
        ]);
        
        return $this->pdo->lastInsertId();
    }

    public function firmarTutor($id_reunion) {
        $sql = "UPDATE reuniones SET firma_tutor = 1 WHERE id_reunion = :id_reunion";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id_reunion' => $id_reunion]);
    }

    public function firmarEstudiante($id_reunion) {
        $sql = "UPDATE reuniones SET firma_estudiante = 1 WHERE id_reunion = :id_reunion";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id_reunion' => $id_reunion]);
    }

    public function verificarAccesoTutor($id_reunion, $id_tutor) {
        $sql = "SELECT r.id_reunion 
                FROM reuniones r
                INNER JOIN tutorias t ON r.id_tutoria = t.id_tutoria
                WHERE r.id_reunion = :id_reunion AND t.id_tutor = :id_tutor";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_reunion' => $id_reunion, ':id_tutor' => $id_tutor]);
        return $stmt->fetch() !== false;
    }

    public function verificarAccesoEstudiante($id_reunion, $id_estudiante) {
        $sql = "SELECT r.id_reunion 
                FROM reuniones r
                INNER JOIN tutorias t ON r.id_tutoria = t.id_tutoria
                WHERE r.id_reunion = :id_reunion AND t.id_estudiante = :id_estudiante";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_reunion' => $id_reunion, ':id_estudiante' => $id_estudiante]);
        return $stmt->fetch() !== false;
    }
}
