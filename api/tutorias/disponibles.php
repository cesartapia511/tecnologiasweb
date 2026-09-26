<?php

require_once __DIR__ . '/../cors.php';
require_once __DIR__ . '/../../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonError(
        'Método no permitido',
        405,
        'Este endpoint únicamente acepta solicitudes GET.'
    );
}

$usuarioAuth = requerirPermiso($pdo, 'listar_tutoria');

if (
    empty($usuarioAuth['id_estudiante']) ||
    $usuarioAuth['rol'] !== 'estudiante'
) {
    jsonError(
        'Perfil de estudiante requerido',
        403,
        'Solo un usuario con perfil de estudiante puede consultar tutorías disponibles.'
    );
}

$id_estudiante = (int) $usuarioAuth['id_estudiante'];

/*
 * Verificar que exista un periodo de inscripción activo.
 */
$stmtPeriodo = $pdo->query("
    SELECT id_periodo, nombre, fecha_inicio, fecha_fin
    FROM periodos_inscripcion
    WHERE activo = 1
      AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
    LIMIT 1
");

$periodo = $stmtPeriodo->fetch(PDO::FETCH_ASSOC);

if (!$periodo) {
    jsonSuccess(
        [],
        'No existe un periodo de inscripción activo.'
    );
}

/*
 * Consultar tutorías futuras con cupos disponibles.
 *
 * Se cuenta únicamente a los estudiantes con estado 'inscrito'.
 * También se indica si el estudiante actual ya está inscrito.
 */
$sql = "
    SELECT
        tu.id_tutoria,
        tu.id_tutor,
        tu.id_materia,
        tu.fecha,
        tu.hora_inicio,
        tu.hora_fin,
        tu.modalidad,
        tu.lugar_o_enlace,
        tu.estado,
        tu.observaciones,
        tu.cupo_maximo,

        m.nombre_materia,

        ut.nombre AS tutor_nombre,
        ut.apellido AS tutor_apellido,
        t.especialidad AS tutor_especialidad,

        COALESCE(ins.inscritos, 0) AS cupos_ocupados,

        (tu.cupo_maximo - COALESCE(ins.inscritos, 0)) AS cupos_disponibles,

        CASE
            WHEN mi.id_estudiante IS NOT NULL THEN 1
            ELSE 0
        END AS ya_inscrito

    FROM tutorias tu

    INNER JOIN materias m
        ON tu.id_materia = m.id_materia

    INNER JOIN tutores t
        ON tu.id_tutor = t.id_tutor

    INNER JOIN usuarios ut
        ON t.id_usuario = ut.id_usuario

    LEFT JOIN (
        SELECT
            id_tutoria,
            COUNT(*) AS inscritos
        FROM tutoria_estudiante
        WHERE estado_asignacion = 'inscrito'
        GROUP BY id_tutoria
    ) ins
        ON ins.id_tutoria = tu.id_tutoria

    LEFT JOIN tutoria_estudiante mi
        ON mi.id_tutoria = tu.id_tutoria
       AND mi.id_estudiante = ?
       AND mi.estado_asignacion = 'inscrito'

    WHERE tu.fecha >= CURDATE()
      AND tu.estado IN ('pendiente', 'confirmada')
      AND (
          tu.cupo_maximo - COALESCE(ins.inscritos, 0)
      ) > 0

    ORDER BY
        tu.fecha ASC,
        tu.hora_inicio ASC
";

$stmt = $pdo->prepare($sql);
$stmt->execute([$id_estudiante]);

$tutorias = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($tutorias as &$tutoria) {
    $tutoria['id_tutoria'] = (int) $tutoria['id_tutoria'];
    $tutoria['id_tutor'] = (int) $tutoria['id_tutor'];
    $tutoria['id_materia'] = (int) $tutoria['id_materia'];
    $tutoria['cupo_maximo'] = (int) $tutoria['cupo_maximo'];
    $tutoria['cupos_ocupados'] = (int) $tutoria['cupos_ocupados'];
    $tutoria['cupos_disponibles'] = (int) $tutoria['cupos_disponibles'];
    $tutoria['ya_inscrito'] = (bool) $tutoria['ya_inscrito'];
}

jsonSuccess(
    [
        'periodo' => $periodo,
        'tutorias' => $tutorias
    ],
    'Tutorías disponibles consultadas correctamente'
);
