# Sistema Web de Apoyo Académico para Tutorías — UPDS Sede Tarija

Materia: Tecnologías Web I · Grupo 5 · Repositorio: `tecnologiasweb`
## Integrantes

- **Julio Cesar Espinoza Tapia**
- **Lucero Marquez Velasquez**
- **Consuelo Angelica Rojas Rodas**

##
Sistema web para gestionar tutorías académicas con tres roles: **administrador**, **tutor** y **estudiante**.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, React Router, Axios, Recharts |
| Backend | PHP 8.2 + Apache, API REST en `api/` (PDO, consultas preparadas) |
| Base de datos | MySQL 8.0 y phpMyAdmin |
| Entorno | Docker Compose |
| Autenticación | Token firmado (HMAC-SHA256) en `Authorization: Bearer` |

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker Compose)
- [Node.js](https://nodejs.org/) 20 o superior (para el frontend)
- Git

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <URL-DEL-REPOSITORIO>
cd tecnologiasweb
```

### 2. Configurar las variables de entorno

Copia el archivo de ejemplo y completa los valores (no subas el `.env` real a Git):

```bash
cp .env.example .env        # en Windows (PowerShell): copy .env.example .env
```

| Variable | Descripción |
|---|---|
| `DB_HOST` | Servidor MySQL (`db` dentro de Docker) |
| `DB_NAME` | Nombre de la base (`tutorias_db`) |
| `DB_USER` / `DB_PASS` | Usuario y contraseña de la aplicación |
| `DB_ROOT_PASS` | Contraseña de root de MySQL |
| `AUTH_SECRET_KEY` | Clave aleatoria para firmar los tokens (por ejemplo, salida de `openssl rand -hex 32`) |
| `AUTH_TOKEN_TTL` | Duración del token de sesión en segundos (86400 = 24 h) |
| `CORS_ALLOWED_ORIGINS` | Origen del frontend permitido: `http://localhost:5173` |
| `MAIL_MODE` | `sandbox`: el enlace de recuperación de contraseña se muestra en pantalla |

### 3. Levantar backend y base de datos

```bash
docker compose up -d --build
```

Al crear el volumen por primera vez, MySQL ejecuta automáticamente `database/init.sql` y las migraciones de `database/` (ver `docker-compose.yml`).

| Servicio | URL |
|---|---|
| API (PHP/Apache) | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 (usuario `root`, contraseña `DB_ROOT_PASS`) |
| MySQL | `localhost:3306` |

### 4. Levantar el frontend

```bash
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. Vite redirige `/api` y `/uploads` al puerto 8000.

### 5. Ingresar al sistema

`database/init.sql` crea tres usuarios de demostración (contraseña `password`):

| Rol | Usuario |
|---|---|
| Administrador | `admin` |
| Tutor | `tutor1` |
| Estudiante | `estudiante1` |

Cambia estas contraseñas antes de usar el sistema fuera de una demostración.

## Reiniciar la base de datos desde cero

```bash
docker compose down -v
docker compose up -d --build
```

`-v` borra el volumen `mysql_data`: se pierden todos los datos.

## Ejecutar sin conexión a internet

Todo corre en local (Docker + Vite); solo se necesita internet la primera vez para descargar imágenes y dependencias. Para una defensa, ejecuta los pasos 3 y 4 con anticipación.

## Estructura del repositorio

```
api/            Endpoints REST (auth, usuarios, tutorías, cartas, reuniones, informes, ...)
models/         Acceso a datos (PDO)
includes/       Autenticación y verificación de permisos (RBAC)
config/         Conexión a la base de datos
database/       init.sql, migration_permisos.sql, seed y migrations/
frontend/       Aplicación React + Vite
uploads/        Fotos de perfil
docs/           Documentación (ver abajo)
docker-compose.yml, Dockerfile, .env.example
```

## Documentación

Todo está en la carpeta [`docs/`](docs/README.md):

- Historias de usuario: [`docs/historias/`](docs/historias/README.md) (una ficha por historia)
- Análisis: SRS, backlog y matriz de permisos
- Diseño: casos de uso, MER, diccionario de datos, estados y recuperación de contraseña (con diagramas Mermaid)
- Manuales de usuario: administrador, tutor y estudiante
- Pruebas: [`docs/pruebas/plan-pruebas.md`](docs/pruebas/plan-pruebas.md)
- Gestión: alcance, convención de Git, historial de commits, limitaciones y trabajo futuro


