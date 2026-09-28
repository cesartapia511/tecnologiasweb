# HU-022 · Consultar la bitácora de accesos

**Rol:** Administrador · **Estado:** implementada · **Commits:** `ca02d33`

## Historia

- **Como** administrador
- **Quiero** consultar la bitácora de accesos
- **Para** auditar quién ingresó al sistema y con qué resultado

## Criterios de aceptación

- [x] Veo usuario, fecha y hora, IP y resultado (exitoso o fallido)
- [x] Solo el administrador tiene el permiso `listar_acceso`

## Endpoints involucrados

- `GET /api/accesos/index.php`

## Tablas SQL utilizadas

- `registro_accesos`
- `usuarios`

Volver al [índice de historias](README.md).
