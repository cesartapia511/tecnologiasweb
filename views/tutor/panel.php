<?php
require_once __DIR__ . '/../../includes/verificar_sesion.php';
require_once __DIR__ . '/../../config/conexion.php';
require_once __DIR__ . '/../../models/TutorModel.php';
require_once __DIR__ . '/../../models/TutoriaModel.php';
require_once __DIR__ . '/../../models/DisponibilidadModel.php';

$tituloPagina = 'Panel del Tutor - Sistema de Tutorías UPDS';

$tutorModel = new TutorModel($pdo);
$tutoriaModel = new TutoriaModel($pdo);
$dispModel = new DisponibilidadModel($pdo);

$tutor = $tutorModel->obtenerPorUsuario($_SESSION['id_usuario']);
$idTutor = $tutor['id_tutor'] ?? 0;

$horarios = $idTutor ? $dispModel->obtenerPorTutor($idTutor) : [];
$materiasAsignadas = $idTutor ? $tutorModel->obtenerMaterias($idTutor) : [];
$tutoriasAsignadas = $idTutor ? $tutoriaModel->obtenerTodas(['id_tutor' => $idTutor]) : [];

$pendientes = array_filter($tutoriasAsignadas, fn($t) => $t['estado'] === 'pendiente');
$confirmadas = array_filter($tutoriasAsignadas, fn($t) => $t['estado'] === 'confirmada');
$realizadas = array_filter($tutoriasAsignadas, fn($t) => $t['estado'] === 'realizada');

include __DIR__ . '/../layouts/header.php';
?>

