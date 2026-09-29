# Sistema Web de Apoyo Académico para Tutorías — UPDS Sede Tarija

Sistema web desarrollado para apoyar la gestión de tutorías académicas de la **Universidad Privada Domingo Savio (UPDS), Sede Tarija**.

El sistema permite administrar usuarios, tutores, estudiantes, materias, carreras, horarios, tutorías, evaluaciones, notificaciones, permisos y diferentes procesos relacionados con el acompañamiento académico.

---

## 1. Información del proyecto

**Proyecto:** Sistema Web de Apoyo Académico para Tutorías
**Materia:** Tecnologías Web I
**Grupo:** 5
**Sede:** UPDS Tarija

### Integrantes

* Julio Cesar Espinoza Tapia
* Lucero Marquez Velasquez
* Consuelo Angelica Rojas Rodas

---

# 2. Descripción

El sistema tiene como objetivo proporcionar una plataforma web para gestionar el proceso de tutorías académicas.

La aplicación cuenta con diferentes tipos de usuarios y permisos:

* **Administrador**
* **Tutor**
* **Estudiante**

Cada usuario puede acceder a diferentes funcionalidades dependiendo de su rol y de los permisos asignados.

Entre las principales funciones se encuentran:

* Inicio de sesión.
* Gestión de usuarios.
* Gestión de estudiantes.
* Gestión de tutores.
* Gestión de carreras.
* Gestión de materias.
* Asignación de materias a tutores.
* Gestión de disponibilidad de tutores.
* Solicitud y gestión de tutorías.
* Evaluación de tutorías.
* Notificaciones.
* Gestión de períodos de inscripción.
* Gestión de cupos.
* Reportes.
* Reuniones.
* Informes de avance.
* Cartas de designación.
* Control de permisos.
* Registro de accesos.

---

# 3. Tecnologías utilizadas

## Frontend

El frontend está desarrollado utilizando:

* React 19
* Vite
* React Router
* Axios
* Recharts
* Lucide React
* JavaScript

## Backend

El backend utiliza:

* PHP 8.2
* Apache
* API REST
* PDO
* MySQL

## Base de datos

* MySQL 8.0
* phpMyAdmin

## Infraestructura

* Docker
* Docker Compose

## Control de versiones

* Git

---

# 4. Arquitectura general

El proyecto utiliza una arquitectura separada entre frontend, backend y base de datos.

```text
                         USUARIO
                            │
                            ▼
                    ┌──────────────┐
                    │   Navegador  │
                    └──────┬───────┘
                           │
                           ▼
                 ┌───────────────────┐
                 │ React + Vite       │
                 │ localhost:5173     │
                 └─────────┬─────────┘
                           │
                     Peticiones API
                           │
                           ▼
                 ┌───────────────────┐
                 │ PHP + Apache       │
                 │ localhost:8000     │
                 │ REST API           │
                 └─────────┬─────────┘
                           │
                         PDO
                           │
                           ▼
                 ┌───────────────────┐
                 │ MySQL 8.0          │
                 │ tutorias_db        │
                 └───────────────────┘
```

También se incluye **phpMyAdmin** para administrar visualmente la base de datos.

---

# 5. Requisitos previos

Antes de descargar y ejecutar el proyecto es necesario tener instalado:

### Git

Permite descargar el proyecto desde el repositorio.

Comprobar instalación:

```bash
git --version
```

### Docker Desktop

Se utiliza para ejecutar:

* PHP + Apache
* MySQL
* phpMyAdmin

Comprobar instalación:

```bash
docker --version
```

### Node.js

Se utiliza para ejecutar el frontend React.

Se recomienda **Node.js 20 o superior**.

Comprobar instalación:

```bash
node --version
npm --version
```

### Visual Studio Code

Se recomienda utilizar Visual Studio Code para trabajar con el proyecto.

---

# 6. Descargar el proyecto desde Git

Abrir una terminal o PowerShell y dirigirse a la carpeta donde se desea guardar el proyecto.

Por ejemplo:

```powershell
cd Desktop
```

Clonar el repositorio:

