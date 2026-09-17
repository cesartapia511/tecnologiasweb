<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Disponibilidad de tutores</title>
</head>

<body>

<h1>Disponibilidad de tutores</h1>

<p>
    <a href="disponibilidad_crear.php">
        + Nueva disponibilidad
    </a>
</p>

<table border="1" cellpadding="6" cellspacing="0">

    <tr>
        <th>ID</th>
        <th>Tutor</th>
        <th>Día</th>
        <th>Hora inicio</th>
        <th>Hora fin</th>
        <th>Acciones</th>
    </tr>

    <?php foreach ($disponibilidades as $d): ?>

        <tr>

            <td>
                <?= htmlspecialchars($d['id_disponibilidad']) ?>
            </td>

            <td>
                <?= htmlspecialchars(
                    $d['nombre'] . ' ' . $d['apellido']
                ) ?>
            </td>

            <td>
                <?= htmlspecialchars($d['dia_semana']) ?>
            </td>

            <td>
                <?= htmlspecialchars($d['hora_inicio']) ?>
            </td>

            <td>
                <?= htmlspecialchars($d['hora_fin']) ?>
            </td>

            <td>

                <a href="disponibilidad_editar.php?id=<?= $d['id_disponibilidad'] ?>">
                    Editar
                </a>

                |

                <a href="disponibilidad_eliminar.php?id=<?= $d['id_disponibilidad'] ?>"
                   onclick="return confirm('¿Eliminar esta disponibilidad?');">
                    Eliminar
                </a>

            </td>

        </tr>

    <?php endforeach; ?>

    <?php if (empty($disponibilidades)): ?>

        <tr>
            <td colspan="6">
                No hay disponibilidades registradas.
            </td>
        </tr>

    <?php endif; ?>

</table>

</body>
</html>