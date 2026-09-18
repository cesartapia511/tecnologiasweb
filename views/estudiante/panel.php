<?php
require_once __DIR__ . '/../../includes/verificar_sesion.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/EstudianteModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';

$tituloPagina = 'Panel del Estudiante - Tutorías UPDS';

$estudianteModel = new EstudianteModel($pdo);
$tutoriaModel = new TutoriaModel($pdo);

$estudiante = $estudianteModel->obtenerPorUsuario($_SESSION['id_usuario']);
$idEstudiante = $estudiante['id_estudiante'] ?? 0;

$misTutorias = $idEstudiante ? $tutoriaModel->obtenerTodas(['id_estudiante' => $idEstudiante]) : [];

$pendientes = array_filter($misTutorias, fn($t) => $t['estado'] === 'pendiente');
$confirmadas = array_filter($misTutorias, fn($t) => $t['estado'] === 'confirmada');
$realizadas = array_filter($misTutorias, fn($t) => $t['estado'] === 'realizada');

include __DIR__ . '/../layouts/header.php';
?>

<div class="row g-4">
  <div class="col-12">
    <div class="card card-custom p-4 text-white shadow-sm" style="background: linear-gradient(135deg, #00234a 0%, #003f7f 60%, #005aa3 100%) !important;">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span class="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase" style="font-size: 0.7rem;">UPDS Tarija &bull; Estudiante</span>
          <h2 class="fw-bold mb-1">¡Hola, <?= htmlspecialchars($_SESSION['nombre']) ?>! 👋</h2>
          <p class="mb-0 text-white-50">
            Carrera: <strong><?= htmlspecialchars($estudiante['nombre_carrera'] ?? 'Carrera Universitaria') ?></strong> &bull;
            R.U.: <strong><?= htmlspecialchars($estudiante['registro_universitario'] ?? 'S/R') ?></strong> &bull;
            Semestre: <strong><?= htmlspecialchars($estudiante['semestre'] ?? '1') ?>° Semestre</strong>
          </p>
        </div>
        <div>
          <a href="/controllers/tutorias_crear.php" class="btn btn-warning text-dark btn-sm fw-bold px-3 py-2 rounded-3 shadow-sm">
            <i class="bi bi-calendar-plus me-1"></i> Agendar Nueva Tutoría
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Métricas dinámicas del estudiante -->
  <div class="col-md-4">
    <div class="card card-custom p-4 text-center">
      <div class="text-warning fs-1 mb-2"><i class="bi bi-hourglass-split"></i></div>
      <h3 class="fw-bold mb-0"><?= count($pendientes) ?></h3>
      <p class="text-muted small mb-0">Solicitudes Pendientes</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card card-custom p-4 text-center">
      <div class="text-info fs-1 mb-2"><i class="bi bi-calendar-check"></i></div>
      <h3 class="fw-bold mb-0"><?= count($confirmadas) ?></h3>
      <p class="text-muted small mb-0">Tutorías Confirmadas</p>
    </div>
  </div>
  <div class="col-md-4">
    <div class="card card-custom p-4 text-center">
      <div class="text-success fs-1 mb-2"><i class="bi bi-patch-check-fill"></i></div>
      <h3 class="fw-bold mb-0"><?= count($realizadas) ?></h3>
      <p class="text-muted small mb-0">Sesiones Concluidas</p>
    </div>
  </div>

  <!-- Historial de sesiones del estudiante -->
  <div class="col-12">
    <div class="card card-custom shadow-sm overflow-hidden">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-clock-history text-primary"></i>
          <span>Mis Tutorías Registradas</span>
        </h5>
        <a href="/controllers/tutorias_listar.php" class="btn btn-outline-primary btn-sm rounded-3">Ver Todas</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-muted text-uppercase" style="font-size: 0.72rem;">
            <tr>
              <th class="ps-4">Fecha y Horario</th>
              <th>Materia</th>
              <th>Docente Tutor</th>
              <th>Modalidad</th>
              <th>Lugar / Enlace</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach (array_slice($misTutorias, 0, 6) as $tut): ?>
              <?php
                $badgeClase = 'bg-secondary';
                if ($tut['estado'] === 'pendiente') $badgeClase = 'bg-warning text-dark';
                if ($tut['estado'] === 'confirmada') $badgeClase = 'bg-info text-dark';
                if ($tut['estado'] === 'realizada') $badgeClase = 'bg-success';
                if ($tut['estado'] === 'cancelada') $badgeClase = 'bg-danger';
              ?>
              <tr>
                <td class="ps-4">
                  <div class="fw-bold text-dark"><?= date('d/m/Y', strtotime($tut['fecha'])) ?></div>
                  <small class="text-muted"><?= substr($tut['hora_inicio'], 0, 5) ?> - <?= substr($tut['hora_fin'], 0, 5) ?></small>
                </td>
                <td><span class="fw-bold text-dark"><?= htmlspecialchars($tut['nombre_materia']) ?></span></td>
                <td>
                  <div class="fw-semibold text-dark"><?= htmlspecialchars($tut['tutor_nombre'] . ' ' . $tut['tutor_apellido']) ?></div>
                  <small class="text-muted"><?= htmlspecialchars($tut['tutor_especialidad'] ?? 'Docente') ?></small>
                </td>
                <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($tut['modalidad']) ?></span></td>
                <td><small class="text-muted"><?= htmlspecialchars($tut['lugar_o_enlace'] ?: 'Campus UPDS') ?></small></td>
                <td>
                  <span class="badge <?= $badgeClase ?> rounded-pill px-2 py-1 text-capitalize">
                    <?= htmlspecialchars($tut['estado']) ?>
                  </span>
                </td>
              </tr>
            <?php endforeach; ?>
            <?php if (empty($misTutorias)): ?>
              <tr>
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
                  No tienes tutorías solicitadas actualmente.<br>
                  <a href="/controllers/tutorias_crear.php" class="btn btn-primary btn-sm mt-3">Agendar mi primera tutoría</a>
                </td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<?php include __DIR__ . '/../layouts/footer.php'; ?>
