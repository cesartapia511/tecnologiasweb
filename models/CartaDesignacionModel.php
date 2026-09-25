<?php

class CartaDesignacionModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodas($filtros = [])
    {
        $sql = "SELECT c.*, 
                       t.id_materia, t.id_modalidad, t.estado AS estado_tutoria,
                       m.nombre_materia,
                       mod_grad.nombre AS nombre_modalidad,
                       u_est.nombre AS estudiante_nombre, u_est.apellido AS estudiante_apellido,
                       u_tut.nombre AS tutor_nombre, u_tut.apellido AS tutor_apellido
                FROM cartas_designacion c
                INNER JOIN tutorias t ON c.id_tutoria = t.id_tutoria
                INNER JOIN materias m ON t.id_materia = m.id_materia
                LEFT JOIN modalidades_graduacion mod_grad ON t.id_modalidad = mod_grad.id_modalidad
                INNER JOIN estudiantes e ON c.id_estudiante = e.id_estudiante
                INNER JOIN usuarios u_est ON e.id_usuario = u_est.id_usuario
                INNER JOIN tutores tut ON c.id_tutor = tut.id_tutor
                INNER JOIN usuarios u_tut ON tut.id_usuario = u_tut.id_usuario
                WHERE 1=1";

        $params = [];

        if (!empty($filtros['id_estudiante'])) {
            $sql .= " AND c.id_estudiante = :id_estudiante";
            $params[':id_estudiante'] = $filtros['id_estudiante'];
        }

        if (!empty($filtros['id_tutor'])) {
            $sql .= " AND c.id_tutor = :id_tutor";
            $params[':id_tutor'] = $filtros['id_tutor'];
        }

        if (!empty($filtros['tipo_firma'])) {
            $sql .= " AND c.tipo_firma = :tipo_firma";
            $params[':tipo_firma'] = $filtros['tipo_firma'];
        }

        $sql .= " ORDER BY c.fecha_generacion DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function obtenerPorId($id_carta)
    {
        $sql = "SELECT c.*, 
                       t.id_materia, t.id_modalidad, t.estado as estado_tutoria,
                       m.nombre_materia,
                       mod_grad.nombre AS nombre_modalidad,
                       u_est.nombre AS estudiante_nombre, u_est.apellido AS estudiante_apellido,
                       u_tut.nombre AS tutor_nombre, u_tut.apellido AS tutor_apellido
                FROM cartas_designacion c
                INNER JOIN tutorias t ON c.id_tutoria = t.id_tutoria
                INNER JOIN materias m ON t.id_materia = m.id_materia
                LEFT JOIN modalidades_graduacion mod_grad ON t.id_modalidad = mod_grad.id_modalidad
                INNER JOIN estudiantes e ON c.id_estudiante = e.id_estudiante
                INNER JOIN usuarios u_est ON e.id_usuario = u_est.id_usuario
                INNER JOIN tutores tut ON c.id_tutor = tut.id_tutor
                INNER JOIN usuarios u_tut ON tut.id_usuario = u_tut.id_usuario
                WHERE c.id_carta = :id_carta";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_carta' => $id_carta]);

        return $stmt->fetch();
    }

    public function obtenerPendientePorTutoria($id_tutoria)
    {
        $sql = "SELECT * FROM cartas_designacion 
                WHERE id_tutoria = :id_tutoria AND tipo_firma = 'pendiente' LIMIT 1";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_tutoria' => $id_tutoria]);
        return $stmt->fetch();
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO cartas_designacion (id_tutoria, id_tutor, id_estudiante, creado_por, tipo_firma, fecha_generacion)
                VALUES (:id_tutoria, :id_tutor, :id_estudiante, :creado_por, 'pendiente', CURRENT_TIMESTAMP)";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id_tutoria' => $datos['id_tutoria'],
            ':id_tutor' => $datos['id_tutor'],
            ':id_estudiante' => $datos['id_estudiante'],
            ':creado_por' => $datos['creado_por']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function aceptar($id_carta)
    {
        $sql = "UPDATE cartas_designacion 
                SET tipo_firma = 'aceptada', fecha_firma = CURRENT_TIMESTAMP 
                WHERE id_carta = :id_carta";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([':id_carta' => $id_carta]);
    }

    public function rechazar($id_carta, $motivo)
    {
        $sql = "UPDATE cartas_designacion 
                SET tipo_firma = 'rechazada', fecha_firma = CURRENT_TIMESTAMP, motivo_rechazo = :motivo 
                WHERE id_carta = :id_carta";
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            ':id_carta' => $id_carta,
            ':motivo' => $motivo
        ]);
    }
}
