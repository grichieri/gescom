# Guía de despliegue

Cómo levantar Gescom en tu equipo o en un servidor con Docker.

## Requisitos

- Docker y Docker Compose
- Puertos libres: 3000, 5432, 5672, 6379, 8025, 8080, 8081, 15672

## 1. Obtener el código

```bash
git clone https://github.com/grichieri/gescom.git
cd gescom
```

Todos los comandos siguientes se ejecutan desde la carpeta `gescom/`, donde está el `compose.yaml`.

## 2. Configurar el entorno

Crea un archivo `.env` junto al `compose.yaml`. **No lo subas al repositorio.**

```env
MAIL_ENABLED=true
```

### Variables disponibles

| Variable | Descripción | Por defecto |
|---|---|---|
| `MAIL_ENABLED` | El backend publica los correos en RabbitMQ | `false` |
| `FRONT_URL` | URL pública del front, para los enlaces de los correos | `http://localhost:3000` |
| `CORS_ORIGINS` | Orígenes que el back acepta, separados por comas | `http://localhost:3000,http://localhost:5173` |
| `SMTP_HOST` | Servidor SMTP del microservicio | `mailpit` |
| `SMTP_PORT` | Puerto SMTP | `1025` |
| `SMTP_AUTH` | Autenticación SMTP | `false` |
| `SMTP_STARTTLS` | STARTTLS | `false` |
| `SMTP_USER` / `SMTP_PASSWORD` | Credenciales SMTP | vacío |
| `MAIL_FROM` / `MAIL_FROM_NAME` | Remitente | `no-reply@gescom.local` / `Gescom` |
| `MAIL_APP_NAME` | Nombre de la aplicación en los correos | `Gescom` |

Hay que tener en cuenta que `VITE_API_URL` (la URL del back que usa el front) **se fija al construir la imagen del front**. Si cambia, hay que reconstruirla con `docker compose build frontend`.

## 3. Levantar

Modo básico (5 contenedores):

```bash
docker compose up -d --build
```

Modo con correo (7 contenedores):

```bash
docker compose --profile mail up -d --build
```

Comprueba que todos están en marcha:

```bash
docker compose --profile mail ps
```

## 4. Cargar los datos de ejemplo

```bash
docker exec -i gescom-postgres psql -U gescom_user_db -d gescom_db < gescom-backend/gescom_datos_ejemplo_con_tokens.sql
```

El resultado debe terminar con `COMMIT`.

## 5. Comprobar

| Qué | Dónde |
|---|---|
| Aplicación | http://localhost:3000 |
| API | http://localhost:8080 |
| Correos de prueba | http://localhost:8025 |
| Consola de RabbitMQ | http://localhost:15672 |

Inicia sesión con un usuario de ejemplo (ver el [README](../README.md)). Para comprobar el correo, crea un usuario desde la cuenta de superadministrador y busca el mensaje en Mailpit.

## Despliegue en un servidor propio

Si la aplicación no se sirve desde `localhost`:

1. Define `FRONT_URL` con la URL pública del front, para que los enlaces de los correos funcionen.
2. Añade esa misma URL a `CORS_ORIGINS`, o el navegador bloqueará las llamadas al back.
3. Define `VITE_API_URL` con la URL pública del back y reconstruye el front.
4. Para ver los correos en Mailpit, el microservicio debe poder llegar a `SMTP_HOST` y el perfil `mail` debe estar activo. Para enviar correos reales, apunta `SMTP_*` a un servidor SMTP real.
5. Cambia las credenciales de PostgreSQL y RabbitMQ del `compose.yaml`, que son solo de desarrollo.

## Operación

```bash
docker compose --profile mail logs -f backend      # ver los registros del back
docker compose --profile mail down                 # parar conservando los datos
docker compose --profile mail down -v              # parar y borrar los datos
```

Tras `down -v` hay que volver a cargar el SQL de ejemplo.

## Problemas frecuentes

| Síntoma | Causa probable | Solución |
|---|---|---|
| No llegan correos | `MAIL_ENABLED` está en `false` | Activarlo en `.env` y recrear el back: `docker compose --profile mail up -d` |
| No llegan correos al servidor | Falta el perfil `mail` o `SMTP_HOST` apunta a otro sitio | Levantar con `--profile mail` y revisar `SMTP_HOST` |
| Los enlaces del correo apuntan a `localhost` | `FRONT_URL` sin definir | Definirlo en `.env` |
| El front no puede llamar al back | `CORS_ORIGINS` no incluye la URL del front | Añadirla y recrear el back |
| El front sigue llamando a la URL antigua del back | `VITE_API_URL` se fijó al construir | `docker compose build frontend` |
| Tras reiniciar Docker faltan contenedores | Postgres, Redis, RabbitMQ y Mailpit no se reinician solos | `docker compose --profile mail up -d` y `docker compose restart backend` |
| Se ve la interfaz antigua tras reconstruir | Caché del navegador | Recarga forzada (Ctrl+Shift+R) o ventana privada |