```powershell
git clone URL_DEL_REPOSITORIO
```

Ejemplo:

```powershell
git clone https://github.com/usuario/tecnologiasweb.git
```

Ingresar al proyecto:

```powershell
cd tecnologiasweb
```

Comprobar que los archivos estén presentes:

```powershell
dir
```

La estructura principal debe ser similar a:

```text
tecnologiasweb/
│
├── api/
├── assets/
├── config/
├── controllers/
├── database/
├── frontend/
├── includes/
├── models/
├── uploads/
├── views/
│
├── .dockerignore
├── .env.example
├── .gitignore
├── .htaccess
├── Dockerfile
├── docker-compose.yml
└── index.php
```

---

# 7. Abrir el proyecto en Visual Studio Code

Desde la raíz del proyecto:

```powershell
code .
```

Esto abrirá todo el proyecto en Visual Studio Code.

La carpeta raíz debe ser:

```text
tecnologiasweb/
```

No se debe abrir únicamente la carpeta `frontend`, ya que Docker, la API y la base de datos se encuentran en la raíz del proyecto.

---

# 8. Configuración del archivo `.env`

El repositorio contiene:

```text
.env.example
```

Este archivo sirve como plantilla.

Primero se debe crear una copia llamada `.env`.

En PowerShell:

```powershell
Copy-Item .env.example .env
```

También se puede copiar manualmente:

```text
.env.example → .env
```

---

# 9. Configuración recomendada del `.env`

Editar el archivo `.env` y utilizar una configuración similar a:

```env
DB_HOST=db
DB_NAME=tutorias_db
DB_USER=tutorias_user
DB_PASS=tutorias123
DB_ROOT_PASS=root123

AUTH_SECRET_KEY=una_clave_larga_y_aleatoria
AUTH_TOKEN_TTL=86400

CORS_ALLOWED_ORIGINS=http://localhost:5173

MAIL_MODE=sandbox
```

### Descripción de las variables

| Variable               | Descripción                                |
| ---------------------- | ------------------------------------------ |
| `DB_HOST`              | Nombre del servicio MySQL dentro de Docker |
| `DB_NAME`              | Nombre de la base de datos                 |
| `DB_USER`              | Usuario de MySQL                           |
| `DB_PASS`              | Contraseña del usuario de MySQL            |
| `DB_ROOT_PASS`         | Contraseña del usuario root de MySQL       |
| `AUTH_SECRET_KEY`      | Clave utilizada para firmar los tokens     |
| `AUTH_TOKEN_TTL`       | Tiempo de duración del token en segundos   |
| `CORS_ALLOWED_ORIGINS` | Origen permitido para el frontend          |
| `MAIL_MODE`            | Modo utilizado para el envío de correos    |

El valor:

```text
AUTH_TOKEN_TTL=86400
```

corresponde a **24 horas**.

> **Importante:** el archivo `.env` contiene información sensible y no debe subirse al repositorio. El proyecto utiliza `.gitignore` para evitar que sea versionado.

---

# 10. Levantar Docker

Desde la raíz del proyecto:

```powershell
docker compose up -d --build
```

Este comando construye la imagen del proyecto y levanta los servicios definidos en `docker-compose.yml`.

La primera ejecución puede tardar porque Docker debe descargar las imágenes necesarias.

---

# 11. Servicios de Docker

El proyecto utiliza tres servicios principales.

## 11.1. Web — PHP + Apache

Nombre del contenedor:

```text
tutorias_web
```

Puerto:

```text
8000
```

Dirección:

```text
http://localhost:8000
```

Este servicio contiene:

* PHP 8.2
* Apache
* API REST
* código PHP del proyecto

---

## 11.2. Base de datos — MySQL

Nombre del contenedor:

```text
tutorias_db
```

Puerto:

```text
3306
```

La base de datos utilizada es:

```text
tutorias_db
```

---

## 11.3. phpMyAdmin

Nombre del contenedor:

```text
tutorias_phpmyadmin
```

Puerto:

```text
8080
```

Se puede acceder desde:

```text
http://localhost:8080
```

