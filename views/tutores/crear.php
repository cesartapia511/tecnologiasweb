<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nuevo tutor</title>
</head>

<body>

<h1>Registrar nuevo tutor</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<?php if (empty($usuarios)): ?>

    <p>
        No hay usuarios con rol tutor disponibles.
    </p>

    <p>
        Primero debes crear un usuario con rol tutor.
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
        Especialidad:

        <input
            type="text"
            name="especialidad"
            required
        >

    </label>

    <br><br>

    <label>
        Biografía:
        <br>

        <textarea
            name="biografia"
            rows="5"
            cols="50"
        ></textarea>

    </label>

    <br><br>

    <button type="submit">
        Guardar
    </button>

    <a href="tutores_listar.php">
        Cancelar
    </a>

</form>

<?php endif; ?>

</body>
</html>