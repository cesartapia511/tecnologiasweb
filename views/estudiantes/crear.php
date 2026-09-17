<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nuevo estudiante</title>
</head>

<body>

<h1>Registrar nuevo estudiante</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<?php if (empty($usuarios)): ?>

    <p>
        No hay usuarios con rol estudiante disponibles.
    </p>

    <p>
        Primero debes crear un usuario con rol estudiante.
    </p>

    <a href="usuarios_crear.php">
        Crear usuario
    </a>

<?php else: ?>

<form method="POST">

    <label>
        Usuario:

        <select name="id_usuario" required>

            <option value="">
                Seleccione un usuario
            </option>

            <?php foreach ($usuarios as $u): ?>

                <option value="<?= $u['id_usuario'] ?>">

                    <?= htmlspecialchars(
                        $u['nombre'] . ' ' .
                        $u['apellido'] . ' (' .
                        $u['usuario'] . ')'
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Carrera:

        <select name="id_carrera" required>

            <option value="">
                Seleccione una carrera
            </option>

            <?php foreach ($carreras as $c): ?>

                <option value="<?= $c['id_carrera'] ?>">

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
            required
        >

    </label>

    <br><br>

    <label>
        Registro universitario:

        <input
            type="text"
            name="registro_universitario"
        >

    </label>

    <br><br>

    <button type="submit">
        Guardar
    </button>

    <a href="estudiantes_listar.php">
        Cancelar
    </a>

</form>

<?php endif; ?>

</body>
</html>