phpMyAdmin permite visualizar y administrar la base de datos de manera gráfica.

---

# 12. Verificar los contenedores

Después de ejecutar Docker:

```powershell
docker compose ps
```

Los servicios deberían aparecer activos.

También se pueden revisar los registros.

### Logs de MySQL

```powershell
docker compose logs db
```

### Logs del servidor web

```powershell
docker compose logs web
```

Para observar los logs en tiempo real:

```powershell
docker compose logs -f
```

---

# 13. Base de datos automática

No es necesario importar manualmente la base de datos mediante phpMyAdmin cuando se realiza una instalación nueva.

Docker monta automáticamente los scripts SQL ubicados en:

```text
database/
```

Entre ellos se encuentran:

```text
database/init.sql
database/migration_permisos.sql
database/seed_carreras_materias_horarios.sql
database/migrations/gestion_cupos_periodos.sql
database/migrations/05_notificaciones.sql
database/migrations/06_password_reset_tokens.sql
```

Durante la inicialización de MySQL estos scripts crean y configuran la base de datos.

---

# 14. Importante sobre la inicialización de MySQL

Los scripts de inicialización de MySQL se ejecutan cuando se crea una nueva instancia de la base de datos.

Si la base de datos ya existe dentro del volumen de Docker, modificar un archivo SQL no provoca automáticamente que se vuelva a ejecutar.

Para reconstruir completamente la base de datos:

```powershell
docker compose down -v
```

Luego:

```powershell
docker compose up -d --build
```

> **Advertencia:** `docker compose down -v` elimina el volumen de MySQL y, por lo tanto, elimina los datos almacenados en la base de datos.

---

# 15. Acceder a phpMyAdmin

Abrir:

```text
http://localhost:8080
```

Utilizar:

**Servidor:**

```text
db
```

**Usuario:**

```text
root
```

**Contraseña:**

La configurada en:

```env
DB_ROOT_PASS
```

Por ejemplo:

```text
root123
```

La base de datos debería aparecer como:

```text
tutorias_db
```

---

# 16. Estructura de la base de datos

La base de datos contiene las principales entidades del sistema.

Entre ellas:

```text
roles
usuarios
carreras
estudiantes
tutores
materias
tutor_materia
disponibilidad_tutor
tutorias
evaluaciones_tutoria
registro_accesos
```

Además, las migraciones agregan funcionalidades relacionadas con:

* permisos
* notificaciones
* cupos
* períodos de inscripción
* recuperación de contraseña

---

# 17. Ejecutar el frontend

Docker se encarga principalmente del backend y la base de datos.

El frontend React se ejecuta mediante Node.js y Vite.

Abrir una segunda terminal.

Desde la raíz:

```powershell
cd frontend
```

Instalar las dependencias:

```powershell
npm install
```

Después ejecutar:

```powershell
npm run dev
```

Vite mostrará una dirección similar a:

```text
Local: http://localhost:5173/
```

Abrir en el navegador:

```text
http://localhost:5173
```

---

# 18. Comunicación entre frontend y backend

El frontend funciona en:

```text
http://localhost:5173
```

El backend funciona en:

```text
http://localhost:8000
```

Vite tiene configurado un proxy para las rutas:

```text
/api
/uploads
```

Estas peticiones son enviadas al servidor PHP.

La comunicación funciona de la siguiente manera:

```text
React
  │
  │ /api
  ▼
Vite Proxy
  │
  ▼
PHP + Apache
  │
  ▼
PDO
  │
  ▼
MySQL
```

Esto permite que el frontend pueda consumir la API REST del backend.

---

# 19. Ejecutar el proyecto completo

Una vez configurado todo, se necesitan dos terminales.

## Terminal 1 — Docker

Desde:

```text
tecnologiasweb/
```

ejecutar:

```powershell
docker compose up -d
```

---

## Terminal 2 — React

Desde:

```text
tecnologiasweb/frontend/
```

ejecutar:

```powershell
npm run dev
```

---

## Aplicación

Abrir:

```text
http://localhost:5173
```

---

# 20. Usuarios de prueba

