<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nuevo rol</title>
</head>

<body>

<h1>Registrar nuevo rol</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <label>
        Nombre del rol:

        <input
            type="text"
            name="nombre_rol"
            required
        >

    </label>

    <br><br>

    <button type="submit">
        Guardar
    </button>

    <a href="roles_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>