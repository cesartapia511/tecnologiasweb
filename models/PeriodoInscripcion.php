<?php

require_once __DIR__ . '/../config/conexion.php';

class PeriodoInscripcion
{
    private $pdo;

    public function __construct()
    {
        global $pdo;
        $this->pdo = $pdo;
    }

    public function obtenerTodos()
    {
        $sql = "SELECT *
                FROM periodos_inscripcion
                ORDER BY fecha_inicio DESC, id_periodo DESC";

        return $this->pdo->query($sql)->fetchAll();
    }

    public function obtenerPeriodoActivo()
    {
        $sql = "SELECT *
                FROM periodos_inscripcion
                WHERE activo = 1
                  AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
                LIMIT 1";

        $stmt = $this->pdo->query($sql);

        return $stmt->fetch() ?: null;
    }

    public function crear($datos)
    {
        $sql = "INSERT INTO periodos_inscripcion
                (nombre, descripcion, fecha_inicio, fecha_fin, activo)
                VALUES
                (:nombre, :descripcion, :fecha_inicio, :fecha_fin, 0)";

        $stmt = $this->pdo->prepare($sql);

        $stmt->execute([
            ':nombre' => trim($datos['nombre']),
            ':descripcion' => trim($datos['descripcion'] ?? ''),
            ':fecha_inicio' => $datos['fecha_inicio'],
            ':fecha_fin' => $datos['fecha_fin']
        ]);

        return $this->pdo->lastInsertId();
    }

    public function activar($idPeriodo)
    {
        $this->pdo->beginTransaction();

        try {
            // Solo puede existir un periodo activo.
            $this->pdo->exec(
                "UPDATE periodos_inscripcion
                 SET activo = 0
                 WHERE activo = 1"
            );

            $stmt = $this->pdo->prepare(
                "UPDATE periodos_inscripcion
                 SET activo = 1
                 WHERE id_periodo = :id"
            );

            $stmt->execute([
                ':id' => $idPeriodo
            ]);

            $this->pdo->commit();

            return true;
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }

            throw $e;
        }
    }

    public function desactivar($idPeriodo)
    {
        $stmt = $this->pdo->prepare(
            "UPDATE periodos_inscripcion
             SET activo = 0
             WHERE id_periodo = :id"
        );

        return $stmt->execute([
            ':id' => $idPeriodo
        ]);
    }
}