<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar materia</title>
</head>

<body>

<h1>Editar materia</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_materia"
        value="<?= htmlspecialchars($materia_actual['id_materia']) ?>"
    >

    <label>
        Nombre de materia:

        <input
            type="text"
            name="nombre_materia"
            value="<?= htmlspecialchars($materia_actual['nombre_materia']) ?>"
            required
        >

    </label>

    <br><br>

    <label>
        Carrera:

        <select name="id_carrera" required>

            <?php foreach ($carreras as $c): ?>

                <option
                    value="<?= $c['id_carrera'] ?>"
                    <?= $c['id_carrera'] == $materia_actual['id_carrera'] ? 'selected' : '' ?>
                >

                    <?= htmlspecialchars($c['nombre_carrera']) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <button type="submit">Actualizar</button>

    <a href="materias_listar.php">Cancelar</a>

</form>

</body>
</html>