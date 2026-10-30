

# PRD --- GESCOM

## Sistema de Gestión de Incidencias y Mantenimiento Comunitario

> **Documento de requisitos de producto (PRD)**
>
> Basado en el documento **MVP Gescom** y estructurado siguiendo las
> recomendaciones de Atlassian para PRD ágiles.

------------------------------------------------------------------------

## 1. Especificaciones del proyecto

  -----------------------------------------------------------------------
  Campo                               Detalle
  ----------------------------------- -----------------------------------
  **Nombre del proyecto**             GESCOM

  **Producto**                        Sistema de Gestión de Incidencias y
                                      Mantenimiento Comunitario

  **Tipo**                            MVP

  **Duración indicada**               3 semanas

  **Inicio indicado**                 01/10

  **Final indicado**                  22/10

  **Objetivo de publicación**         Final del proyecto: 22/10

  **Prioridad principal**             Completar, como mínimo, las
                                      funcionalidades **Must Have**

  **Requisitos generales**            Diseño responsive, código
                                      organizado y comentado, estructura
                                      de base de datos
  -----------------------------------------------------------------------

### Participantes

El documento fuente no identifica personas concretas como Product Owner,
equipo de desarrollo o partes interesadas. Estos participantes deberán
definirse.

------------------------------------------------------------------------

## 2. Estado y objetivo del MVP

El objetivo del proyecto es disponer de un MVP funcional de GESCOM que
cubra como mínimo las funcionalidades clasificadas como **Must Have**.

El producto debe permitir gestionar usuarios, comunidades y su
estructura jerárquica, así como registrar y realizar el seguimiento de
incidencias en elementos comunes.

### Objetivo de producto

GESCOM proporcionará un sistema centralizado para la gestión de
incidencias y mantenimiento dentro de comunidades residenciales,
permitiendo que los usuarios autorizados registren incidencias y que las
personas responsables puedan gestionarlas mediante estados y plazos de
resolución.

------------------------------------------------------------------------

## 3. Contexto y problema

El alcance descrito en el documento fuente se centra en la gestión de
problemas dentro del entorno privado y comunitario, incluyendo ejemplos
como:

-   Averías en puertas de garaje.
-   Goteras en trasteros.
-   Fallos en ascensores.
-   Problemas de iluminación de portales.

El sistema debe organizar estas incidencias dentro de una estructura
comunitaria:

**Comunidad → Edificio/Bloque → Zona Común → Incidencia**

Además, las ubicaciones de los bloques residenciales deberán apoyarse en
tablas de provincias y municipios de España.

------------------------------------------------------------------------

## 4. Objetivos del producto

### Objetivos principales

1.  Disponer de autenticación y registro de usuarios.
2.  Gestionar diferentes roles de usuario.
3.  Permitir que cada usuario acceda a su información personal.
4.  Representar la estructura jerárquica de una comunidad.
5.  Permitir registrar incidencias en elementos comunes.
6.  Permitir adjuntar fotografías a las incidencias.
7.  Almacenar las fotografías mediante un servicio de almacenamiento
    definido para el proyecto.
8.  Gestionar el estado de cada incidencia.
9.  Establecer un plazo máximo de resolución.
10. Permitir añadir comentarios relacionados con la resolución de una
    incidencia.
11. Disponer de una interfaz responsive.
12. Mantener el código organizado y comentado.
13. Crear una estructura de base de datos adecuada para el MVP.

### Criterio general de éxito del MVP

El MVP se considerará funcional cuando las funcionalidades **Must Have**
puedan utilizarse de extremo a extremo dentro del sistema.

------------------------------------------------------------------------

## 5. Usuarios y roles

El sistema contempla los siguientes roles:

-   **Administrador Global**
-   **Administrador de Fincas**
-   **Presidente**
-   **Conserje (Opcional)**
-   **Usuario normal**

### Comportamiento esperado

Todos los roles utilizarán un login unificado.

