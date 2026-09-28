# Diccionario de datos

Convención: PK = clave primaria · FK = clave foránea · AI = autoincremental.

## 1. Seguridad y acceso

### roles
| Campo | Tipo | Notas |
|---|---|---|
| id_rol | INT AI PK | 1 administrador, 2 tutor, 3 estudiante |
| nombre_rol | VARCHAR(50) | Único |

### usuarios
| Campo | Tipo | Notas |
|---|---|---|
| id_usuario | INT AI PK | |
| id_rol | INT FK → roles | |
| nombre, apellido | VARCHAR(100) | |
| correo | VARCHAR(150) | Único |
| usuario | VARCHAR(50) | Único |
| contrasena_hash | VARCHAR(255) | Hash generado con `password_hash` |
| telefono | VARCHAR(20) | Opcional |
| estado | ENUM('activo','inactivo') | Por defecto `activo` |
| fecha_registro | DATETIME | Por defecto la fecha actual |
| foto_perfil | VARCHAR | Nombre del archivo de la foto guardada en `uploads/perfiles/` |

### permisos
| Campo | Tipo | Notas |
|---|---|---|
| id_permiso | INT AI PK | 33 permisos sembrados |
| nombre_permiso | VARCHAR(100) | Único, por ejemplo `listar_tutoria` |
| modulo | VARCHAR(50) | |
| descripcion | VARCHAR(255) | |

### rol_permisos
| Campo | Tipo | Notas |
|---|---|---|
| id_rol | INT FK → roles | PK compuesta |
| id_permiso | INT FK → permisos | PK compuesta |

### registro_accesos
| Campo | Tipo | Notas |
|---|---|---|
| id_acceso | INT AI PK | |
| id_usuario | INT FK → usuarios | Nulo si el usuario se elimina |
| fecha_hora | DATETIME | |
| ip_origen | VARCHAR(45) | |
| resultado | ENUM('exitoso','fallido') | |

### password_reset_tokens
Estructura según su uso en `api/auth/recuperar.php`, `verificar-token.php` y `restablecer.php`.

| Campo | Tipo | Notas |
|---|---|---|
| id_usuario | INT FK → usuarios | Usuario que pidió la recuperación |
| token_hash | VARCHAR(64) | Hash SHA-256 del token; el token original no se guarda |
| expira_en | DATETIME | Solicitud + 15 minutos |

## 2. Catálogos

### carreras
| Campo | Tipo | Notas |
|---|---|---|
| id_carrera | INT AI PK | |
| nombre_carrera | VARCHAR(150) | |

### estudiantes
| Campo | Tipo | Notas |
|---|---|---|
| id_estudiante | INT AI PK | |
| id_usuario | INT FK → usuarios | Único |
| id_carrera | INT FK → carreras | |
| semestre | TINYINT | |
| registro_universitario | VARCHAR(30) | Único |

### tutores
| Campo | Tipo | Notas |
|---|---|---|
| id_tutor | INT AI PK | |
| id_usuario | INT FK → usuarios | Único |
| especialidad | VARCHAR(150) | |
| biografia | TEXT | |

### materias
| Campo | Tipo | Notas |
|---|---|---|
| id_materia | INT AI PK | |
| nombre_materia | VARCHAR(150) | |
| id_carrera | INT FK → carreras | |

### tutor_materia
| Campo | Tipo | Notas |
|---|---|---|
| id_tutor | INT FK → tutores | PK compuesta |
| id_materia | INT FK → materias | PK compuesta |

## 3. Agenda

### disponibilidad_tutor
| Campo | Tipo | Notas |
|---|---|---|
| id_disponibilidad | INT AI PK | |
| id_tutor | INT FK → tutores | |
| dia_semana | ENUM('Lunes','Martes','Miercoles','Jueves','Viernes','Sabado') | |
| hora_inicio, hora_fin | TIME | Bloque de 30 minutos a 3 horas |

### tutorias
| Campo | Tipo | Notas |
|---|---|---|
| id_tutoria | INT AI PK | |
| id_estudiante | INT FK → estudiantes | |
| id_tutor | INT FK → tutores | |
| id_materia | INT FK → materias | |
| fecha | DATE | |
| hora_inicio, hora_fin | TIME | |
| modalidad | ENUM('presencial','virtual') | Por defecto `presencial` |
| lugar_o_enlace | VARCHAR(200) | |
| cupo_maximo | INT | Por defecto 5 (migración `gestion_cupos_periodos.sql`) |
| estado | ENUM | `pendiente`, `confirmada`, `realizada`, `cancelada`; el flujo de cartas usa además `asignada` y `en_reasignacion` (ver [estados-tutoria.md](estados-tutoria.md)) |
| observaciones | TEXT | |
| fecha_solicitud | DATETIME | |
| id_modalidad | INT | Modalidad de graduación elegida al generar una carta de designación (valor 1 por defecto) |

