<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar disponibilidad</title>
</head>

<body>

<h1>Editar disponibilidad</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_disponibilidad"
        value="<?= htmlspecialchars(
            $disponibilidad_actual['id_disponibilidad']
        ) ?>"
    >

    <label>
        Tutor:

        <select name="id_tutor" required>

            <?php foreach ($tutores as $t): ?>

                <option
                    value="<?= $t['id_tutor'] ?>"
                    <?= $t['id_tutor'] ==
                        $disponibilidad_actual['id_tutor']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $t['nombre'] . ' ' .
                        $t['apellido']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Día:

        <select name="dia_semana" required>

            <?php
            $dias = [
                'Lunes',
                'Martes',
                'Miercoles',
                'Jueves',
                'Viernes',
                'Sabado'
            ];
            ?>

            <?php foreach ($dias as $dia): ?>

                <option
                    value="<?= $dia ?>"
                    <?= $dia === $disponibilidad_actual['dia_semana']
                        ? 'selected'
                        : '' ?>
                >
                    <?= htmlspecialchars($dia) ?>
                </option>

            <?php endforeach; ?>

        </select>

    </label>

    <br><br>

    <label>
        Hora inicio:

        <input
            type="time"
            name="hora_inicio"
            value="<?= htmlspecialchars(
                $disponibilidad_actual['hora_inicio']
            ) ?>"
            required
        >

    </label>

    <br><br>

    <label>
        Hora fin:

        <input
            type="time"
            name="hora_fin"
            value="<?= htmlspecialchars(
                $disponibilidad_actual['hora_fin']
            ) ?>"
            required
        >

    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="disponibilidad_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>