Después de autenticarse correctamente, el sistema deberá redirigir al
usuario al dashboard correspondiente a su rol.

------------------------------------------------------------------------

# 6. Alcance funcional

## 6.1 Must Have --- MVP

Estas funcionalidades constituyen el alcance mínimo obligatorio del MVP.

### Épica 1 --- Usuarios, autenticación y perfiles

#### RF-01 --- Login unificado

El sistema debe proporcionar un único mecanismo de inicio de sesión para
los diferentes roles.

**Criterios de aceptación:**

-   El usuario puede iniciar sesión mediante sus credenciales.
-   El sistema identifica el rol del usuario.
-   El usuario es redirigido al dashboard correspondiente.
-   Un usuario no autenticado no puede acceder a las áreas protegidas.

#### RF-02 --- Registro de usuarios

El sistema debe permitir el registro de nuevos usuarios.

**Criterios de aceptación:**

-   El formulario solicita los datos necesarios.
-   Todos los campos de entrada son validados.
-   Los datos no válidos impiden completar el registro.

#### RF-03 --- Verificación de cuenta

La cuenta deberá verificarse mediante correo electrónico.

**Criterios de aceptación:**

-   Tras registrarse se envía un correo de confirmación.
-   La cuenta permanece sin validar hasta completar el proceso.
-   No se permite el acceso al sistema hasta validar la cuenta.

#### RF-04 --- Recuperación de contraseña

El usuario debe poder recuperar el acceso mediante correo electrónico.

El mecanismo previsto puede consistir en:

-   Una contraseña temporal; o
-   Un enlace de restablecimiento.

#### RF-05 --- Perfil de usuario

Todos los usuarios podrán visualizar y modificar sus datos personales
desde su perfil.

------------------------------------------------------------------------

## 6.2 Épica 2 --- Estructura comunitaria y localización

### RF-06 --- Estructura jerárquica

El sistema debe representar la siguiente relación:

``` text
Comunidad
└── Edificio / Bloque
    └── Zona Común
        └── Incidencia
```

El edificio/bloque puede no existir cuando la estructura de la comunidad
no lo requiera.

La comunidad tambien puede ser de Chalets en cuyo caso la Estructura sera de 
Comunidad / Chalets / Zona Comun / Incidencia

En cualquiera de los 2 casos la Incidencia puede ser tambien de un Piso 
(Edificio) o de un Chalet (Chalets) en caso que sean dentro de las viviendas
y corresponda a la Comunidad su reparación

### RF-07 --- Localización

El sistema debe disponer de tablas de:

-   Provincias de España.
-   Municipios de España.

Estas tablas se utilizarán para estandarizar la localización de los
bloques residenciales.

------------------------------------------------------------------------

## 6.3 Épica 3 --- Gestión de incidencias

### RF-08 --- Crear incidencia

El sistema debe permitir notificar problemas relacionados con elementos
comunes o con el entorno privado y comunitario.

Ejemplos contemplados en el alcance:

-   Puertas de garaje.
-   Trasteros.
-   Ascensores.
-   Iluminación de portales.

### RF-09 --- Adjuntar fotografías

Una incidencia debe poder incorporar fotografías.

El documento fuente contempla como alternativas de almacenamiento:

-   Cloudinary.
-   AWS S3.
-   Entorno local.

La decisión definitiva del proveedor de almacenamiento queda pendiente.

### RF-10 --- Estado de incidencia

Cada incidencia deberá disponer de un estado.

Estados definidos:

``` text
Pendiente
   ↓
En proceso
   ↓
Resuelto
```

### RF-11 --- Plazo máximo de resolución

Cada incidencia deberá disponer de un plazo máximo de resolución.

La duración concreta del plazo no está especificada en el documento
fuente y queda como decisión pendiente.

### RF-12 --- Comentario de resolución

La persona encargada de solucionar una incidencia podrá añadir uno o varios 
comentarios.

El documento contempla que esta persona pueda ser, por ejemplo:

