# HU-025 · Registrar reuniones con evidencia y firmas

**Rol:** Tutor, estudiante · **Estado:** implementada · **Commits:** `60141ea`

## Historia

- **Como** tutor (registra y firma) y estudiante (firma)
- **Quiero** registrar reuniones periódicas con asistencia y evidencia, y firmarlas
- **Para** dejar constancia del seguimiento de la tutoría

## Criterios de aceptación

- [x] El tutor registra fecha, horario, lugar o enlace, asistencia, evidencia (URL) y observaciones
- [x] Se rechaza hora de fin anterior a la de inicio, tardanza sin minutos o evidencia con URL inválida
- [x] Tutor y estudiante firman por separado desde su cuenta (`firma_tutor`, `firma_estudiante`)
- [x] Solo veo las reuniones de mis tutorías

## Endpoints involucrados

- `GET, POST, PUT /api/reuniones/index.php` (PUT con `accion` firmar_tutor o firmar_estudiante)

## Tablas SQL utilizadas

- `reuniones`
- `tutorias`

Volver al [índice de historias](README.md).
