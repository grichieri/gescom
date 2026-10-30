# Gescom

**Sistema de Gestión de Incidencias y Mantenimiento Comunitario**

Gescom es una aplicación web para que las comunidades de vecinos (edificios y chalets) registren, sigan y resuelvan incidencias de forma ordenada: una avería en el ascensor, una fuga en el garaje, una luz quemada en la escalera. Vecinos, presidentes, administradores y conserjes trabajan sobre la misma plataforma, cada uno con los permisos de su cargo.

Proyecto MVP desarrollado en el marco de **Ciudadanía Comprometida (Fundación Esplai)**, como proyecto final del bootcamp de Java.

Las pantallas de la aplicación pueden verse en el archivo [docs/screens/screens.pdf](docs/screens/screens.pdf).

---

## Qué permite hacer

- **Registro y acceso** de usuarios con verificación de correo y recuperación de contraseña.
- **Incidencias**: crear, listar, filtrar y ver el detalle, con estado (pendiente, en progreso, resuelto), prioridad (baja, media, alta) y hasta 5 fotos.
- **Seguimiento**: comentarios de quien gestiona la incidencia (presidente, administrador o conserje) para registrar el avance.
- **Comunidades y viviendas**: el superadministrador crea comunidades y viviendas y asigna cargos con fechas de inicio y fin.
- **Usuarios y cargos**: alta de usuarios por el superadministrador (con correo de bienvenida para elegir contraseña), cambio de cargo, baja y reactivación.
- **Correo como microservicio**: el envío de correos es independiente del backend y se comunica por mensajería (RabbitMQ).

## Roles

| Rol | Qué hace |
|---|---|
| Superadministrador | Crea comunidades y viviendas, da de alta usuarios y asigna cargos |
| Administrador | Gestiona las incidencias de su comunidad |
| Presidente | Gestiona las incidencias de su comunidad |
| Conserje | Gestiona las incidencias de su comunidad |
| Vecino (residente) | Crea incidencias y consulta su estado |

## Arquitectura

```
┌──────────────┐      REST       ┌──────────────────┐
│  gescom-ui   │ ──────────────► │  gescom-backend  │
│ React + Vite │                 │   Spring Boot    │
└──────────────┘                 └───────┬──────────┘
                                         │
                  ┌──────────────────────┼───────────────┐
                  ▼                      ▼               ▼
            ┌──────────┐          ┌────────────┐    ┌─────────┐
            │PostgreSQL│          │   Redis    │    │RabbitMQ │
            └──────────┘          └────────────┘    └────┬────┘
                                                         │ cola de correos
                                                         ▼
                                              ┌─────────────────────┐
                                              │ gescom-mail-service │ ──► SMTP (Mailpit en desarrollo)
                                              │    Spring Boot      │
                                              └─────────────────────┘
```

El backend publica un mensaje en RabbitMQ (verificación, recuperación de contraseña o bienvenida) y **no espera respuesta**. El microservicio de correo lo consume, genera el mensaje a partir de una plantilla y lo envía por SMTP. Si el envío falla, reintenta con espera creciente y, agotados los intentos, deja el mensaje en una cola de mensajes muertos.

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | React, React Router (modo framework), Vite, TypeScript, Tailwind CSS |
| Backend | Java, Spring Boot, Gradle, JDBC, Flyway |
| Correo | Spring Boot, RabbitMQ, JavaMailSender |
| Datos | PostgreSQL, Redis |
| Infraestructura | Docker y Docker Compose, Mailpit (correo de pruebas) |

## Estructura del repositorio

```
gescom/
├── gescom-backend/                  API REST (Spring Boot)
├── gescom-ui/                       Aplicación web (React)
├── gescom-mail-service/             Microservicio de correo
├── docs/                            Documentación, PRD y diseño
└── compose.yaml                     Levanta todo el sistema
```

## Puesta en marcha

### Requisitos

- Docker y Docker Compose
- Puertos libres: 3000, 5432, 5672, 6379, 8025, 8080, 8081, 15672

### 1. Clonar

```bash
git clone https://github.com/grichieri/gescom.git
cd gescom
```

