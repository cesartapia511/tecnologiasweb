<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Tutor - Materia</title>
</head>

<body>

<h1>Materias asignadas a tutores</h1>

<p>
    <a href="tutor_materia_crear.php">
        + Nueva asignación
    </a>
</p>

<table border="1" cellpadding="6" cellspacing="0">

    <tr>
        <th>Tutor</th>
        <th>Materia</th>
        <th>Acciones</th>
    </tr>

    <?php foreach ($asignaciones as $a): ?>

        <tr>

            <td>
                <?= htmlspecialchars(
                    $a['nombre'] . ' ' . $a['apellido']
                ) ?>
            </td>

            <td>
                <?= htmlspecialchars($a['nombre_materia']) ?>
            </td>

            <td>

                <a href="tutor_materia_editar.php?id_tutor=<?= $a['id_tutor'] ?>&id_materia=<?= $a['id_materia'] ?>">
                    Editar
                </a>

                |

                <a href="tutor_materia_eliminar.php?id_tutor=<?= $a['id_tutor'] ?>&id_materia=<?= $a['id_materia'] ?>"
                   onclick="return confirm('¿Eliminar esta asignación?');">
                    Eliminar
                </a>

            </td>

        </tr>

    <?php endforeach; ?>

    <?php if (empty($asignaciones)): ?>

        <tr>
            <td colspan="3">
                No hay materias asignadas.
            </td>
        </tr>

    <?php endif; ?>

</table>

</body>
</html>