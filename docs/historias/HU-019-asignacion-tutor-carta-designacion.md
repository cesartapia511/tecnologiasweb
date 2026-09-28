# HU-019 · Asignación formal de tutor con carta de designación

**Rol:** Administrador, tutor · **Estado:** implementada · **Commits:** `62f6893`, `d80a1cd`

## Historia

- **Como** administrador (genera la carta) y tutor (responde)
- **Quiero** generar una carta de designación de tutor y que el tutor la acepte o rechace con motivo
- **Para** formalizar la asignación del tutor a un estudiante

## Criterios de aceptación

- [x] El administrador elige estudiante, tutor y modalidad de graduación; se crea la tutoría `pendiente` y la carta `pendiente`
- [x] El tutor puede ver e imprimir la carta
- [x] Al aceptar: la carta pasa a `aceptada`, se guarda `fecha_firma` y la tutoría pasa a `asignada`
- [x] Al rechazar (con motivo): la carta pasa a `rechazada` y la tutoría a `en_reasignacion`
- [x] Una carta ya respondida no puede responderse otra vez
- [x] Cada carta queda guardada con su estado

## Endpoints involucrados

- `GET, POST, PUT /api/cartas_designacion/index.php` (PUT con `accion` aceptar o rechazar)

## Tablas SQL utilizadas

- `cartas_designacion`
- `tutorias`
- `modalidades_graduacion`
- `tutores`
- `estudiantes`
- `notificaciones`

Volver al [índice de historias](README.md).
