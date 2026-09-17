<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar rol</title>
</head>

<body>

<h1>Editar rol</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_rol"
        value="<?= htmlspecialchars($rol_actual['id_rol']) ?>"
    >

    <label>
        Nombre del rol:

        <input
            type="text"
            name="nombre_rol"
            value="<?= htmlspecialchars($rol_actual['nombre_rol']) ?>"
            required
        >

    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="roles_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>