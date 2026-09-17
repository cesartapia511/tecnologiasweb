<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Evaluaciones - Sistema de Tutorías</title>
</head>

<body>

<h1>Evaluaciones de tutorías</h1>

<p>
    <a href="evaluaciones_crear.php">
        + Nueva evaluación
    </a>
</p>


<table border="1" cellpadding="6" cellspacing="0">

<tr>
    <th>ID</th>
    <th>Estudiante</th>
    <th>Materia</th>
    <th>Fecha tutoría</th>
    <th>Calificación</th>
    <th>Comentario</th>
    <th>Fecha evaluación</th>
    <th>Acciones</th>
</tr>


<?php foreach ($evaluaciones as $e): ?>

<tr>

    <td>
        <?= htmlspecialchars($e['id_evaluacion']) ?>
    </td>


    <td>
        <?= htmlspecialchars(
            $e['estudiante_nombre'] . ' ' .
            $e['estudiante_apellido']
        ) ?>
    </td>


    <td>
        <?= htmlspecialchars(
            $e['nombre_materia']
        ) ?>
    </td>


    <td>
        <?= htmlspecialchars(
            $e['fecha']
        ) ?>
    </td>


    <td>
        <?= htmlspecialchars(
            $e['calificacion']
        ) ?>/5
    </td>


    <td>
        <?= htmlspecialchars(
            $e['comentario']
        ) ?>
    </td>


    <td>
        <?= htmlspecialchars(
            $e['fecha_evaluacion']
        ) ?>
    </td>


    <td>

        <a href="evaluaciones_editar.php?id=<?= $e['id_evaluacion'] ?>">
            Editar
        </a>

        |

        <a 
        href="evaluaciones_eliminar.php?id=<?= $e['id_evaluacion'] ?>"
        onclick="return confirm('¿Eliminar esta evaluación?');">
            Eliminar
        </a>

    </td>


</tr>

<?php endforeach; ?>


<?php if(empty($evaluaciones)): ?>

<tr>

    <td colspan="8">
        No existen evaluaciones registradas.
    </td>

</tr>

<?php endif; ?>


</table>


</body>
</html>