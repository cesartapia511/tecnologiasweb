<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nueva materia</title>
</head>

<body>

<h1>Registrar nueva materia</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <label>
        Nombre de materia:
        <input type="text" name="nombre_materia" required>
    </label>

    <br><br>

    <label>
        Carrera:

        <select name="id_carrera" required>

            <option value="">Seleccione una carrera</option>

            <?php foreach ($carreras as $c): ?>

                <option value="<?= $c['id_carrera'] ?>">
                    <?= htmlspecialchars($c['nombre_carrera']) ?>
                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <button type="submit">Guardar</button>

    <a href="materias_listar.php">Cancelar</a>

</form>

</body>
</html>