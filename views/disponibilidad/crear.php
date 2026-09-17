<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Nueva disponibilidad</title>
</head>

<body>

<h1>Registrar disponibilidad</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <label>
        Tutor:

        <select name="id_tutor" required>

            <option value="">
                Seleccione un tutor
            </option>

            <?php foreach ($tutores as $t): ?>

                <option value="<?= $t['id_tutor'] ?>">

                    <?= htmlspecialchars(
                        $t['nombre'] . ' ' . $t['apellido']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Día:

        <select name="dia_semana" required>

            <option value="">Seleccione un día</option>
            <option value="Lunes">Lunes</option>
            <option value="Martes">Martes</option>
            <option value="Miercoles">Miércoles</option>
            <option value="Jueves">Jueves</option>
            <option value="Viernes">Viernes</option>
            <option value="Sabado">Sábado</option>

        </select>

    </label>

    <br><br>

    <label>
        Hora inicio:

        <input
            type="time"
            name="hora_inicio"
            required
        >

    </label>

    <br><br>

    <label>
        Hora fin:

        <input
            type="time"
            name="hora_fin"
            required
        >

    </label>

    <br><br>

    <button type="submit">
        Guardar
    </button>

    <a href="disponibilidad_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>