El proyecto incluye usuarios de prueba en la base de datos.

| Rol           | Usuario       | Contraseña |
| ------------- | ------------- | ---------- |
| Administrador | `admin`       | `password` |
| Tutor         | `tutor1`      | `password` |
| Estudiante    | `estudiante1` | `password` |

Estos usuarios permiten comprobar el comportamiento del sistema según los diferentes roles.

---

# 21. Roles del sistema

## Administrador

Tiene acceso a las funciones administrativas del sistema, incluyendo la gestión de:

* usuarios
* roles
* permisos
* carreras
* materias
* tutores
* estudiantes
* períodos
* cupos
* reportes
* configuraciones administrativas

---

## Tutor

Puede trabajar con las funcionalidades relacionadas con la tutoría académica, incluyendo:

* disponibilidad
* materias asignadas
* tutorías
* estudiantes
* evaluaciones
* reuniones
* informes

---

## Estudiante

Puede utilizar las funcionalidades relacionadas con su proceso académico y de tutorías, incluyendo:

* consulta de materias
* consulta de tutores
* disponibilidad
* solicitud de tutorías
* seguimiento de tutorías
* evaluaciones
* notificaciones

---

# 22. Seguridad

El sistema implementa diferentes mecanismos de seguridad.

## Autenticación

El usuario debe iniciar sesión para acceder a las funcionalidades protegidas.

La API utiliza tokens enviados mediante:

```text
Authorization: Bearer TOKEN
```

---

## Firma HMAC-SHA256

Los tokens utilizan una clave secreta configurada mediante:

```env
AUTH_SECRET_KEY
```

La firma permite verificar que el token no haya sido alterado.

---

## Tiempo de expiración

Los tokens tienen un tiempo de vida configurado mediante:

```env
AUTH_TOKEN_TTL
```

Por defecto:

```text
86400 segundos
```

equivalentes a:

```text
24 horas
```

---

## Contraseñas

Las contraseñas no se almacenan directamente como texto plano.

Se almacenan mediante hashes y se verifican mediante mecanismos seguros de PHP.

---

## Autorización

Además de verificar quién inició sesión, el sistema verifica qué acciones puede realizar el usuario.

Esto se implementa mediante:

* roles
* permisos
* protección de endpoints

Por ejemplo:

```text
Autenticación:
¿Quién eres?

Autorización:
¿Qué puedes hacer?
```

---

## Protección contra SQL Injection

El backend utiliza PDO y consultas preparadas para reducir el riesgo de inyección SQL.

---

## CORS

El acceso desde el frontend está controlado mediante:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## Registro de accesos

El sistema cuenta con mecanismos para registrar accesos y eventos relacionados con la autenticación.

---

# 23. Estructura del proyecto

```text
tecnologiasweb/
│
├── api/
│   ├── auth/
│   ├── usuarios/
│   ├── estudiantes/
│   ├── tutores/
│   ├── materias/
│   ├── carreras/
│   ├── tutorias/
│   ├── evaluaciones/
│   ├── disponibilidad/
│   ├── dashboard/
│   ├── roles/
│   ├── accesos/
│   ├── notificaciones/
│   ├── reportes/
│   ├── cartas_designacion/
│   ├── reuniones/
│   ├── informes_avance/
│   └── periodos_inscripcion/
│
├── assets/
│
├── config/
│   └── conexion.php
│
├── controllers/
│
├── database/
│   ├── init.sql
│   ├── migration_permisos.sql
│   ├── seed_carreras_materias_horarios.sql
│   └── migrations/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── includes/
│
├── models/
│
├── uploads/
│   └── perfiles/
│
├── views/
│
├── .dockerignore
├── .env.example
├── .gitignore
├── .htaccess
├── Dockerfile
├── docker-compose.yml
└── index.php
```

---

# 24. Descripción de las carpetas principales

## `api/`

Contiene los endpoints de la API REST.

Aquí se encuentran las operaciones que utiliza el frontend para comunicarse con el backend.

---

## `config/`

Contiene configuraciones generales.

Por ejemplo:

```text
config/conexion.php
```

