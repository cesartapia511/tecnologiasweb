<?php

require_once __DIR__ . '/../config/conexion.php';

class SolicitudMateriaModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerTodas()
    {
        $stmt = $this->pdo->query("
            SELECT s.*, 
                   u.nombre as tutor_nombres, u.apellido as tutor_apellidos, t.especialidad,
                   m.nombre_materia, c.nombre_carrera
            FROM solicitudes_materias s
            JOIN tutores t ON s.id_tutor = t.id_tutor
            JOIN usuarios u ON t.id_usuario = u.id_usuario
            JOIN materias m ON s.id_materia = m.id_materia
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            ORDER BY s.fecha_solicitud DESC
        ");
        return $stmt->fetchAll();
    }

    public function obtenerPorTutor($id_tutor)
    {
        $stmt = $this->pdo->prepare("
            SELECT s.*, m.nombre_materia, c.nombre_carrera
            FROM solicitudes_materias s
            JOIN materias m ON s.id_materia = m.id_materia
            LEFT JOIN carreras c ON m.id_carrera = c.id_carrera
            WHERE s.id_tutor = :id_tutor
            ORDER BY s.fecha_solicitud DESC
        ");
        $stmt->execute([':id_tutor' => $id_tutor]);
        return $stmt->fetchAll();
    }

    public function obtenerPorId($id_solicitud)
    {
        $stmt = $this->pdo->prepare("
            SELECT * FROM solicitudes_materias 
            WHERE id_solicitud = :id_solicitud
        ");
        $stmt->execute([':id_solicitud' => $id_solicitud]);
        return $stmt->fetch();
    }

    public function crear($id_tutor, $id_materia, $dia_semana, $hora_inicio, $hora_fin)
    {
        // Verificar si ya existe una solicitud en ese día y turno para el mismo tutor
        $stmt = $this->pdo->prepare("
            SELECT id_solicitud FROM solicitudes_materias 
            WHERE id_tutor = :id_tutor 
              AND dia_semana = :dia_semana 
              AND hora_inicio = :hora_inicio 
              AND estado IN ('pendiente', 'aprobada')
        ");
        $stmt->execute([
            ':id_tutor' => $id_tutor, 
            ':dia_semana' => $dia_semana, 
            ':hora_inicio' => $hora_inicio
        ]);
        if ($stmt->fetch()) {
            throw new Exception('El tutor ya tiene una solicitud pendiente o materia aprobada en ese día y turno.');
        }

        // Eliminada validación global de tutor_materia porque la limitación es por día y bloque.


        $stmt = $this->pdo->prepare("
            INSERT INTO solicitudes_materias (id_tutor, id_materia, dia_semana, hora_inicio, hora_fin, estado)
            VALUES (:id_tutor, :id_materia, :dia_semana, :hora_inicio, :hora_fin, 'pendiente')
        ");
        $stmt->execute([
            ':id_tutor' => $id_tutor, 
            ':id_materia' => $id_materia,
            ':dia_semana' => $dia_semana,
            ':hora_inicio' => $hora_inicio,
            ':hora_fin' => $hora_fin
        ]);
        return $this->pdo->lastInsertId();
    }

    public function actualizarEstado($id_solicitud, $estado)
    {
        $stmt = $this->pdo->prepare("
            UPDATE solicitudes_materias 
            SET estado = :estado, fecha_resolucion = CURRENT_TIMESTAMP
            WHERE id_solicitud = :id_solicitud
        ");
        $stmt->execute([':estado' => $estado, ':id_solicitud' => $id_solicitud]);
        return $stmt->rowCount();
    }
}