-   Administrador.
-   Presidente.
-   Otra persona encargada de solucionarla. (Ej. Conserje)

------------------------------------------------------------------------

# 7. Historias de usuario

Siguiendo el enfoque de PRD ágil, las funcionalidades se expresan
también desde la perspectiva del usuario.

## US-01 --- Inicio de sesión

**Como** usuario de GESCOM,\
**quiero** iniciar sesión mediante un acceso unificado,\
**para** acceder al área correspondiente a mi rol.

### Criterios de aceptación

-   Las credenciales son validadas.
-   El rol del usuario es identificado.
-   Se muestra el dashboard correspondiente.
-   El acceso queda bloqueado para usuarios no autenticados.

------------------------------------------------------------------------

## US-02 --- Registro

**Como** nuevo usuario,\
**quiero** registrarme en GESCOM,\
**para** disponer de una cuenta en el sistema.

### Criterios de aceptación

-   El formulario valida los campos.
-   Los datos incorrectos generan errores.
-   Se inicia el proceso de verificación por correo.

------------------------------------------------------------------------

## US-03 --- Verificación

**Como** usuario registrado,\
**quiero** verificar mi cuenta mediante correo electrónico,\
**para** poder acceder al sistema.

### Criterios de aceptación

-   Recibo un correo de confirmación.
-   Mi cuenta no permite el acceso antes de ser validada.
-   Tras completar la verificación puedo iniciar sesión.

------------------------------------------------------------------------

## US-04 --- Recuperar contraseña

**Como** usuario,\
**quiero** recuperar mi contraseña mediante correo electrónico,\
**para** volver a acceder a mi cuenta si la he olvidado.

------------------------------------------------------------------------

## US-05 --- Gestionar perfil

**Como** usuario,\
**quiero** consultar y modificar mis datos personales,\
**para** mantener actualizada mi información.

------------------------------------------------------------------------

## US-06 --- Consultar la estructura comunitaria

**Como** usuario autorizado,\
**quiero** disponer de una estructura Comunidad → Edificio/Bloque → Zona
Común,\
**para** identificar dónde se encuentra una incidencia.

------------------------------------------------------------------------

## US-07 --- Registrar una incidencia

**Como** usuario,\
**quiero** notificar una incidencia en un elemento común,\
**para** que pueda ser gestionada.

### Criterios de aceptación

-   La incidencia queda asociada a la estructura comunitaria
    correspondiente.
-   Se puede incluir una fotografía.
-   La incidencia dispone de estado.
-   La incidencia dispone de un plazo máximo de resolución.
-   La incidencia tendrá comentarios de la/s personas autorizadas para 
    modificar su estado y prioridad con el objetivo de ir registrado
    los avances de la misma. Cada comentario deberá registrar la fecha del mismo


------------------------------------------------------------------------

## US-07.1-- Editar una incidencia

**Como** usuario, usarios habilitados para modificar su estado
**quiero** notificar una incidencia en un elemento común,\
**para** que pueda ser gestionada.

Los usuarios comunnes podrán editar una incidencia creada por ellos mismos,
solamente mientras el estado sea Pendiente.
No podrán editar NUNCA las incidencias de otros usuarios.
Los usuarios habilitados podrán modificar el estado y agregar comentarios
NO podrán editar los datos de la incidencia registrada por el usuario.


## US-08 --- Consultar el estado

**Como** usuario,\
**quiero** conocer el estado de una incidencia,\
**para** saber si está pendiente, en proceso o resuelta.
Cualquier usuario podra acceder al panel de incidencias de la Comunidad

------------------------------------------------------------------------

## US-09 --- Gestionar una incidencia

**Como** persona encargada de solucionar una incidencia,\ Pueden ser 
El presidente , el administrador o el conserje
**quiero** actualizar su estado y añadir un comentario,\
**para** informar de la evolución o resolución del problema.

------------------------------------------------------------------------

## US-09.1 --- Visualización de las incidencias