se encarga de establecer la conexión con MySQL mediante PDO.

---

## `controllers/`

Contiene controladores PHP utilizados para organizar la lógica de determinadas funcionalidades.

---

## `models/`

Contiene la lógica relacionada con el acceso y manipulación de datos.

Los modelos realizan operaciones contra la base de datos.

---

## `includes/`

Contiene archivos PHP reutilizables relacionados principalmente con autenticación, sesiones y seguridad.

Entre ellos se encuentran mecanismos para:

* verificar sesiones
* validar tokens
* comprobar permisos

---

## `database/`

Contiene:

* estructura de la base de datos
* migraciones
* datos iniciales
* semillas

---

## `frontend/`

Contiene toda la aplicación React.

---

## `frontend/src/components/`

Componentes reutilizables de la interfaz.

---

## `frontend/src/pages/`

Pantallas principales de la aplicación.

---

## `frontend/src/routes/`

Configuración de las rutas del frontend y protección según roles.

---

## `frontend/src/context/`

Contiene contextos globales de React.

Por ejemplo:

* autenticación
* notificaciones Toast

---

## `frontend/src/services/`

Contiene funciones para comunicarse con la API.

Entre ellas:

* autenticación
* solicitudes HTTP
* obtención y envío de datos

---

## `uploads/`

Contiene archivos subidos por los usuarios, como imágenes de perfil.

---

# 25. Comandos principales

## Descargar el proyecto

```powershell
git clone URL_DEL_REPOSITORIO
```

## Entrar al proyecto

```powershell
cd tecnologiasweb
```

## Crear `.env`

```powershell
Copy-Item .env.example .env
```

## Construir y levantar Docker

```powershell
docker compose up -d --build
```

## Ver servicios

```powershell
docker compose ps
```

## Ver logs

```powershell
docker compose logs
```

## Detener servicios

```powershell
docker compose down
```

## Detener y eliminar la base de datos

```powershell
docker compose down -v
```

## Volver a levantar Docker

```powershell
docker compose up -d
```

---

# 26. Comandos del frontend

Ingresar:

```powershell
cd frontend
```

Instalar dependencias:

```powershell
npm install
```

Ejecutar en desarrollo:

```powershell
npm run dev
```

Crear versión de producción:

```powershell
npm run build
```

Vista previa de producción:

```powershell
npm run preview
```

Comprobar código:

```powershell
npm run lint
```

---

# 27. Solución de problemas

## Docker no inicia

Comprobar que Docker Desktop esté abierto.

Luego:

```powershell
docker compose ps
```

---

## El frontend no inicia

Entrar en:

```powershell
cd frontend
```

y ejecutar:

```powershell
npm install
```

Después:

```powershell
npm run dev
```

---

## No conecta con la base de datos

Comprobar:

```powershell
docker compose ps
```

y:

```powershell
docker compose logs db
```

También verificar las variables del archivo `.env`.

---

## La base de datos no tiene las tablas

Si se trata de una instalación nueva, comprobar los logs:

```powershell
docker compose logs db
```

Si se necesita reconstruir completamente la base:

```powershell
docker compose down -v
docker compose up -d --build
```

> Esto elimina todos los datos almacenados en el volumen de MySQL.

---

## El frontend no puede comunicarse con la API

Verificar que Docker esté ejecutándose:

```powershell
docker compose ps
```

Comprobar que el backend esté disponible:

```text
http://localhost:8000
```

También verificar en `.env`:

```env
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

# 28. Actualizar el proyecto desde Git

Si el proyecto ya está descargado y existen nuevos cambios en el repositorio:

```powershell
git pull
```

Si cambiaron las dependencias del frontend:

```powershell
cd frontend
npm install
```

Si hubo cambios en Docker:

```powershell
cd ..
docker compose up -d --build
```

---

# 29. Flujo completo desde cero

Para una computadora nueva:

```powershell
# 1. Descargar
git clone URL_DEL_REPOSITORIO

# 2. Entrar
cd tecnologiasweb

# 3. Crear configuración
Copy-Item .env.example .env

