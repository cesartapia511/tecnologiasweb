<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar tutor</title>
</head>

<body>

<h1>Editar tutor</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_tutor"
        value="<?= htmlspecialchars(
            $tutor_actual['id_tutor']
        ) ?>"
    >

    <p>
        <strong>Tutor:</strong>

        <?= htmlspecialchars(
            $tutor_actual['nombre'] . ' ' .
            $tutor_actual['apellido']
        ) ?>
    </p>

    <p>
        <strong>Usuario:</strong>

        <?= htmlspecialchars(
            $tutor_actual['usuario']
        ) ?>
    </p>

    <label>
        Especialidad:

        <input
            type="text"
            name="especialidad"
            value="<?= htmlspecialchars(
                $tutor_actual['especialidad'] ?? ''
            ) ?>"
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
        ><?= htmlspecialchars(
            $tutor_actual['biografia'] ?? ''
        ) ?></textarea>

    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="tutores_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>