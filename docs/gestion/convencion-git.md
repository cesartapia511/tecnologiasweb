# Convención de trabajo en Git

## 1. Repositorio y ramas

| Rama | Uso |
|---|---|
| `main` | Rama principal del repositorio |
| `grupo-5-Rama` | Rama de integración del grupo; en ella se realizó el desarrollo y las fusiones entre integrantes |

Los integrantes trabajaron en local y sincronizaron con el repositorio remoto en GitHub; las fusiones entre `origin/main`, `origin/grupo-5-Rama` y las ramas locales quedaron registradas como commits de merge (ver [historial-commits.md](historial-commits.md)).

## 2. Mensajes de commit

- Se escriben en español, describiendo lo que se agregó o corrigió («Agregué el CRUD de carreras», «Implementé recuperación de contraseña»).
- Algunos commits usan prefijos `feat:` y `fix:` (por ejemplo `feat: agregar informes de avance`, `fix: completar flujo de cartas de designacion`).
- Se hicieron commits por módulo: un commit por cada CRUD, uno por cada endpoint reforzado y uno por cada funcionalidad nueva.

## 3. Manejo de credenciales

- Las variables de conexión a la base de datos se leen desde variables de entorno (`DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`) definidas en `docker-compose.yml`.
- El frontend usa `frontend/.env` únicamente para la URL base de la API (`VITE_API_URL=/api`).
- Los datos de prueba del script `init.sql` son ficticios.

## 4. Historial

El detalle de cada commit, el aporte por integrante y la relación entre commits y funcionalidades están en [historial-commits.md](historial-commits.md).
