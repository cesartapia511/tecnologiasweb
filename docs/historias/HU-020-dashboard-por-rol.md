# HU-020 · Ver el dashboard con indicadores de mi rol

**Rol:** Todos · **Estado:** implementada · **Commits:** `a3ad485`, `fe85ce8`

## Historia

- **Como** usuario
- **Quiero** ver un dashboard con indicadores de mi rol
- **Para** tener una vista rápida de mi actividad

## Criterios de aceptación

- [x] Cada rol ve indicadores propios
- [x] El administrador ve estadísticas generales y avanzadas
- [x] Los datos provienen de las tutorías, evaluaciones y usuarios

## Endpoints involucrados

- `GET /api/dashboard/stats.php`
- `GET /api/dashboard/advanced_stats.php`

## Tablas SQL utilizadas

- `tutorias`
- `evaluaciones_tutoria`
- `usuarios`
- `estudiantes`
- `tutores`

Volver al [índice de historias](README.md).
