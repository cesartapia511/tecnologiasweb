# Historial de commits del repositorio

Registro extraído directamente del repositorio Git del proyecto (`tecnologiasweb`, ramas `main` y `grupo-5-Rama`). Los mensajes se transcriben tal como fueron escritos por cada integrante.

## 1. Resumen por integrante

| Integrante (autor en Git) | Commits | Áreas principales |
|---|:---:|---|
| Lucero | 33 | CRUD de roles, carreras, materias, estudiantes, tutores, tutor-materia, disponibilidad, tutorías y evaluaciones; validaciones y permisos de la API; dashboard y reportes; recuperación de contraseña; cartas de designación, reuniones, informes de avance, periodos de inscripción e inscripción a tutorías |
| cesartapia511 (un commit figura como «cesar») | 30 | Estructura MVC inicial, frontend React/Vite, portales de estudiante y tutor, perfiles, permisos por rol, login, notificaciones, foto de perfil, diseño responsivo y endurecimiento de seguridad (credenciales, CORS, tokens, registro público, periodos de inscripción) |
| JoseJonathanCardozoRomay | 4 | Conexión a base de datos, CRUD de usuarios, login y configuración del entorno Docker |
| Consuelo Rojas | 1 | Actualización de dependencias («Cargar Datos») |

Total: 68 commits propios y 4 commits de fusión (merge), 72 en el repositorio.

## 2. Commits en orden cronológico

