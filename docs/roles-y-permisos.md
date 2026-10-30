# Roles y permisos

Gescom distingue entre el **tipo de usuario** y el **cargo** que ocupa en cada comunidad.

## Tipo de usuario

| Código | Tipo |
|---|---|
| 1 | Superadministrador |
| 2 | Usuario |

Los usuarios pueden ser además propietarios (`resident_type` = 1) o inquilinos (`resident_type` = 2). Solo el superadministrador puede cambiar el tipo de un usuario.

## Cargos por comunidad

Un usuario puede ocupar un cargo en una comunidad concreta:

| Cargo | Tabla |
|---|---|
| Administrador | `communities_administrators` |
| Presidente | `communities_presidents` |
| Conserje | `communities_caretakers` |

Reglas:

- Un usuario tiene **un solo cargo por comunidad**.
- Cada cargo tiene fecha de inicio y, opcionalmente, de fin. Sin fecha de fin, es el titular actual.
- Al asignar un cargo, se **cierra el del titular anterior**.
- Administrador y conserje pueden no vivir en la comunidad, por lo que su vivienda es opcional («gestión externa»).

## Quién puede hacer qué

En la API se usan tres niveles:

- **Superadmin:** el superadministrador.
- **Gestor:** superadministrador, administrador, presidente o conserje de la comunidad.
- **Miembro:** cualquier usuario que pertenece a la comunidad.

| Acción | Superadmin | Gestor | Miembro |
|---|:-:|:-:|:-:|
| Crear y eliminar comunidades | ✔ | | |
| Editar una comunidad | ✔ | ✔ | |
| Listar todos los usuarios, crear usuarios | ✔ | | |
| Dar de alta un usuario en una comunidad | ✔ | ✔ | |
| Asignar o cambiar cargos | ✔ | ✔ | |
| Ver usuarios e incidencias de la comunidad | ✔ | ✔ | ✔ |
| Crear incidencias a nombre propio | ✔ | ✔ | ✔ |
| Reportar una incidencia en nombre de otro | ✔ | | |
| Comentar una incidencia | ✔ | ✔ | ✔ |
| Cambiar estado y prioridad, eliminar incidencias | ✔ | ✔ | |
| Editar un usuario | ✔ | ✔ | Solo el suyo |
| Cambiar contraseña y foto de perfil | ✔ | | Solo la suya |

> La interfaz es más restrictiva que la API: las pantallas de alta y edición de usuarios y de cambio de cargo solo se muestran al superadministrador.

## Registro y asignación

1. Un vecino se registra con un **formulario único**, a través de la URL de su comunidad (`/register/<código>`). Queda vinculado a esa comunidad.
2. Verifica su correo con el enlace que recibe.
3. El superadministrador le asigna un cargo si corresponde, desde **Usuarios → Cambiar cargo**.

También puede ser el superadministrador quien cree el usuario directamente. En ese caso el usuario recibe un correo de bienvenida con un enlace para elegir su contraseña.

## Vínculo entre usuario y vivienda

No hay una clave foránea entre usuarios y viviendas: el vínculo se establece por coincidencia del texto de la dirección. Solo se usa para mostrar la columna «Vivienda» en el listado de usuarios. El superadministrador puede ajustarlo con **Usuarios → Editar → Vivienda**. Las incidencias tienen su propio `property_id`.
