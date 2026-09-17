<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Tutores - Sistema de Tutorías</title>
</head>

<body>

<h1>Tutores registrados</h1>

<p>
    <a href="tutores_crear.php">+ Nuevo tutor</a>
</p>

<table border="1" cellpadding="6" cellspacing="0">

    <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Usuario</th>
        <th>Correo</th>
        <th>Especialidad</th>
        <th>Biografía</th>
        <th>Acciones</th>
    </tr>

    <?php foreach ($tutores as $t): ?>

        <tr>

            <td>
                <?= htmlspecialchars($t['id_tutor']) ?>
            </td>

            <td>
                <?= htmlspecialchars(
                    $t['nombre'] . ' ' . $t['apellido']
                ) ?>
            </td>

            <td>
                <?= htmlspecialchars($t['usuario']) ?>
            </td>

            <td>
                <?= htmlspecialchars($t['correo']) ?>
            </td>

            <td>
                <?= htmlspecialchars($t['especialidad'] ?? '') ?>
            </td>

            <td>
                <?= htmlspecialchars($t['biografia'] ?? '') ?>
            </td>

            <td>

                <a href="tutores_editar.php?id=<?= $t['id_tutor'] ?>">
                    Editar
                </a>

                |

                <a href="tutores_eliminar.php?id=<?= $t['id_tutor'] ?>"
                   onclick="return confirm('¿Eliminar este tutor?');">
                    Eliminar
                </a>

            </td>

        </tr>

    <?php endforeach; ?>

    <?php if (empty($tutores)): ?>

        <tr>
            <td colspan="7">
                No hay tutores registrados todavía.
            </td>
        </tr>

    <?php endif; ?>

</table>

</body>
</html>