| N.º | Hash | Fecha | Autor | Mensaje |
|:---:|---|---|---|---|
| 1 | `d755491` | 2026-09-09 | JoseJonathanCardozoRomay | Primer commit |
| 2 | `b35ed37` | 2026-09-10 | cesar | primer commit |
| 3 | `158877d` | 2026-09-11 | cesartapia511 | Sistema de Tutorias - Formulario MVC |
| 4 | `28c383d` | 2026-09-14 | JoseJonathanCardozoRomay | SE MODIFICO EL ARCHIVO DE CONEXION A LA BASE DE DATOS, COMO TAMBIEN SE AGEGO EL CRUD DE USUARIOS |
| 5 | `1a7feb1` | 2026-09-14 | JoseJonathanCardozoRomay | SE IMPLEMENTO EL LOGIN |
| 6 | `8df2262` | 2026-09-16 | JoseJonathanCardozoRomay | Se implementó la configuración inicial del entorno de desarrollo con Docker Compose, incluyendo: - Servicio de base de datos MySQL con script de inicialización (init.s... |
| 7 | `72fde3f` | 2026-09-17 | Lucero | Agregué el CRUD de carreras |
| 8 | `983e53f` | 2026-09-17 | Lucero | Agregué el CRUD de materias |
| 9 | `a6e7266` | 2026-09-17 | Lucero | Agregué el CRUD de estudiantes |
| 10 | `d93ee04` | 2026-09-17 | Lucero | Agregué el CRUD de tutores |
| 11 | `cc27c0c` | 2026-09-17 | Lucero | Agregué el CRUD de tutor materia |
| 12 | `787a8f4` | 2026-09-17 | Lucero | Agregué el CRUD de disponibilidad de tutores |
| 13 | `1f09e7d` | 2026-09-17 | Lucero | Agregué el CRUD de tutorias |
| 14 | `10cff88` | 2026-09-17 | Lucero | Agregué el CRUD de evaluaciones |
| 15 | `b2902a6` | 2026-09-17 | Lucero | Agregué el CRUD de Roles |
| 16 | `ca02d33` | 2026-09-17 | Lucero | Finalice los CRUD y agregue registro de accesos |
| 17 | `84ab077` | 2026-09-18 | cesartapia511 | Se agrega carpeta frontend y actualizaciones del proyecto |
| 18 | `bbe5f40` | 2026-09-18 | cesartapia511 | cargado del frontend actualizado y funcional con los cruds |
| 19 | `1b762b8` | 2026-09-18 | cesartapia511 | cargado del frontend actualizado y funcional con los cruds |
| 20 | `7968487` | 2026-09-18 | Lucero | Corrijo nombre de controlador tutor materia editar |
| 21 | `f92c18e` | 2026-09-20 | cesartapia511 | Se agrego la validacion y verificacion de permisos por rol |
| 22 | `fb06bc3` | 2026-09-21 | Lucero | Mejora de permisos dy validaciones API |
| 23 | `491084b` | 2026-09-21 | Lucero | Protección del acceso a estadisticas por rol |
| 24 | `ef22a50` | 2026-09-21 | Lucero | Refuerzo validaciones y seguridad del registro |
| 25 | `d2aa8a3` | 2026-09-21 | Lucero | Mejoré las validaciones y creacion de usuarios |
| 26 | `3aa119b` | 2026-09-21 | Lucero | Refuerzo validaciones y permisos de tutorias |
| 27 | `7a3b4fe` | 2026-09-21 | Lucero | Refuerzo de validaciones y permisos de evaluaciones |
| 28 | `2ccd5e4` | 2026-09-21 | Lucero | Refuerzo validaciones y permisos de disponibilidad |
| 29 | `3d4f651` | 2026-09-21 | Lucero | Refuerzo validaciones y permisos de tutores |
| 30 | `77286b6` | 2026-09-21 | Lucero | Refuerzo validaciones y permisos de estudiantes |
| 31 | `f936123` | 2026-09-21 | Lucero | Refuerzo validaciones y permisos de materias |
| 32 | `fbd89ea` | 2026-09-21 | cesartapia511 | mejora de perfiles y funcionalidad del sistema |
| 33 | `fe85ce8` | 2026-09-21 | cesartapia511 | mejora del area de tutor se agrego nuevas funciones |
| 34 | `a3ad485` | 2026-09-22 | Lucero | Se implemento la mejora al dashboard y filtros de gestion |
| 35 | `8957f8e` | 2026-09-22 | Lucero | correcion de la estructura JSX de tutores |
| 36 | `8560fa2` | 2026-09-22 | Lucero | completé perfiles, recuperacion de contraseña, funcionalidades y correciones dentro de Mi perfil en estudiantes y tutores |
| 37 | `f48db2d` | 2026-09-22 | Lucero | Agregue Reportes para el perfil de admin |
| 38 | `fba9271` | 2026-09-22 | Lucero | Correccion del modulo de reportes |
| 39 | `c86aaa0` | 2026-09-22 | Consuelo Rojas | Cargar Datos |
| 40 | `0a301a4` | 2026-09-23 | Lucero | Implementé recuperación de contraseña |
| 41 | `62f6893` | 2026-09-24 | cesartapia511 | mejora en perfil, validacion,turnos,notoficacion,carta designacion,y mejora con estilo mi reportes |
| 42 | `0fd2a9c` | 2026-09-24 | Lucero | ... |
| 43 | `d80a1cd` | 2026-09-25 | Lucero | fix: completar flujo de cartas de designacion |
| 44 | `60141ea` | 2026-09-25 | Lucero | feat: agregar registro de reuniones y firmas |
| 45 | `3d683d0` | 2026-09-25 | Lucero | feat: agregar informes de avance |
| 46 | `aefb9fb` | 2026-09-25 | Lucero | Se implementó periodos de inscripcion |
| 47 | `00c2f5c` | 2026-09-25 | cesartapia511 | feat: actualizar diseño de LoginPage y agregar recursos visuales de UPDS |
| 48 | `70d352d` | 2026-09-26 | Lucero | Se implementó la inscripcion a tutorias y mejorar gestion de sesiones |
| 49 | `5ac3825` | 2026-09-26 | cesartapia511 | correcion de hora con la zona horaria de bolivia |
| 50 | `8c21523` | 2026-09-26 | cesartapia511 | mejoras en el diseno responsivo visualmente |
| 51 | `e4031da` | 2026-09-26 | cesartapia511 | mejoras en la campana de notificaciones crud creados y con bandeja de notificaciones |
| 52 | `eebbdc9` | 2026-09-26 | cesartapia511 | feat: agrego modulo de notificaciones y ajustes |
| 53 | `17f6ec1` | 2026-09-26 | cesartapia511 | ajustes en las foto de perfil arreglo y cargado, y agregado en la base de datos como texto para evitar el peso de la bd |
| 54 | `9501948` | 2026-09-26 | cesartapia511 | actualizacion mejora parte responsiva V2 |
| 55 | `da1efd1` | 2026-09-26 | cesartapia511 | actualizacion mejoras login con redes sociales |
| 56 | `9f62152` | 2026-09-27 | cesartapia511 | fix: agregar autenticacion y control de roles en periodos de inscripcion |
| 57 | `68b9aa5` | 2026-09-27 | cesartapia511 | fix: sincronizar migraciones e inicializacion de base de datos |
| 58 | `56b524c` | 2026-09-27 | cesartapia511 | fix: corregir sincronizacion de respuestas y perfil en frontend |
| 59 | `833b15c` | 2026-09-27 | cesartapia511 | fix: asegurar ciclo de vida de fotografias de perfil |
| 60 | `192a67c` | 2026-09-27 | cesartapia511 | fix: reforzar seguridad de autenticacion y sesiones |
| 61 | `afa5792` | 2026-09-27 | cesartapia511 | fix: restringir registro publico a estudiantes |
| 62 | `61d6bd6` | 2026-09-27 | cesartapia511 | fix: eliminar endpoint de diagnostico expuesto |
| 63 | `e3a6b67` | 2026-09-27 | cesartapia511 | fix: eliminar credenciales de prueba del login |
| 64 | `7ce4c56` | 2026-09-27 | cesartapia511 | fix: proteger credenciales y configurar entorno de base de datos |
| 65 | `4a4d326` | 2026-09-28 | cesartapia511 | fix: reforzar envio seguro de tokens de autenticacion |
| 66 | `3a7e85c` | 2026-09-28 | cesartapia511 | fix: restringir CORS a origenes autorizados |
| 67 | `ab94883` | 2026-09-28 | cesartapia511 | refactor: eliminar codigo PHP obsoleto y sanear entrada del backend |
| 68 | `f335df8` | 2026-09-28 | cesartapia511 | feat: implementar recuperacion de contrasena en modo sandbox |

## 3. Commits de fusión (merge)

| Hash | Fecha | Autor | Mensaje |
|---|---|---|---|
| `d55e38a` | 2026-09-18 | Lucero | Merge branch 'main' of https://github.com/cesartapia511/tecnologiasweb into grupo-5-Rama |
| `32bb03f` | 2026-09-18 | Lucero | Merge branch 'grupo-5-Rama' of https://github.com/cesartapia511/tecnologiasweb into grupo-5-Rama |
| `8c275c9` | 2026-09-24 | Lucero | Merge branch 'grupo-5-Rama' of https://github.com/cesartapia511/tecnologiasweb into grupo-5-Rama |
| `e3016a3` | 2026-09-26 | Lucero | Merge remote-tracking branch 'origin/grupo-5-Rama' into grupo-5-Rama |

## 4. Commits por funcionalidad

Relación entre las funcionalidades documentadas y los commits que las implementan.

| Funcionalidad | Commits |
|---|---|
| Estructura MVC inicial en PHP | `158877d`, `28c383d` |
| Login, sesión y bitácora de accesos | `1a7feb1`, `ca02d33`, `1b762b8` |
| Entorno Docker (MySQL, phpMyAdmin, PHP/Apache) | `8df2262` |
| CRUD de usuarios, roles, carreras, materias, estudiantes, tutores, tutor-materia, disponibilidad, tutorías y evaluaciones (versión PHP/MVC) | `28c383d`, `72fde3f`, `983e53f`, `a6e7266`, `d93ee04`, `cc27c0c`, `787a8f4`, `1f09e7d`, `10cff88`, `b2902a6`, `7968487` |
| Frontend React/Vite y API REST conectada a los CRUD | `84ab077`, `1b762b8` |
| Permisos por rol (RBAC) y validaciones de la API | `f92c18e`, `fb06bc3`, `491084b`, `ef22a50`, `d2aa8a3`, `3aa119b`, `7a3b4fe`, `2ccd5e4`, `3d4f651`, `77286b6`, `f936123` |
| Portales de estudiante y tutor (mis materias, calendario, evaluaciones, estudiantes) | `fbd89ea`, `fe85ce8` |
| Dashboard y filtros de gestión | `a3ad485`, `8957f8e` |
| Perfiles de estudiante y tutor, foto de perfil | `8560fa2`, `17f6ec1` |
| Recuperación de contraseña | `8560fa2` (solicitud), `0a301a4` (verificación y restablecimiento) |
| Reportes para el administrador | `f48db2d`, `fba9271`, `62f6893` |
| Carta de designación | `62f6893`, `d80a1cd` |
| Registro de reuniones y firmas | `60141ea` |
| Informes de avance | `3d683d0` |
| Periodos de inscripción y cupos | `aefb9fb` |
| Inscripción a tutorías y gestión de sesiones | `70d352d` |
| Notificaciones (campana y bandeja) | `eebbdc9`, `e4031da` |
| Diseño del login y recursos visuales UPDS | `00c2f5c`, `da1efd1` |
| Diseño responsivo y ajuste de zona horaria de Bolivia | `8c21523`, `9501948`, `5ac3825` |
| Seguridad: credenciales, CORS, tokens de sesión, registro público solo estudiantes, endpoint de diagnóstico eliminado, permisos en periodos de inscripción, ciclo de vida de fotos | `9f62152`, `833b15c`, `192a67c`, `afa5792`, `61d6bd6`, `e3a6b67`, `7ce4c56`, `4a4d326`, `3a7e85c`, `ab94883` |
| Sincronización de migraciones y base de datos con Docker | `68b9aa5` |
| Sincronización de respuestas y perfil en el frontend | `56b524c` |
| Recuperación de contraseña en modo sandbox (token en pantalla) | `f335df8` |
