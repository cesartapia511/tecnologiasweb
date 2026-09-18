<?php
require_once __DIR__ . '/../../includes/verificar_sesion.php';
$tituloPagina = 'Disponibilidad Horaria - Tutorías UPDS';
include __DIR__ . '/../layouts/header.php';
$rolActual = $_SESSION['rol'] ?? '';
?>

<div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
  <div>
    <h2 class="fw-bold mb-1 d-flex align-items-center gap-2">
      <i class="bi bi-calendar-range text-primary"></i>
      <span>Disponibilidad Horaria Semanal</span>
      <span class="badge bg-primary bg-opacity-10 text-primary fs-6"><?= count($horarios) ?></span>
    </h2>
    <p class="text-muted mb-0">Horarios oficiales UPDS Tarija: Turnos de Lunes a Viernes y modalidad Semipresencial.</p>
  </div>
</div>

<div class="row g-4">
  <?php if ($rolActual === 'tutor' || $rolActual === 'administrador'): ?>
    <div class="col-lg-4">
      <div class="card card-custom shadow-sm p-4">
        <h5 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
          <i class="bi bi-plus-circle-fill text-primary"></i>
          <span>Registrar Franja Horaria</span>
        </h5>
        <form action="disponibilidad_listar.php" method="POST">
          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Plantilla Oficial UPDS</label>
            <select class="form-select form-select-sm rounded-3 bg-light" id="selectorPlantilla" onchange="aplicarPlantilla(this.value)">
              <option value="">-- Seleccionar Turno Oficial UPDS --</option>
              <optgroup label="Presencial (Lunes a Viernes)">
                <option value="07:30|10:30">Mañana 1 (07:30 a 10:30)</option>
                <option value="11:00|14:00">Mañana 2 (11:00 a 14:00)</option>
                <option value="15:00|18:00">Tarde (15:00 a 18:00)</option>
                <option value="19:00|22:00">Noche (19:00 a 22:00)</option>
              </optgroup>
              <optgroup label="Semipresencial (Sábados)">
                <option value="08:00|12:00">Sábado Mañana (08:00 a 12:00)</option>
                <option value="14:00|18:00">Sábado Tarde (14:00 a 18:00)</option>
              </optgroup>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label small fw-semibold text-secondary">Día de la Semana</label>
            <select name="dia_semana" id="inputDia" class="form-select rounded-3" required>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miercoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sabado">Sábado (Semipresencial)</option>
            </select>
          </div>

          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label small fw-semibold text-secondary">Hora Inicio</label>
              <input type="time" name="hora_inicio" id="inputInicio" class="form-control rounded-3" required>
            </div>
            <div class="col-6">
              <label class="form-label small fw-semibold text-secondary">Hora Fin</label>
              <input type="time" name="hora_fin" id="inputFin" class="form-control rounded-3" required>
            </div>
          </div>

          <button type="submit" class="btn btn-primary w-100 py-2 rounded-3 fw-semibold shadow-sm">
            <i class="bi bi-calendar-check me-1"></i> Guardar Franja
          </button>
        </form>
      </div>

      <!-- Cuadro informativo turnos UPDS -->
      <div class="card card-custom shadow-sm p-3 mt-3 bg-light border-0">
        <h6 class="fw-bold text-dark mb-2" style="font-size: 0.85rem;">
          <i class="bi bi-info-circle text-primary me-1"></i> Turnos Académicos UPDS
        </h6>
        <ul class="text-muted small mb-0 ps-3" style="font-size: 0.8rem; line-height: 1.5;">
          <li><strong>Presencial:</strong> Lun a Vie en 4 turnos (07:30-10:30, 11:00-14:00, 15:00-18:00, 19:00-22:00).</li>
          <li><strong>Semipresencial:</strong> Sábados presencial (08:00-12:00, 14:00-18:00) y Lun a Vie virtual.</li>
        </ul>
      </div>
    </div>
  <?php endif; ?>

  <div class="<?= ($rolActual === 'tutor' || $rolActual === 'administrador') ? 'col-lg-8' : 'col-12' ?>">
    <div class="card card-custom shadow-sm overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-muted text-uppercase" style="font-size: 0.75rem; letter-spacing: 0.5px;">
            <tr>
              <th class="ps-4">Día</th>
              <th>Horario de Atención</th>
              <th>Turno / Modalidad</th>
              <th>Docente Tutor</th>
              <th class="text-end pe-4">Acción</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($horarios as $h): ?>
              <?php
                $esSabado = ($h['dia_semana'] === 'Sabado');
              ?>
              <tr>
                <td class="ps-4">
                  <span class="badge <?= $esSabado ? 'bg-warning text-dark border-warning' : 'bg-primary bg-opacity-10 text-primary border-primary-subtle' ?> border px-3 py-1 fs-6">
                    <i class="bi bi-calendar-event me-1"></i><?= htmlspecialchars($h['dia_semana']) ?>
                  </span>
                </td>
                <td>
                  <div class="fw-bold text-dark fs-6">
                    <i class="bi bi-clock text-secondary me-1"></i>
                    <?= substr($h['hora_inicio'], 0, 5) ?> - <?= substr($h['hora_fin'], 0, 5) ?>
                  </div>
                </td>
                <td>
                  <span class="badge bg-light text-dark border">
                    <?= $esSabado ? 'Semipresencial (Sábados)' : 'Presencial / Virtual' ?>
                  </span>
                </td>
                <td>
                  <div class="fw-semibold text-dark"><?= htmlspecialchars($h['nombre'] . ' ' . $h['apellido']) ?></div>
                  <small class="text-muted"><?= htmlspecialchars($h['especialidad'] ?? 'Docente Tutor') ?></small>
                </td>
                <td class="text-end pe-4">
                  <?php if ($rolActual === 'tutor' || $rolActual === 'administrador'): ?>
                    <a href="disponibilidad_listar.php?eliminar=<?= $h['id_disponibilidad'] ?>" 
                       class="btn btn-outline-danger btn-sm rounded-2"
                       onclick="return confirm('¿Eliminar este horario de disponibilidad?');"
                       title="Eliminar Horario">
                      <i class="bi bi-trash-fill"></i>
                    </a>
                  <?php endif; ?>
                </td>
              </tr>
            <?php endforeach; ?>

            <?php if (empty($horarios)): ?>
              <tr>
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="bi bi-calendar-x fs-1 d-block mb-2 text-secondary"></i>
                  No hay horarios de disponibilidad registrados.
                </td>
              </tr>
            <?php endif; ?>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<script>
  function aplicarPlantilla(val) {
    if (!val) return;
    const partes = val.split('|');
    document.getElementById('inputInicio').value = partes[0];
    document.getElementById('inputFin').value = partes[1];
    if (partes[0] === '08:00' || (partes[0] === '14:00' && partes[1] === '18:00')) {
      document.getElementById('inputDia').value = 'Sabado';
    }
  }
</script>

<?php include __DIR__ . '/../layouts/footer.php'; ?>
