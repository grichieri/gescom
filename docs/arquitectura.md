# Arquitectura

Gescom se compone de tres aplicaciones y varios servicios de apoyo, todos orquestados con un único `compose.yaml`.

## Componentes

| Componente | Carpeta | Tecnología | Puerto | Función |
|---|---|---|---|---|
| Frontend | `gescom-ui` | React, React Router, Vite, Tailwind | 3000 | Interfaz web |
| Backend | `gescom-backend` | Spring Boot, Gradle, Flyway | 8080 | API REST, reglas de negocio, acceso a datos |
| Microservicio de correo | `gescom-mail-service` | Spring Boot | 8081 | Envío de correos a partir de mensajes de RabbitMQ |
| Base de datos | (imagen) | PostgreSQL | 5432 | Datos persistentes |
| Caché | (imagen) | Redis | 6379 | Caché y apoyo a la sesión |
| Mensajería | (imagen) | RabbitMQ | 5672 / 15672 | Cola de correos (el 15672 es la consola web) |
| Correo de pruebas | (imagen) | Mailpit | 8025 / 1025 | Recibe los correos en desarrollo (web / SMTP) |

## Diagrama

```
┌──────────────┐      REST       ┌──────────────────┐
│  gescom-ui   │ ──────────────► │  gescom-backend  │
│ React + Vite │ ◄────────────── │   Spring Boot    │
└──────────────┘      JSON       └───────┬──────────┘
                                         │
                  ┌──────────────────────┼───────────────┐
                  ▼                      ▼               ▼
            ┌──────────┐          ┌────────────┐    ┌─────────┐
            │PostgreSQL│          │   Redis    │    │RabbitMQ │
            └──────────┘          └────────────┘    └────┬────┘
                                                         │
                                                         ▼
                                              ┌─────────────────────┐
                                              │ gescom-mail-service │──► SMTP
                                              └─────────────────────┘
```

## Cómo se comunican

- **Front → back:** peticiones HTTP a la API REST. La URL del back se fija al construir la imagen del front mediante `VITE_API_URL`.
- **Back → base de datos:** acceso directo a PostgreSQL. El esquema se versiona con Flyway.
- **Back → microservicio de correo:** de forma **asíncrona** mediante RabbitMQ. El back publica un mensaje y continúa; no espera respuesta ni conoce el resultado del envío. Ver [microservicio-correo.md](microservicio-correo.md).
- **Microservicio de correo → SMTP:** envío del mensaje. En desarrollo el servidor SMTP es Mailpit.

## Por qué un microservicio de correo

- **Desacoplamiento:** el back no depende de que el servidor de correo esté disponible. Si el envío falla, el registro del usuario no se ve afectado.
- **Reintentos y tolerancia a fallos:** la cola permite reintentar y aparcar los mensajes que no se pueden entregar.
- **Responsabilidad única:** plantillas y configuración SMTP viven en un solo sitio.

## Modos de ejecución

El `compose.yaml` define dos modos mediante el perfil `mail`:

| Modo | Contenedores | Comando |
|---|---|---|
| Básico | PostgreSQL, Redis, RabbitMQ, backend, frontend | `docker compose up -d --build` |
| Con correo | Los anteriores más microservicio de correo y Mailpit | `docker compose --profile mail up -d --build` |

Para que el backend publique mensajes hay que activar `MAIL_ENABLED=true` (por defecto está en `false`).

## Persistencia

Los datos de PostgreSQL viven en un volumen de Docker. `docker compose down` los conserva; `docker compose down -v` los elimina y obliga a volver a cargar el SQL de ejemplo.
