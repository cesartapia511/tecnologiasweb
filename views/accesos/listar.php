<?php require_once __DIR__ . '/../../includes/verificar_sesion.php'; ?>

<!DOCTYPE html>
<html lang="es">

<head>

<meta charset="UTF-8">

<title>Registro de accesos</title>

</head>


<body>


<h1>Registro de accesos</h1>


<table border="1" cellpadding="6" cellspacing="0">


<tr>

<th>ID</th>
<th>Usuario</th>
<th>Fecha y hora</th>
<th>IP origen</th>
<th>Resultado</th>

</tr>



<?php foreach($accesos as $a): ?>


<tr>


<td>

<?= htmlspecialchars(
$a['id_acceso']
) ?>

</td>



<td>

<?php if($a['usuario']): ?>

<?= htmlspecialchars(
$a['nombre'] . ' ' .
$a['apellido'] .
' (' .
$a['usuario'] .
')'
) ?>


<?php else: ?>

Usuario eliminado

<?php endif; ?>


</td>



<td>

<?= htmlspecialchars(
$a['fecha_hora']
) ?>

</td>



<td>

<?= htmlspecialchars(
$a['ip_origen']
) ?>

</td>



<td>

<?= htmlspecialchars(
$a['resultado']
) ?>

</td>



</tr>



<?php endforeach; ?>



<?php if(empty($accesos)): ?>


<tr>

<td colspan="5">

No existen registros de acceso.

</td>

</tr>


<?php endif; ?>


</table>


</body>

</html>