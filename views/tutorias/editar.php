<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Editar tutoría</title>
</head>

<body>

<h1>Editar tutoría</h1>

<?php foreach ($errores as $e): ?>

    <p style="color:red;">
        <?= htmlspecialchars($e) ?>
    </p>

<?php endforeach; ?>

<form method="POST">

    <input
        type="hidden"
        name="id_tutoria"
        value="<?= htmlspecialchars($tutoria_actual['id_tutoria']) ?>"
    >

    <label>
        Estudiante:

        <select name="id_estudiante" required>

            <?php foreach ($estudiantes as $e): ?>

                <option
                    value="<?= $e['id_estudiante'] ?>"
                    <?= $e['id_estudiante'] == $tutoria_actual['id_estudiante']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $e['nombre'] . ' ' . $e['apellido']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>
    </label>

    <br><br>

    <label>
        Tutor:

        <select name="id_tutor" required>

            <?php foreach ($tutores as $t): ?>

                <option
                    value="<?= $t['id_tutor'] ?>"
                    <?= $t['id_tutor'] == $tutoria_actual['id_tutor']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars(
                        $t['nombre'] . ' ' . $t['apellido']
                    ) ?>

                </option>

            <?php endforeach; ?>

        </select>
    </label>

    <br><br>

    <label>
        Materia:

        <select name="id_materia" required>

            <?php foreach ($materias as $m): ?>

                <option
                    value="<?= $m['id_materia'] ?>"
                    <?= $m['id_materia'] == $tutoria_actual['id_materia']
                        ? 'selected'
                        : '' ?>
                >

                    <?= htmlspecialchars($m['nombre_materia']) ?>

                </option>

            <?php endforeach; ?>

        </select>
    </label>

    <br><br>

    <label>
        Fecha:

        <input
            type="date"
            name="fecha"
            value="<?= htmlspecialchars($tutoria_actual['fecha']) ?>"
            required
        >
    </label>

    <br><br>

    <label>
        Hora inicio:

        <input
            type="time"
            name="hora_inicio"
            value="<?= htmlspecialchars($tutoria_actual['hora_inicio']) ?>"
            required
        >
    </label>

    <br><br>

    <label>
        Hora fin:

        <input
            type="time"
            name="hora_fin"
            value="<?= htmlspecialchars($tutoria_actual['hora_fin']) ?>"
            required
        >
    </label>

    <br><br>

    <label>
        Modalidad:

        <select name="modalidad" required>

            <option
                value="presencial"
                <?= $tutoria_actual['modalidad'] === 'presencial'
                    ? 'selected'
                    : '' ?>
            >
                Presencial
            </option>

            <option
                value="virtual"
                <?= $tutoria_actual['modalidad'] === 'virtual'
                    ? 'selected'
                    : '' ?>
            >
                Virtual
            </option>

        </select>
    </label>

    <br><br>

    <label>
        Lugar o enlace:

        <input
            type="text"
            name="lugar_o_enlace"
            value="<?= htmlspecialchars(
                $tutoria_actual['lugar_o_enlace'] ?? ''
            ) ?>"
        >
    </label>

    <br><br>

    <label>
        Estado:

        <select name="estado" required>

            <?php
            $estados = [
                'pendiente',
                'confirmada',
                'realizada',
                'cancelada'
            ];
            ?>

            <?php foreach ($estados as $estado): ?>

                <option
                    value="<?= $estado ?>"
                    <?= $estado === $tutoria_actual['estado']
                        ? 'selected'
                        : '' ?>
                >

                    <?= ucfirst($estado) ?>

                </option>

            <?php endforeach; ?>

        </select>
    </label>

    <br><br>

    <label>
        Observaciones:
        <br>

        <textarea
            name="observaciones"
            rows="4"
            cols="50"
        ><?= htmlspecialchars(
            $tutoria_actual['observaciones'] ?? ''
        ) ?></textarea>
    </label>

    <br><br>

    <button type="submit">
        Actualizar
    </button>

    <a href="tutorias_listar.php">
        Cancelar
    </a>

</form>

</body>
</html>