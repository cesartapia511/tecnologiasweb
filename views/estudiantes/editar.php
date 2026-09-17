<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar estudiante</title>
</head>

<body>

<h1>Editar estudiante</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_estudiante"
        value="<?= htmlspecialchars(
            $estudiante_actual['id_estudiante']
        ) ?>"
    >

    <p>
        <strong>Estudiante:</strong>

        <?= htmlspecialchars(
            $estudiante_actual['nombre'] . ' ' .
            $estudiante_actual['apellido']
        ) ?>
    </p>

    <p>
        <strong>Usuario:</strong>

        <?= htmlspecialchars(
            $estudiante_actual['usuario']
        ) ?>
    </p>

    <label>
        Carrera:

        <select name="id_carrera" required>

            <?php foreach ($carreras as $c): ?>

                <option
                    value="<?= $c['id_carrera'] ?>"
                    <?= $c['id_carrera'] ==
                        $estudiante_actual['id_carrera']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $c['nombre_carrera']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Semestre:

        <input
            type="number"
            name="semestre"
            min="1"
            value="<?= htmlspecialchars(
                $estudiante_actual['semestre']
            ) ?>"
            required
        >

    </label>

    <br><br>

    <label>
        Registro universitario:

        <input
            type="text"
            name="registro_universitario"
            value="<?= htmlspecialchars(
                $estudiante_actual['registro_universitario'] ?? ''
            ) ?>"
        >

    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="estudiantes_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>