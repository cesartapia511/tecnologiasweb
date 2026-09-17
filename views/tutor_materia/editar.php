<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar asignación</title>
</head>

<body>

<h1>Editar materia asignada</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_tutor_original"
        value="<?= htmlspecialchars(
            $asignacion_actual['id_tutor']
        ) ?>"
    >

    <input
        type="hidden"
        name="id_materia_original"
        value="<?= htmlspecialchars(
            $asignacion_actual['id_materia']
        ) ?>"
    >

    <label>
        Tutor:

        <select name="id_tutor" required>

            <?php foreach ($tutores as $t): ?>

                <option
                    value="<?= $t['id_tutor'] ?>"
                    <?= $t['id_tutor'] ==
                        $asignacion_actual['id_tutor']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $t['nombre'] . ' ' .
                        $t['apellido']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Materia:

        <select name="id_materia" required>

            <?php foreach ($materias as $m): ?>

                <option
                    value="<?= $m['id_materia'] ?>"
                    <?= $m['id_materia'] ==
                        $asignacion_actual['id_materia']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $m['nombre_materia']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="tutor_materia_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>