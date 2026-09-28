# HU-024 · Editar mi perfil y subir mi foto

**Rol:** Estudiante, tutor · **Estado:** implementada · **Commits:** `8560fa2`, `17f6ec1`, `fbd89ea`

## Historia

- **Como** estudiante o tutor
- **Quiero** editar mis datos de contacto y subir mi foto
- **Para** mantener mi perfil actualizado

## Criterios de aceptación

- [x] Actualizo mis datos de contacto
- [x] Subo una foto JPG, PNG o WebP de hasta 2 MB
- [x] La nueva foto reemplaza la anterior
- [x] La foto se guarda en `uploads/perfiles/`

## Endpoints involucrados

- `GET, PUT /api/estudiantes/perfil.php`
- `PUT /api/tutores/index.php`
- `POST /api/usuarios/foto.php`

## Tablas SQL utilizadas

- `usuarios`
- `estudiantes`
- `tutores`

Volver al [índice de historias](README.md).