### 2. Levantar

Modo básico (5 contenedores: PostgreSQL, Redis, RabbitMQ, backend y frontend):

```bash
docker compose up -d --build
```

Modo completo con correo (7 contenedores, añade el microservicio y Mailpit):

```bash
echo "MAIL_ENABLED=true" > .env
docker compose --profile mail up -d --build
```

### 3. Cargar los datos de ejemplo

```bash
docker exec -i gescom-postgres psql -U gescom_user_db -d gescom_db < gescom-backend/gescom_datos_ejemplo_con_tokens.sql
```

Debe terminar con `COMMIT`.

### 4. Abrir

| Servicio | URL |
|---|---|
| Aplicación | http://localhost:3000 |
| API | http://localhost:8080 |
| Mailpit (correos de prueba) | http://localhost:8025 |
| RabbitMQ (administración) | http://localhost:15672 |

### Usuarios de ejemplo

Todos ficticios, con contraseña `Gescom@1234`:

| Usuario | Rol |
|---|---|
| laura.gomez@example.com | Superadministrador |
| carlos.ruiz@example.com | Administrador |
| antonio.fernandez@example.com | Presidente |
| manuel.iglesias@example.com | Conserje |
| lucia.torres@example.com | Residente (inquilina) |

> Las credenciales de PostgreSQL y RabbitMQ del `compose.yaml` son **solo para desarrollo**. No las uses en un entorno real.

### Variables de entorno

Se definen en un archivo `.env` junto al `compose.yaml` (no se sube al repositorio):

| Variable | Para qué sirve | Por defecto |
|---|---|---|
| `MAIL_ENABLED` | Activa el envío de correos desde el backend | `false` |
| `FRONT_URL` | URL pública del front, usada en los enlaces de los correos | `http://localhost:3000` |
| `CORS_ORIGINS` | Orígenes permitidos por el backend | `http://localhost:3000,http://localhost:5173` |
| `SMTP_HOST` / `SMTP_PORT` | Servidor de correo | `mailpit` / `1025` |

Para desplegar en un servidor distinto de `localhost`, la URL del backend que usa el front se fija al construir la imagen (`VITE_API_URL`), por lo que hay que reconstruir el frontend.

### Parar y limpiar

```bash
docker compose --profile mail down        # conserva los datos
docker compose --profile mail down -v     # borra también la base de datos
```

## Documentación

Más detalle en [`docs/`](docs/):

- [Arquitectura](docs/arquitectura.md)
- [Microservicio de correo](docs/microservicio-correo.md)
- [Modelo de datos](docs/modelo-de-datos.md)
- [API](docs/api.md)
- [Roles y permisos](docs/roles-y-permisos.md)
- [Guía de despliegue](docs/despliegue.md)
- [PRD del producto](docs/PRD_GESCOM.md) y [MVP](docs/MVP%20Gescom.pdf)
- [Diagrama entidad-relación](docs/ERD-Gescom.jpg)
- [Pantallas de diseño](docs/screens/)

## Estado y limitaciones

Este es un MVP. Quedan fuera de alcance, o pendientes de mejorar:

- Las contraseñas se guardan sin cifrar (solo para fines didácticos).
- El vínculo entre usuario y vivienda se hace por coincidencia de la dirección escrita.
- El backend no guarda el estado de entrega de los correos.
- Parte de los datos de la interfaz (listado de usuarios, comunidades y viviendas) aún se guarda en el navegador; la migración completa a base de datos está prevista.
- Los requisitos *Should Have* y *Could Have* del PRD no se han desarrollado.

## Autor

Repositorio publicado por Gerardo Richieri ([@grichieri](https://github.com/grichieri)).

## Licencia

El código se publica para que pueda consultarse y estudiarse. Se distribuye bajo la licencia [PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0): se puede usar, copiar y modificar para fines **no comerciales**. **No está permitido usarlo para obtener un beneficio comercial ni venderlo como producto o servicio.**

Consulta el archivo [LICENSE](LICENSE) para el texto completo.

Copyright (c) 2026 Gerardo Richieri Vega.