### evaluaciones_tutoria
| Campo | Tipo | Notas |
|---|---|---|
| id_evaluacion | INT AI PK | |
| id_tutoria | INT FK → tutorias | Único: una evaluación por tutoría |
| calificacion | TINYINT | 1 a 5 |
| comentario | TEXT | Hasta 1000 caracteres |
| fecha_evaluacion | DATETIME | |

## 4. Inscripción

### periodos_inscripcion
| Campo | Tipo | Notas |
|---|---|---|
| id_periodo | INT AI PK | |
| nombre | VARCHAR(150) | |
| descripcion | TEXT | |
| fecha_inicio, fecha_fin | DATE | |
| activo | TINYINT(1) | Solo un periodo activo a la vez |
| fecha_creacion | DATETIME | |

### tutoria_estudiante
| Campo | Tipo | Notas |
|---|---|---|
| id_tutoria | INT FK → tutorias | PK compuesta |
| id_estudiante | INT FK → estudiantes | PK compuesta |
| fecha_asignacion | DATETIME | |
| estado_asignacion | ENUM('inscrito','cancelado') | Por defecto `inscrito` |

## 5. Seguimiento de la tutoría

Estructura según los modelos `CartaDesignacionModel`, `ReunionModel` e `InformeAvanceModel` y sus endpoints.

### modalidades_graduacion
Estructura según el `JOIN` de `CartaDesignacionModel` (`id_modalidad`, `nombre`); la referencia `tutorias.id_modalidad` la usa al generar la carta.

| Campo | Tipo | Notas |
|---|---|---|
| id_modalidad | INT AI PK | |
| nombre | VARCHAR | Nombre de la modalidad de graduación |

### cartas_designacion
| Campo | Tipo | Notas |
|---|---|---|
| id_carta | INT AI PK | |
| id_tutoria | INT FK → tutorias | |
| id_tutor | INT FK → tutores | |
| id_estudiante | INT FK → estudiantes | |
| creado_por | INT FK → usuarios | Quien generó la carta |
| tipo_firma | ENUM('pendiente','aceptada','rechazada') | Nace `pendiente` |
| motivo_rechazo | VARCHAR | Solo si fue rechazada |
| fecha_generacion | DATETIME | |
| fecha_firma | DATETIME | Se llena al aceptar o rechazar |

### reuniones
| Campo | Tipo | Notas |
|---|---|---|
| id_reunion | INT AI PK | |
| id_tutoria | INT FK → tutorias | |
| fecha | DATE | |
| hora_inicio, hora_fin | TIME | |
| lugar_o_enlace | VARCHAR | |
| asistio_estudiante | ENUM('si','no','tardanza','no_aplica') | |
| minutos_tardanza | INT | Mayor a 0 solo si hay tardanza |
| evidencia_url | VARCHAR | URL de la evidencia (opcional) |
| observaciones | TEXT | |
| firma_tutor, firma_estudiante | TINYINT(1) | 0 al registrar; se activan por separado |
| fecha_registro | DATETIME | |

### informes_avance
| Campo | Tipo | Notas |
|---|---|---|
| id_informe | INT AI PK | |
| id_tutoria | INT FK → tutorias | |
| numero_informe | INT | Único por tutoría |
| fecha_registro | DATETIME | |
| fecha_limite | DATE | Opcional |
| descripcion_avance | TEXT | |
| porcentaje_avance | TINYINT | 0 a 100 |
| registrado_por | INT FK → usuarios | |

## 6. Comunicación

### notificaciones
Script: `database/create_notificaciones_table.php`.

| Campo | Tipo | Notas |
|---|---|---|
| id_notificacion | INT AI PK | |
| id_usuario | INT FK → usuarios | Se elimina en cascada con el usuario |
| titulo | VARCHAR(150) | |
| mensaje | TEXT | |
| tipo | VARCHAR(50) | `info`, `success`, `warning` o `danger` |
| leida | BOOLEAN | Por defecto falso |
| fecha_creacion | TIMESTAMP | |
