<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Roles - Sistema de Tutorías</title>
</head>

<body>

<h1>Roles registrados</h1>

<p>
    <a href="roles_crear.php">
        + Nuevo rol
    </a>
</p>

<table border="1" cellpadding="6" cellspacing="0">

    <tr>
        <th>ID</th>
        <th>Nombre del rol</th>
        <th>Acciones</th>
    </tr>

    <?php foreach ($roles as $r): ?>

        <tr>

            <td>
                <?= htmlspecialchars($r['id_rol']) ?>
            </td>

            <td>
                <?= htmlspecialchars($r['nombre_rol']) ?>
            </td>

            <td>

                <a href="roles_editar.php?id=<?= $r['id_rol'] ?>">
                    Editar
                </a>

                |

                <a href="roles_eliminar.php?id=<?= $r['id_rol'] ?>"
                   onclick="return confirm('¿Eliminar este rol?');">
                    Eliminar
                </a>

            </td>

        </tr>

    <?php endforeach; ?>

</table>

</body>
</html>