**Como** usuario \ Cualquier usuario podrá acceder al panel de las incidencias
de la comunidad 
**quiero** Si soy perfil autorizado para cambiar su estado y prioridad
podré actualizarlos y añadir un comentario,\
**para** informar de la evolución o resolución del problema o Si soy usuario 
normal para ver el estado de las incidencias de la comunidad

------------------------------------------------------------------------

# 8. Should Have (ESTO NO SE VA A DESARROLLAR)

Las siguientes funcionalidades forman parte del alcance deseable, pero
no del mínimo obligatorio del MVP.

## SH-01 --- Geolocalización

Permitir geolocalización opcional o seleccionada mediante mapas
interactivos utilizando Leaflet para ubicar elementos de la finca.

## SH-02 --- Votaciones vecinales

Permitir votaciones o apoyos internos para priorizar incidencias que
requieran atención urgente.

## SH-03 --- Gestión de zonas comunes y reservas

Gestionar espacios compartidos como:

-   Piscina.
-   Pistas deportivas.
-   Barbacoa.
-   Salas comunitarias.

### Calendario

Se contempla un calendario interactivo en para mostrar:

-   Franjas horarias.
-   Disponibilidad.

### Restricciones

Ejemplo indicado en el documento:

> Límite de horas máximas de reserva a la semana por apartamento o
> vecino.

## SH-04 --- Tablón de anuncios

Digitalizar el tablón de anuncios del portal.

## SH-05 --- Gestión documental

Permitir subir y gestionar documentos PDF como:

-   Actas de juntas aprobadas.
-   Presupuestos anuales.
-   Convocatorias oficiales.

### Control de acceso

Los documentos deberán ser visibles únicamente para los propietarios
acreditados de la comunidad correspondiente.

------------------------------------------------------------------------

# 9. Could Have (ESTO NO SE VA A DESARROLLAR)

Estas funcionalidades se contemplan como futuras ampliaciones y no
forman parte del MVP mínimo.

## CH-01 --- Reuniones virtuales

Integración con una API de videoconferencia gratuita, por ejemplo Jitsi
Meet API, para:

-   Asambleas de vecinos.
-   Juntas directivas.
-   Reuniones a distancia.

## CH-02 --- Chat integrado

Módulo de mensajería o chat en tiempo real asociado a la sala de
reuniones o junta directiva.

Podría utilizarse para:

-   Comunicación entre asistentes.
-   Votación de puntos del orden del día.

## CH-03 --- Pasarela de pagos

Integración con Stripe para:

-   Pago automatizado de cuotas ordinarias.
-   Pago de derramas extraordinarias.
-   Consulta del estado de pagos.
-   Consulta del historial de transacciones.

El administrador podrá consultar el estado de pago de cada propietario:

``` text
Al corriente
Pendiente
```

------------------------------------------------------------------------

# 10. Fuera de alcance del MVP

Para mantener el foco en el objetivo de tres semanas, las
funcionalidades **Should Have** y **Could Have** no deben bloquear la
entrega del MVP **Must Have**.

Quedan, por tanto, fuera del alcance mínimo:

-   Geolocalización mediante mapas.
-   Votaciones vecinales.
-   Reservas de zonas comunes.
-   Calendario de reservas.
-   Tablón digital.
-   Gestión documental.
-   Videoconferencias.
-   Chat en tiempo real.
-   Pagos mediante Stripe.

Estas funcionalidades podrán formar parte de futuras iteraciones.

------------------------------------------------------------------------

# 11. Diseño e interacción

## Requisito responsive

La aplicación deberá contar con **diseño responsive**.

El documento fuente no define todavía:

-   Breakpoints.
-   Diseño visual.
-   Sistema de componentes.
-   Tipografía.
-   Colores.
-   Wireframes.
-   Navegación detallada.

Estos elementos deberán definirse durante la fase de diseño.

## Dashboards

Debe existir un dashboard correspondiente a cada rol:

