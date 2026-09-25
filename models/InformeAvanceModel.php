<?php

class InformeAvanceModel {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function obtenerPorTutoria($id_tutoria) {
        $sql = "SELECT i.*,
                       t.id_materia,
                       m.nombre_materia,
                       CONCAT(u_est.nombre, ' ', u_est.apellido) AS nombre_estudiante,
                       CONCAT(u_tut.nombre, ' ', u_tut.apellido) AS nombre_tutor
                FROM informes_avance i
                INNER JOIN tutorias t ON i.id_tutoria = t.id_tutoria
                INNER JOIN materias m ON t.id_materia = m.id_materia
                INNER JOIN estudiantes e ON t.id_estudiante = e.id_estudiante
                INNER JOIN usuarios u_est ON e.id_usuario = u_est.id_usuario
                INNER JOIN tutores tut ON t.id_tutor = tut.id_tutor
                INNER JOIN usuarios u_tut ON tut.id_usuario = u_tut.id_usuario
                WHERE i.id_tutoria = :id_tutoria
                ORDER BY i.numero_informe ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_tutoria' => $id_tutoria]);
        return $stmt->fetchAll();
    }

    public function existeNumeroInforme($id_tutoria, $numero_informe) {
        $sql = "SELECT id_informe FROM informes_avance WHERE id_tutoria = :id_tutoria AND numero_informe = :numero";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_tutoria' => $id_tutoria, ':numero' => $numero_informe]);
        return $stmt->fetch() !== false;
    }

    public function obtenerProximoNumero($id_tutoria) {
        $sql = "SELECT MAX(numero_informe) as max_numero FROM informes_avance WHERE id_tutoria = :id_tutoria";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_tutoria' => $id_tutoria]);
        $row = $stmt->fetch();
        return ($row['max_numero'] ?? 0) + 1;
    }

    public function crear($datos) {
        $sql = "INSERT INTO informes_avance (
                    id_tutoria, numero_informe, fecha_registro, fecha_limite,
                    descripcion_avance, porcentaje_avance, registrado_por
                ) VALUES (
                    :id_tutoria, :numero_informe, CURRENT_TIMESTAMP, :fecha_limite,
                    :descripcion_avance, :porcentaje_avance, :registrado_por
                )";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id_tutoria' => $datos['id_tutoria'],
            ':numero_informe' => $datos['numero_informe'],
            ':fecha_limite' => $datos['fecha_limite'] ?: null,
            ':descripcion_avance' => $datos['descripcion_avance'],
            ':porcentaje_avance' => $datos['porcentaje_avance'],
            ':registrado_por' => $datos['registrado_por']
        ]);
        
        return $this->pdo->lastInsertId();
    }
}
