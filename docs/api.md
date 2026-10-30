# API

API REST del backend (`gescom-backend`), disponible en `http://localhost:8080`. Las peticiones y respuestas usan JSON, salvo las que suben archivos (`multipart/form-data`).

## Autenticación

El acceso se hace con un token que devuelve el login. Las rutas protegidas esperan la cabecera:

```
Authorization: Bearer <token>
```

Algunas rutas comprueban además el **rol** del usuario (ver [roles-y-permisos.md](roles-y-permisos.md)). En las tablas, la columna «Acceso» indica qué se exige:

| Acceso | Significado |
|---|---|
| Público | No necesita token |
| Token | Cualquier usuario identificado |
| Miembro | Pertenece a la comunidad |
| Gestor | Superadministrador, administrador, presidente o conserje de la comunidad |
| Superadmin | Solo el superadministrador |
| Él mismo | El propio usuario (o el superadministrador, según la ruta) |

## Cuenta y acceso — `/user/auth`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/user/auth/login` | Público | Inicia sesión con correo y contraseña; devuelve el token |
| POST | `/user/auth/logout` | Público | Cierra la sesión |
| GET | `/user/auth/me` | Token | Quién soy y qué cargo tengo en cada comunidad |
| POST | `/user/auth/verify-email` | Público | Verifica el correo con el token del enlace |
| POST | `/user/auth/resend-verification` | Público | Reenvía el correo de verificación |
| POST | `/user/auth/forgot-password` | Público | Pide el correo para restablecer la contraseña |
| POST | `/user/auth/reset-password` | Público | Define la contraseña nueva con el token del enlace |

El login rechaza con **403** las cuentas sin verificar o desactivadas.

## Registro — `/api/register`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/register/{communityUuid}` | Público | Devuelve el nombre de la comunidad de un código de registro |
| POST | `/api/register/{communityUuid}` | Público | Registra un usuario en esa comunidad. Con el correo activado, envía el de verificación. Respuesta **201** con `userId`, `email` y si requiere verificación |

`communityUuid` es el `registration_code` de la comunidad, el que lleva la URL de registro.

## Usuarios — `/api/users`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/users` | Superadmin | Lista todos los usuarios |
| GET | `/api/users/{id}` | — | Devuelve un usuario |
| POST | `/api/users` | Superadmin | Crea un usuario |
| PUT | `/api/users/{id}` | Él mismo o gestor | Actualiza un usuario. Solo el superadmin puede cambiar el tipo de usuario |
| PUT | `/api/users/{id}/password` | Él mismo o superadmin | Cambia la contraseña (**204**) |
| POST | `/api/users/{id}/avatar` | Él mismo o superadmin | Sube la foto de perfil (`multipart`, parte `avatar`); devuelve el usuario con la nueva URL |

## Comunidades — `/api/communities`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/communities` | — | Lista las comunidades |
| GET | `/api/communities/{id}` | — | Devuelve una comunidad |
| POST | `/api/communities` | Superadmin | Crea una comunidad (**201**) |
| PUT | `/api/communities/{id}` | Gestor | Actualiza una comunidad |
| DELETE | `/api/communities/{id}` | Superadmin | Elimina una comunidad (**204**) |
| GET | `/api/communities/{id}/users` | Miembro | Lista los usuarios de la comunidad |
| GET | `/api/communities/{id}/incidences` | Miembro | Lista las incidencias de la comunidad |
| POST | `/api/communities/{communityId}/users` | Gestor | Alta de un usuario por la administración (queda validado). Con el correo activado, recibe un correo de bienvenida para elegir su contraseña (**201**) |
| PUT | `/api/communities/{communityId}/users/{userId}/role` | Gestor | Cambia o quita el cargo de un usuario; el cuerpo lleva `role`, `startDate` y `endDate` (**204**) |
| GET | `/api/comunidades/{comunityId}` | — | Administradores de la comunidad |

## Viviendas — `/api/properties`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/properties` | Lista todas las viviendas |
| GET | `/api/properties/{id}` | Devuelve una vivienda |
| GET | `/api/properties/community/{communityId}` | Viviendas de una comunidad |
| POST | `/api/properties` | Crea una vivienda (**201**) |
| PUT | `/api/properties/{id}` | Actualiza una vivienda |
| DELETE | `/api/properties/{id}` | Elimina una vivienda (**204**) |

## Incidencias — `/api/incidences`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/incidences` | — | Lista incidencias; admite filtros por parámetros de consulta |
| GET | `/api/incidences/{id}` | Miembro | Detalle de la incidencia, con fotos y comentarios |
| POST | `/api/incidences` | Miembro | Crea una incidencia (JSON) |
| POST | `/api/incidences` (`multipart/form-data`) | Miembro | Crea una incidencia con fotos: parte `incidencia` (JSON) y parte `fotos` (de 0 a 5 imágenes) |
| PUT | `/api/incidences/{id}` | Gestor | Cambia el estado y la prioridad |
| DELETE | `/api/incidences/{id}` | Gestor | Elimina la incidencia, con sus fotos y comentarios |
| POST | `/api/incidences/{id}/comments` | Miembro | Añade un comentario; el autor es el usuario del token (**201**) |

Al crear una incidencia hay que pertenecer a la comunidad y reportarla a nombre propio; el superadministrador puede reportar por otro usuario.

Estado: `1` Pendiente, `2` En progreso, `3` Resuelto. Prioridad: `1` Baja, `2` Media, `3` Alta.

## Datos auxiliares

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/provincias` | Lista de provincias |
| GET | `/api/ciudades` | Lista de ciudades |

> Estas tres rutas (`/api/provincias`, `/api/ciudades` y `/api/comunidades/{id}`) conservan nombres en español. El resto de la API está en inglés.

## Errores

Los errores devuelven un código HTTP y un mensaje.

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos o faltantes, foto no válida, enlace de correo no válido, usado o caducado |
| 401 | Credenciales de acceso incorrectas |
| 403 | Cuenta sin verificar o desactivada, o sin permisos suficientes |
| 404 | Entidad no encontrada |
| 409 | Dato duplicado: correo, DNI, teléfono, NIF de comunidad o código de registro |
| 413 | Las fotos superan el límite (10 MB cada una, 50 MB en total) |
| 500 | Error interno |

Formato habitual de los mensajes: `Error: <descripción>`. El login y los accesos denegados devuelven un JSON con `error` y `mensaje`.

## Ejemplo: iniciar sesión y consultar el perfil

```bash
curl -X POST http://localhost:8080/user/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"laura.gomez@example.com","password":"Gescom@1234"}'

curl http://localhost:8080/user/auth/me \
  -H "Authorization: Bearer <token>"
```
