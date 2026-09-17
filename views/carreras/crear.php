<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nueva carrera</title>
</head>

<body>

    <h1>Registrar nueva carrera</h1>

    <?php foreach ($errores as $e): ?>

        <p style="color:red;">
            <?= htmlspecialchars($e) ?>
        </p>

    <?php endforeach; ?>

    <form method="POST">

        <label>
            Nombre de carrera:

            <input
                type="text"
                name="nombre_carrera"
                required
            >

        </label>

        <br><br>

        <button type="submit">
            Guardar
        </button>

        <a href="carreras_listar.php">
            Cancelar
        </a>

    </form>

</body>

</html>