# 4. Configurar .env

# 5. Levantar backend + base de datos
docker compose up -d --build

# 6. Entrar al frontend
cd frontend

# 7. Instalar dependencias
npm install

# 8. Ejecutar React
npm run dev
```

Luego abrir:

```text
http://localhost:5173
```

---

# 30. Direcciones importantes

| Servicio       | Dirección             |
| -------------- | --------------------- |
| Frontend React | http://localhost:5173 |
| Backend PHP    | http://localhost:8000 |
| phpMyAdmin     | http://localhost:8080 |
| MySQL          | localhost:3306        |

---

# 31. Flujo de inicio de sesión

El flujo general de autenticación es:

```text
Usuario
   │
   ▼
Formulario de Login
   │
   ▼
React
   │
   ▼
API de autenticación
   │
   ▼
PHP
   │
   ▼
MySQL
   │
   ▼
Verificación de usuario
   │
   ▼
Token firmado
   │
   ▼
React
   │
   ▼
Sesión autenticada
```

Posteriormente, las peticiones protegidas incluyen:

```text
Authorization: Bearer TOKEN
```

El backend valida el token antes de permitir el acceso a los recursos protegidos.

---

# 32. Flujo de datos

Una operación normal del sistema sigue aproximadamente este flujo:

```text
Usuario
   ↓
React
   ↓
Axios
   ↓
API REST
   ↓
Controller / lógica
   ↓
Model
   ↓
PDO
   ↓
MySQL
   ↓
Respuesta
   ↓
React
   ↓
Interfaz
```

---

# 33. Desarrollo local

Durante el desarrollo se recomienda mantener abiertas dos terminales.

### Terminal 1

```powershell
docker compose up -d
```

### Terminal 2

```powershell
cd frontend
npm run dev
```

No es necesario ejecutar manualmente Apache o MySQL porque Docker se encarga de estos servicios.

---

# 34. Consideraciones para Git

El archivo:

```text
.env
```

no debe subirse al repositorio porque contiene configuraciones y credenciales.

El archivo que sí debe estar en Git es:

```text
.env.example
```

Este sirve como plantilla para que los demás integrantes puedan crear su propio `.env`.

Después de clonar el proyecto, cada integrante debe ejecutar:

```powershell
Copy-Item .env.example .env
```

y configurar sus valores locales.

---

# 35. Preparación para una demostración

Antes de realizar una demostración del sistema:

1. Abrir Docker Desktop.
2. Verificar que los contenedores estén funcionando.
3. Ejecutar:

```powershell
docker compose ps
```

4. Ejecutar el frontend:

```powershell
cd frontend
npm run dev
```

5. Abrir:

```text
http://localhost:5173
```

6. Utilizar uno de los usuarios de prueba.

Por ejemplo:

```text
Usuario: estudiante1
Contraseña: password
```

---

# 36. Resumen

El proyecto utiliza:

```text
Git
 │
 └── Código fuente
       │
       ▼
Docker Compose
 │
 ├── PHP 8.2 + Apache
 │      │
 │      └── API REST
 │
 ├── MySQL 8.0
 │      │
 │      └── tutorias_db
 │
 └── phpMyAdmin
```

Mientras que el frontend se ejecuta con:

```text
Node.js
   │
   ▼
Vite
   │
   ▼
React
   │
   ▼
localhost:5173
```

La comunicación completa es:

```text
                 ┌─────────────────┐
                 │     USUARIO     │
                 └────────┬────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │ React + Vite    │
                 │ :5173           │
                 └────────┬────────┘
                          │
                       Axios
                          │
                          ▼
                 ┌─────────────────┐
                 │ PHP + Apache    │
                 │ :8000           │
                 └────────┬────────┘
                          │
                         PDO
                          │
                          ▼
                 ┌─────────────────┐
                 │ MySQL 8.0       │
                 │ tutorias_db     │
                 └─────────────────┘
```

Con esta configuración, cualquier integrante puede descargar el proyecto desde Git, crear su archivo `.env`, levantar Docker, instalar las dependencias del frontend y ejecutar el sistema localmente.
