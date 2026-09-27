<?php

class NotificacionModel
{
    private $pdo;

    public function __construct($pdo)
    {
        $this->pdo = $pdo;
    }

    public function obtenerPorUsuario($id_usuario, $limite = 50)
    {
        $sql = "SELECT * FROM notificaciones WHERE id_usuario = :id_usuario ORDER BY fecha_creacion DESC LIMIT :limite";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':id_usuario', $id_usuario, PDO::PARAM_INT);
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function crear($id_usuario, $titulo, $mensaje, $tipo = 'info')
    {
        $sql = "INSERT INTO notificaciones (id_usuario, titulo, mensaje, tipo) VALUES (:id_usuario, :titulo, :mensaje, :tipo)";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id_usuario' => $id_usuario,
            ':titulo' => $titulo,
            ':mensaje' => $mensaje,
            ':tipo' => $tipo
        ]);
        return $this->pdo->lastInsertId();
    }

    public function marcarComoLeida($id_notificacion, $id_usuario)
    {
        $sql = "UPDATE notificaciones SET leida = TRUE WHERE id_notificacion = :id_notificacion AND id_usuario = :id_usuario";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':id_notificacion' => $id_notificacion,
            ':id_usuario' => $id_usuario
        ]);
        return $stmt->rowCount() > 0;
    }

    public function marcarTodasComoLeidas($id_usuario)
    {
        $sql = "UPDATE notificaciones SET leida = TRUE WHERE id_usuario = :id_usuario AND leida = FALSE";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_usuario' => $id_usuario]);
        return $stmt->rowCount();
    }
    
    public function contarNoLeidas($id_usuario)
    {
        $sql = "SELECT COUNT(*) as total FROM notificaciones WHERE id_usuario = :id_usuario AND leida = FALSE";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([':id_usuario' => $id_usuario]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
