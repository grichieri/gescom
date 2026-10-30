# Modelo de datos

Base de datos PostgreSQL `gescom_db`. El esquema está en `gescom-backend/gescom_tablas.sql` y los datos de ejemplo en `gescom_datos_ejemplo_con_tokens.sql`.

## Diagrama

```
provinces ──< cities ──< users
                 │
                 └─────< communities ──< properties
                              │
        ┌──────────┬──────────┼───────────┬──────────────┐
        ▼          ▼          ▼           ▼              ▼
communities_  communities_  communities_ communities_  incidences ──< incidence_comments
   users     administrators presidents   caretakers        │
        │          │          │           │                └──< incidence_pictures
        └──────────┴──── users ───────────┘
```

Las tablas `communities_*` relacionan usuarios con comunidades. Las incidencias pertenecen a una comunidad, opcionalmente a una vivienda, y las reporta un usuario.

## Tablas

### provinces y cities

| Tabla | Campos principales |
|---|---|
| `provinces` | `province_id`, `name` |
| `cities` | `city_id`, `province_id` (FK), `name` |

### users

| Campo | Tipo | Notas |
|---|---|---|
| `user_id` | integer | PK, generado |
| `name`, `lastname` | varchar | Obligatorios |
| `type` | smallint | `1` Superadmin, `2` Usuario. Administrador, presidente y conserje se asignan por comunidad |
| `resident_type` | smallint | `1` Propietario, `2` Inquilino; nulo si no es residente |
| `avatar` | varchar | Ruta o URL de la foto de perfil |
| `dni`, `phone_number` | varchar | `dni` único |
| `is_validated` | boolean | Correo verificado (por defecto `false`) |
| `is_active` | boolean | Cuenta activa (por defecto `true`) |
| `is_disabled` | boolean | Cuenta deshabilitada (por defecto `false`) |
| `email` | varchar | Obligatorio y único |
| `password` | varchar | Obligatorio |
| `address`, `zip_code` | varchar | Dirección del usuario |
| `city_id` | smallint | FK a `cities` |

### communities

| Campo | Tipo | Notas |
|---|---|---|
| `community_id` | integer | PK, generado |
| `name`, `nif` | varchar | Obligatorios |
| `type` | smallint | `1` Edificio, `2` Chalet |
| `address`, `zip_code`, `city_id` | | Obligatorios; `city_id` es FK |
| `is_deleted` | boolean | Borrado lógico |
| `registration_code` | uuid | Código único de la URL de registro de la comunidad |

### properties

| Campo | Notas |
|---|---|
| `property_id` | PK |
| `community_id` | FK a `communities` |
| `block_portal` | Bloque o portal (opcional) |
| `address`, `zip_code` | Obligatorios |

No hay clave foránea entre `users` y `properties`: la vinculación en la interfaz se hace comparando el texto de la dirección.

### communities_users

Residentes de cada comunidad: `community_id`, `user_id`, `move_in_date` (por defecto, la fecha de registro) y `move_out_date` (opcional, no anterior a la entrada).

### communities_administrators, communities_presidents y communities_caretakers

Mismo esquema en las tres, para los cargos de cada comunidad:

| Campo | Notas |
|---|---|
| `community_*_id` | PK |
| `community_id`, `user_id` | FK |
| `start_date` | Inicio del cargo |
| `end_date` | Fin del cargo; **nulo = titular actual** |

Hay una restricción para que `end_date` no sea anterior a `start_date`.

### incidences

| Campo | Notas |
|---|---|
| `incidence_id` | PK |
| `community_id` | FK, obligatorio |
| `property_id` | FK, opcional |
| `reported_by_user_id` | FK a `users`, quien la reporta |
| `name` | Título |
| `status` | `1` Pendiente (defecto), `2` En progreso, `3` Resuelto |
| `priority` | `1` Baja (defecto), `2` Media, `3` Alta |
| `description` | Texto libre |
| `created_date` | Fecha y hora de creación |
| `max_resolution_date` | Fecha máxima de resolución (opcional) |

### incidence_comments

Seguimiento de cada incidencia: varios comentarios con fecha.

| Campo | Notas |
|---|---|
| `comment_id` | PK |
| `incidence_id` | FK; al borrar la incidencia se borran sus comentarios |
| `user_id` | Quien escribe el comentario |
| `comment` | Texto; no puede estar vacío |
| `created_date` | Fecha y hora |

Qué roles pueden comentar lo controla la aplicación, no la base de datos.

### incidence_pictures

Fotos de cada incidencia, de 0 a 5.

| Campo | Notas |
|---|---|
| `picture_id` | PK; las fotos se muestran por este orden |
| `incidence_id` | FK; al borrar la incidencia se borran sus fotos |
| `url` | Ruta o URL del archivo; la imagen vive en el almacenamiento de archivos, no en la base de datos |
| `created_date` | Fecha y hora |

El máximo de 5 fotos por incidencia lo valida el backend.

## Tokens de los correos

Los enlaces de un solo uso que se mandan por correo se guardan en `verification_tokens`. Ver [microservicio-correo.md](microservicio-correo.md).

| Campo | Notas |
|---|---|
| `token_id` | PK |
| `user_id` | FK a `users`; al borrar el usuario se borran sus tokens |
| `token` | 64 caracteres, único |
| `type` | `1` verificar el correo tras registrarse, `2` definir o restablecer la contraseña |
| `expires_at` | Caducidad (24 horas) |
| `used_at` | Fecha de uso; nulo si no se ha usado |
| `created_date` | Fecha y hora de creación |

La tabla existe siempre, aunque el envío de correos esté desactivado.

## Cargar el esquema

```bash
docker exec -i gescom-postgres psql -U gescom_user_db -d gescom_db < gescom-backend/gescom_tablas.sql
```

El script empieza borrando todas las tablas (`DROP TABLE IF EXISTS`), por lo que **elimina los datos existentes**. También incluye la carga de provincias y ciudades.

Con el `compose.yaml` no hace falta ejecutarlo: el backend crea el esquema al arrancar con Flyway (`src/main/resources/db/migration`). Este script sirve para montar la base de datos a mano, por ejemplo desde DBeaver. No mezcles ambos métodos sobre la misma base de datos.
