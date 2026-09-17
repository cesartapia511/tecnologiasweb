<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<title>Nueva evaluación</title>

</head>


<body>


<h1>Registrar evaluación</h1>



<?php foreach($errores as $e): ?>

<p style="color:red;">

<?= htmlspecialchars($e) ?>

</p>

<?php endforeach; ?>



<?php if(empty($tutorias)): ?>


<p>
No existen tutorías realizadas disponibles para evaluar.
</p>


<p>
Primero debe existir una tutoría con estado:
<strong>realizada</strong>
</p>


<a href="../../controllers/tutorias_listar.php">
Volver
</a>



<?php else: ?>


<form method="POST">


<label>

Tutoría:

<select name="id_tutoria" required>


<option value="">
Seleccione una tutoría
</option>



<?php foreach($tutorias as $t): ?>


<option value="<?= $t['id_tutoria'] ?>">


<?= htmlspecialchars(

$t['nombre'] . ' ' .
$t['apellido'] .
' - ' .
$t['nombre_materia'] .
' (' .
$t['fecha'] .
')'

) ?>


</option>



<?php endforeach; ?>


</select>


</label>


<br><br>



<label>

Calificación:

<select name="calificacion" required>


<option value="1">
1
</option>


<option value="2">
2
</option>


<option value="3">
3
</option>


<option value="4">
4
</option>


<option value="5">
5
</option>


</select>


</label>



<br><br>


<label>

Comentario:

<br>


<textarea

name="comentario"

rows="5"

cols="50"

></textarea>


</label>



<br><br>



<button type="submit">

Guardar

</button>


<a href="evaluaciones_listar.php">

Cancelar

</a>



</form>


<?php endif; ?>



</body>

</html>