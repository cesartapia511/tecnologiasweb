# Limitaciones y trabajo futuro

## Limitaciones actuales

- Los correos de recuperación de contraseña no se envían: el enlace se muestra en pantalla (`MAIL_MODE=sandbox`).
- Los roles son `administrador`, `tutor` y `estudiante`; no existen roles de coordinación ni auxiliares.
- La modalidad de graduación se elige al generar la carta de designación; no hay módulo propio para administrarlas.
- No hay tribunales, cambio formal de tutor ni registro de calificaciones finales de graduación.
- No hay importación masiva de estudiantes por CSV (HU-023); el reporte solo se **exporta** a CSV.
- Las evidencias de las reuniones se registran como URL; no se suben archivos ni fotos.
- El correo no se verifica al registrarse.

## Trabajo futuro

1. Envío real de correos para la recuperación de contraseña y las notificaciones.
2. Importación masiva de estudiantes por CSV (HU-023).
3. Roles de coordinación y auxiliares con sus permisos.
4. Módulo de tribunales y de cambio de tutor.
5. Subida de fotos como evidencia de reuniones.
6. Pruebas automatizadas de la API.