-   Administrador Global.
-   Administrador de Fincas.
-   Usuario normal.

El contenido exacto de cada dashboard no está especificado en el
documento fuente.

------------------------------------------------------------------------

# 12. Modelo conceptual de datos

A partir de los requisitos del documento, el modelo conceptual mínimo
deberá contemplar entidades equivalentes a:

``` text
Usuario
 ├── Rol
 └── Perfil

Comunidad
 └── Edificio/Bloque
      └── Zona Común
           └── Incidencia
                ├── Estado
                ├── Plazo de resolución
                ├── Comentario
                └── Fotografía

Ubicación
 ├── Provincia
 └── Municipio
```

### Nota

Este modelo es una representación conceptual derivada exclusivamente de
las relaciones descritas en el MVP. La estructura física definitiva de
la base de datos deberá ser definida por el equipo técnico.

------------------------------------------------------------------------

# 13. Requisitos no funcionales

## RNF-01 --- Responsive

La aplicación debe adaptarse a diferentes tamaños de pantalla.

## RNF-02 --- Código

El código debe mantenerse:

-   Organizado.
-   Comentado.

## RNF-03 --- Base de datos

Debe existir una estructura de base de datos que soporte las
funcionalidades del MVP.

## RNF-04 --- Seguridad de acceso

Las funcionalidades que requieran autenticación deberán estar protegidas
frente al acceso de usuarios no autenticados.

## RNF-05 --- Control de acceso

Las funcionalidades y datos deberán respetar el rol del usuario y,
cuando corresponda, la pertenencia a una comunidad.

> El PDF especifica expresamente un control de acceso estricto para los
> documentos del tablón de anuncios, pero no detalla todavía una matriz
> completa de permisos para todos los módulos. Esta matriz debe
> definirse.

------------------------------------------------------------------------

# 14. Supuestos

Los siguientes puntos se consideran supuestos o decisiones que necesitan
validación:

1.  Existirán los siguientes roles principales.
    Superadmin, Admin, Presidente, Conserje, Usuario
2.  Todos los roles compartirán el mecanismo de login.
3.  La verificación por correo será obligatoria.
4.  Las incidencias tendrán los estados Pendiente, En proceso y
    Resuelto.
5.  Las incidencias podrán incluir fotografías.
6.  El almacenamiento de fotografías será mediante Cloudinary, AWS S3 o
    almacenamiento local, pendiente de decisión.
7.  Las provincias y municipios se gestionarán mediante tablas
    normalizadas.
8.  El sistema será responsive.
9.  El plazo máximo de resolución será obligatorio, aunque su duración
    concreta está pendiente de definir.
10. La persona encargada de resolver una incidencia podrá añadir
    comentarios.

------------------------------------------------------------------------

