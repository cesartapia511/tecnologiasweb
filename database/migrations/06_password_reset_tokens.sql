CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `id_token` int AUTO_INCREMENT PRIMARY KEY,
  `id_usuario` int NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expira_en` datetime NOT NULL,
  `usado` tinyint(1) DEFAULT 0,
  KEY `idx_token_hash` (`token_hash`),
  KEY `idx_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_password_reset_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
