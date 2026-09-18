<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$rolSesion = $_SESSION['rol'] ?? '';
$nombreSesion = $_SESSION['nombre'] ?? 'Usuario';
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= $tituloPagina ?? 'Sistema de Tutorías - UPDS Tarija' ?></title>
  <!-- Google Fonts: Inter -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Bootstrap 5.3 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <!-- SweetAlert2 -->
  <!-- Estilos Globales del Sistema UPDS -->
  <link rel="stylesheet" href="/assets/css/estilos.css">
</head>
<body>

<?php if (isset($_SESSION['id_usuario'])): ?>
<!-- Navbar principal del sistema UPDS -->
<nav class="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm sticky-top">
  <div class="container-fluid px-lg-4">
    <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="/controllers/usuarios_listar.php">
      <img src="/assets/logo-upds.png" alt="UPDS Logo" style="height: 38px; object-fit: contain;" onerror="this.style.display='none'">
      <div class="lh-1">
        <span class="fs-6 d-block text-white fw-bold">UPDS TARIJA</span>
        <small class="text-info" style="font-size: 0.68rem; letter-spacing: 0.5px;">SISTEMA DE TUTORÍAS</small>
      </div>
    </a>

    <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="navbarMain">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0 ps-lg-3">
        <?php if ($rolSesion === 'administrador'): ?>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'usuarios') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/usuarios_listar.php">
              <i class="bi bi-people-fill"></i> Usuarios
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'materias') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/materias_listar.php">
              <i class="bi bi-journal-bookmark-fill"></i> Materias
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'carreras') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/carreras_listar.php">
              <i class="bi bi-mortarboard"></i> Carreras
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'tutorias') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/tutorias_listar.php">
              <i class="bi bi-calendar-check-fill"></i> Tutorías
            </a>
          </li>
        <?php elseif ($rolSesion === 'tutor'): ?>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'panel') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/views/tutor/panel.php">
              <i class="bi bi-speedometer2"></i> Mi Panel
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'disponibilidad') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/disponibilidad_listar.php">
              <i class="bi bi-calendar-range"></i> Mis Horarios
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'tutorias') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/tutorias_listar.php">
              <i class="bi bi-card-checklist"></i> Sesiones Asignadas
            </a>
          </li>
        <?php elseif ($rolSesion === 'estudiante'): ?>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'panel') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/views/estudiante/panel.php">
              <i class="bi bi-speedometer2"></i> Mi Panel
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'tutorias_crear') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/tutorias_crear.php">
              <i class="bi bi-calendar-plus"></i> Agendar Tutoría
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link <?= strpos($_SERVER['PHP_SELF'], 'tutorias_listar') !== false ? 'active fw-bold text-white' : 'text-white-50' ?> d-flex align-items-center gap-1" href="/controllers/tutorias_listar.php">
              <i class="bi bi-clock-history"></i> Mis Tutorías
            </a>
          </li>
        <?php endif; ?>
      </ul>

      <!-- Perfil de usuario y botón salir -->
      <div class="d-flex align-items-center gap-3">
        <div class="text-end text-white d-none d-md-block">
          <div class="fw-semibold" style="font-size: 0.88rem;"><?= htmlspecialchars($nombreSesion) ?></div>
          <span class="badge rounded-pill text-uppercase px-2" style="font-size: 0.65rem; background: rgba(255,255,255,0.2);">
            <?= htmlspecialchars($rolSesion) ?>
          </span>
        </div>
        <a href="/controllers/logout.php" class="btn btn-outline-light btn-sm d-flex align-items-center gap-1 rounded-3">
          <i class="bi bi-box-arrow-right"></i>
          <span>Salir</span>
        </a>
      </div>
    </div>
  </div>
</nav>
<?php endif; ?>

<main class="container py-4 flex-grow-1">