# 15. Preguntas abiertas

  -----------------------------------------------------------------------
  ID                      Pregunta                Impacto
  ----------------------- ----------------------- -----------------------
  Q-01                    ¿Qué campos exactos     Alto
                          debe contener el        
                          registro de usuario?    

  Q-02                    ¿Qué datos son          Alto
                          obligatorios en una     
                          incidencia?             

  Q-03                    ¿Quién puede crear      Alto
                          incidencias?            

  Q-04                    ¿Quién puede modificar  Alto
                          el estado de una        
                          incidencia?             

  Q-05                    ¿Quién establece el     Alto
                          plazo máximo de         
                          resolución?             

  Q-06                    ¿Cuál es el plazo       Alto
                          máximo concreto?        

  Q-07                    ¿Quién puede visualizar Alto
                          cada incidencia?        

  Q-08                    ¿Quién puede añadir     Medio
                          comentarios?            

  Q-09                    ¿Qué permisos concretos Alto
                          tiene cada rol?         

  Q-10                    ¿Qué contenido debe     Medio
                          mostrar cada dashboard? 

  Q-11                    ¿Qué proveedor se       Medio
                          utilizará para las      
                          fotografías?            

  Q-12                    ¿Cuál será el           Medio
                          tamaño/formato máximo   
                          de las fotografías?     

  Q-13                    ¿Puede una comunidad    Medio
                          tener varios            
                          edificios/bloques?      

  Q-14                    ¿Puede una incidencia   Medio
                          pertenecer a más de una 
                          zona común?             

  Q-15                    ¿Cómo se asignará una   Alto
                          incidencia a la persona 
                          encargada?              

  Q-16                    ¿Qué ocurre cuando se   Alto
                          supera el plazo de      
                          resolución?             

  Q-17                    ¿Qué notificaciones     Medio
                          debe recibir el         
                          usuario?                

  Q-18                    ¿Qué estados            Bajo
                          adicionales podrían     
                          necesitarse en el       
                          futuro?                 

  Q-19                    ¿Qué proveedor de       Medio
                          correo electrónico se   
                          utilizará?              

  Q-20                    ¿Qué política de        Alto
                          seguridad y caducidad   
                          tendrán los enlaces de  
                          recuperación?           
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 16. Matriz de prioridad

  -----------------------------------------------------------------------
  Funcionalidad                       Prioridad
  ----------------------------------- -----------------------------------
  Usuarios y roles                    **Must Have**

  Login unificado                     **Must Have**

  Registro                            **Must Have**

  Validación de campos                **Must Have**

  Verificación por correo             **Must Have**

  Recuperación de contraseña          **Must Have**

  Perfil de usuario                   **Must Have**

  Estructura Comunidad →              **Must Have**
  Edificio/Bloque → Zona Común →      
  Incidencia                          

  Provincias y municipios             **Must Have**

  Registro de incidencias             **Must Have**

  Fotografías                         **Must Have**

  Estados de incidencia               **Must Have**

  Plazo máximo de resolución          **Must Have**

  Comentarios de resolución           **Must Have**

  Responsive                          **Must Have**

  Código organizado y comentado       **Must Have**

  Estructura de base de datos         **Must Have**

  Geolocalización                     **Should Have**

  Votaciones vecinales                **Should Have**

  Reservas de zonas comunes           **Should Have**

  Calendario                          **Should Have**

  Tablón de anuncios                  **Should Have**

  Gestión de PDFs                     **Should Have**

  Videoconferencia                    **Could Have**

  Chat                                **Could Have**

  Stripe                              **Could Have**
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 17. Plan de entrega del MVP

El documento fuente establece una duración de tres semanas, con inicio
el 01/10 y final el 22/10.

La planificación detallada por sprint o semana no está definida en el
documento original.

Como criterio de priorización:

1.  **Primero:** arquitectura, base de datos y autenticación.
2.  **Después:** estructura comunitaria y perfiles.
3.  **Después:** creación y gestión de incidencias.
4.  **Finalmente:** validación integral del flujo Must Have, responsive
    y calidad del código.

Esta secuencia es una propuesta de organización y deberá validarse con
el equipo.

------------------------------------------------------------------------

# 18. Definición de terminado del MVP

El MVP podrá considerarse preparado para entrega cuando:

-   [ ] Los roles estén disponibles.
-   [ ] El login unificado funcione.
-   [ ] El registro valide los datos.
-   [ ] La verificación por correo funcione.
-   [ ] La recuperación de contraseña funcione.
-   [ ] Los usuarios puedan consultar y modificar su perfil.
-   [ ] La estructura comunitaria esté implementada.
-   [ ] Provincias y municipios estén disponibles.
-   [ ] Se puedan crear incidencias.
-   [ ] Se puedan adjuntar fotografías.
-   [ ] Las incidencias dispongan de los tres estados definidos.
-   [ ] Se pueda establecer el plazo máximo de resolución.
-   [ ] Se puedan añadir comentarios de resolución.
-   [ ] La interfaz sea responsive.
-   [ ] El código esté organizado y comentado.
-   [ ] La base de datos soporte las funcionalidades anteriores.

------------------------------------------------------------------------

