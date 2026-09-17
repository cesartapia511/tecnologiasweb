<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Materias - Sistema de Tutorías</title>
</head>

<body>

<h1>Materias registradas</h1>

<p>
    <a href="materias_crear.php">+ Nueva materia</a>
</p>

<table border="1" cellpadding="6" cellspacing="0">

    <tr>
        <th>ID</th>
        <th>Materia</th>
        <th>Carrera</th>
        <th>Acciones</th>
    </tr>

    <?php foreach ($materias as $m): ?>

        <tr>

            <td><?= htmlspecialchars($m['id_materia']) ?></td>

            <td><?= htmlspecialchars($m['nombre_materia']) ?></td>

            <td>
                <?= htmlspecialchars($m['nombre_carrera'] ?? 'Sin carrera') ?>
            </td>

            <td>

                <a href="materias_editar.php?id=<?= $m['id_materia'] ?>">
                    Editar
                </a>

                |

                <a href="materias_eliminar.php?id=<?= $m['id_materia'] ?>"
                   onclick="return confirm('¿Eliminar esta materia?');">
                    Eliminar
                </a>

            </td>

        </tr>

    <?php endforeach; ?>

    <?php if (empty($materias)): ?>

        <tr>
            <td colspan="4">No hay materias registradas todavía.</td>
        </tr>

    <?php endif; ?>

</table>

</body>
</html>