<div class="row g-4">
  <div class="col-12">
    <div class="card card-custom p-4 text-white shadow-sm" style="background: linear-gradient(135deg, #00234a 0%, #003f7f 60%, #005aa3 100%) !important;">
      <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div>
          <span class="badge bg-warning text-dark px-3 py-1 rounded-pill mb-2 fw-bold text-uppercase" style="font-size: 0.7rem;">UPDS Tarija &bull; Docente Tutor</span>
          <h2 class="fw-bold mb-1">¡Bienvenido(a), Lic. <?= htmlspecialchars($_SESSION['nombre']) ?>! 👋</h2>
          <p class="mb-0 text-white-50">Especialidad: <?= htmlspecialchars($tutor['especialidad'] ?? 'Docente de Apoyo Académico') ?></p>
        </div>
        <div class="d-flex gap-2">
          <a href="/controllers/disponibilidad_listar.php" class="btn btn-light btn-sm fw-semibold px-3 py-2 rounded-3 shadow-sm">
            <i class="bi bi-calendar-plus me-1 text-primary"></i> Gestionar Horarios
          </a>
          <a href="/controllers/tutorias_listar.php" class="btn btn-warning text-dark btn-sm fw-semibold px-3 py-2 rounded-3 shadow-sm">
            <i class="bi bi-card-checklist me-1"></i> Ver Tutorías
          </a>
        </div>
      </div>
    </div>
  </div>

  <!-- Métricas dinámicas en tiempo real -->
  <div class="col-md-3">
    <div class="card card-custom p-4 text-center">
      <div class="text-primary fs-1 mb-2"><i class="bi bi-calendar-check"></i></div>
      <h3 class="fw-bold mb-0"><?= count($horarios) ?></h3>
      <p class="text-muted small mb-0">Franjas de Disponibilidad</p>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card card-custom p-4 text-center">
      <div class="text-success fs-1 mb-2"><i class="bi bi-journal-bookmark-fill"></i></div>
      <h3 class="fw-bold mb-0"><?= count($materiasAsignadas) ?></h3>
      <p class="text-muted small mb-0">Materias Asignadas</p>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card card-custom p-4 text-center">
      <div class="text-warning fs-1 mb-2"><i class="bi bi-clock-history"></i></div>
      <h3 class="fw-bold mb-0"><?= count($pendientes) ?></h3>
      <p class="text-muted small mb-0">Tutorías Pendientes</p>
    </div>
  </div>
  <div class="col-md-3">
    <div class="card card-custom p-4 text-center">
      <div class="text-info fs-1 mb-2"><i class="bi bi-patch-check-fill"></i></div>
      <h3 class="fw-bold mb-0"><?= count($realizadas) ?></h3>
      <p class="text-muted small mb-0">Sesiones Realizadas</p>
    </div>
  </div>

  <!-- Lista de tutorías próximas -->
  <div class="col-lg-8">
    <div class="card card-custom shadow-sm overflow-hidden">
      <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
        <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
          <i class="bi bi-calendar-event text-primary"></i>
          <span>Próximas Sesiones Asignadas</span>
        </h5>
        <a href="/controllers/tutorias_listar.php" class="btn btn-outline-primary btn-sm rounded-3">Ver Todas</a>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-muted text-uppercase" style="font-size: 0.72rem;">
            <tr>
              <th class="ps-4">Fecha</th>
              <th>Estudiante</th>
              <th>Materia</th>
              <th>Modalidad</th>
              <th>Estado</th>
              <th class="text-end pe-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach (array_slice($tutoriasAsignadas, 0, 5) as $tut): ?>
              <tr>
                <td class="ps-4">
                  <div class="fw-bold text-dark"><?= date('d/m/Y', strtotime($tut['fecha'])) ?></div>
                  <small class="text-muted"><?= substr($tut['hora_inicio'], 0, 5) ?></small>
                </td>
                <td>
                  <div class="fw-semibold text-dark"><?= htmlspecialchars($tut['estudiante_nombre'] . ' ' . $tut['estudiante_apellido']) ?></div>
                  <small class="text-muted"><?= htmlspecialchars($tut['registro_universitario'] ?? '') ?></small>
                </td>
                <td><span class="fw-semibold"><?= htmlspecialchars($tut['nombre_materia']) ?></span></td>
                <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($tut['modalidad']) ?></span></td>
                <td>
                  <span class="badge <?= $tut['estado'] === 'realizada' ? 'bg-success' : ($tut['estado'] === 'confirmada' ? 'bg-info text-dark' : 'bg-warning text-dark') ?> rounded-pill px-2 py-1">
                    <?= htmlspecialchars($tut['estado']) ?>
                  </span>
                </td>
                <td class="text-end pe-4">
                  <?php if ($tut['estado'] === 'pendiente'): ?>
                    <a href="/controllers/tutorias_estado.php?id=<?= $tut['id_tutoria'] ?>&estado=confirmada" class="btn btn-sm btn-info text-dark rounded-2" title="Confirmar">
                      <i class="bi bi-check-lg"></i>
                    </a>
                  <?php elseif ($tut['estado'] === 'confirmada'): ?>
                    <a href="/controllers/tutorias_estado.php?id=<?= $tut['id_tutoria'] ?>&estado=realizada" class="btn btn-sm btn-success rounded-2" title="Marcar Realizada">
                      <i class="bi bi-patch-check"></i>
                    </a>
                  <?php else: ?>
                    <span class="text-muted small"><i class="bi bi-check-all text-success"></i></span>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>
            <?php if (empty($tutoriasAsignadas)): ?>
              <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                  <i class="bi bi-calendar-x fs-2 d-block mb-1 text-secondary"></i>
                  No tienes sesiones asignadas por el momento.
                </td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- Materias asignadas al tutor -->
  <div class="col-lg-4">
    <div class="card card-custom shadow-sm p-4">
      <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
        <i class="bi bi-journal-check text-success"></i>
        <span>Materias a Cargo</span>
      </h5>
      <ul class="list-group list-group-flush">
        <?php foreach ($materiasAsignadas as $mat): ?>
          <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
            <div>
              <div class="fw-semibold text-dark"><?= htmlspecialchars($mat['nombre_materia']) ?></div>
              <small class="text-muted"><?= htmlspecialchars($mat['nombre_carrera'] ?? 'UPDS') ?></small>
            </div>
            <span class="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle">Asignada</span>
          </li>
        <?php endforeach; ?>
        <?php if (empty($materiasAsignadas)): ?>
          <li class="list-group-item px-0 text-muted small">Sin materias vinculadas actualmente.</li>
        <?php endif; ?>
      </ul>
    </div>
  </div>
</div>

<?php include __DIR__ . '/../layouts/footer.php'; ?>
