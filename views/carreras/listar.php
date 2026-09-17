<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Carreras - Sistema de Tutorías</title>
</head>

<body>

    <h1>Carreras registradas</h1>

    <p>
        <a href="carreras_crear.php">+ Nueva carrera</a>
    </p>

    <table border="1" cellpadding="6" cellspacing="0">

        <tr>
            <th>ID</th>
            <th>Nombre de carrera</th>
            <th>Acciones</th>
        </tr>

        <?php foreach ($carreras as $c): ?>

            <tr>

                <td>
                    <?= htmlspecialchars($c['id_carrera']) ?>
                </td>

                <td>
                    <?= htmlspecialchars($c['nombre_carrera']) ?>
                </td>

                <td>

                    <a href="carreras_editar.php?id=<?= $c['id_carrera'] ?>">
                        Editar
                    </a>

                    |

                    <a href="carreras_eliminar.php?id=<?= $c['id_carrera'] ?>"
                       onclick="return confirm('¿Eliminar esta carrera?');">
                        Eliminar
                    </a>

                </td>

            </tr>

        <?php endforeach; ?>

        <?php if (empty($carreras)): ?>

            <tr>
                <td colspan="3">
                    No hay carreras registradas todavía.
                </td>
            </tr>

        <?php endif; ?>

    </table>

</body>

</html>