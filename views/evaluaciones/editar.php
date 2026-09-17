<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>


<!DOCTYPE html>
<html lang="es">


<head>

<meta charset="UTF-8">

<title>Editar evaluación</title>


</head>


<body>


<h1>Editar evaluación</h1>



<?php foreach($errores as $e): ?>


<p style="color:red;">

<?= htmlspecialchars($e) ?>

</p>


<?php endforeach; ?>



<form method="POST">



<input

type="hidden"

name="id_evaluacion"

value="<?= htmlspecialchars(
$evaluacion_actual['id_evaluacion']
) ?>"

/>



<p>

<strong>Tutoría:</strong>

<?= htmlspecialchars(
$evaluacion_actual['id_tutoria']
) ?>


</p>



<label>


Calificación:


<select name="calificacion" required>



<?php for($i=1;$i<=5;$i++): ?>


<option

value="<?= $i ?>"

<?= $evaluacion_actual['calificacion']==$i
? 'selected'
: '' ?>

>

<?= $i ?>


</option>


<?php endfor; ?>


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

><?= htmlspecialchars(
$evaluacion_actual['comentario']
) ?></textarea>


</label>



<br><br>



<button type="submit">

Actualizar

</button>


<a href="evaluaciones_listar.php">

Cancelar

</a>



</form>



</body>


</html>