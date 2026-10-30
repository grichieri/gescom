# Microservicio de correo

Gescom envía correos en tres situaciones. El envío lo hace un microservicio independiente (`gescom-mail-service`) que recibe los pedidos a través de RabbitMQ.

## Tipos de correo

| Tipo | Cuándo se envía | Clave de enrutado |
|---|---|---|
| Verificación | Un usuario se registra y debe confirmar su correo | `verification` |
| Recuperación de contraseña | Un usuario pulsa «¿Olvidaste tu contraseña?» | `password-reset` |
| Bienvenida | Un superadministrador da de alta a un usuario; el correo incluye un enlace para que elija su contraseña | `welcome` |

## Flujo

```
Back (Spring Boot)
   │  publica un mensaje (no espera respuesta)
   ▼
RabbitMQ  ── exchange: gescom.mail ──► cola: gescom.mail.<clave>
                                          │
                                          ▼
                                 MailListener
                                          │
                                  MailService
                                          │
                                TemplateRenderer  (plantilla del correo)
                                          │
                                  JavaMailSender ──► servidor SMTP
```

1. El backend crea un token (si procede) y publica un mensaje en el exchange `gescom.mail` con la clave de enrutado correspondiente.
2. El mensaje llega a la cola `gescom.mail.<clave>`.
3. El microservicio lo consume, genera el cuerpo del correo con una plantilla y lo envía por SMTP.
4. El backend **no recibe confirmación** ni guarda el estado de entrega.

## Colas

| Elemento | Nombre |
|---|---|
| Exchange | `gescom.mail` |
| Colas | `gescom.mail.verification`, `gescom.mail.password-reset`, `gescom.mail.welcome` |
| Exchange de mensajes muertos | `gescom.mail.dlx` |
| Cola de mensajes muertos | `gescom.mail.dead` |

## Reintentos

Si el envío falla, el microservicio reintenta hasta **4 veces** con espera creciente: 5 segundos la primera vez, multiplicada por 3 en cada intento, con un máximo de 2 minutos. Agotados los intentos, el mensaje pasa a `gescom.mail.dead`, donde se puede inspeccionar desde la consola de RabbitMQ (puerto 15672).

## Tokens

Los enlaces de los correos llevan un token que el backend guarda en la tabla `verification_tokens`.

- 32 bytes aleatorios en hexadecimal (64 caracteres).
- Caducan a las **24 horas**.
- Son de **un solo uso**.
- Tipos: `EMAIL_VERIFICATION` (`type` = 1 en la tabla) y `PASSWORD_RESET` (`type` = 2). El correo de bienvenida reutiliza `PASSWORD_RESET`.

## Endpoints implicados

| Endpoint | Efecto |
|---|---|
| `POST /api/register/{uuid}` | Registra un usuario y envía el correo de verificación |
| `POST /user/auth/verify-email` | Verifica el correo con el token |
| `POST /user/auth/forgot-password` | Solicita la recuperación y envía el correo |
| `POST /user/auth/reset-password` | Establece la nueva contraseña con el token |
| `POST /api/communities/{id}/users` | Alta de usuario por el superadministrador; envía el correo de bienvenida |

## Configuración

### Backend

| Variable | Descripción | Por defecto |
|---|---|---|
| `MAIL_ENABLED` | Activa la publicación de mensajes | `false` |
| `FRONT_URL` | URL pública del front, usada en los enlaces de los correos | `http://localhost:3000` |

### Microservicio

| Variable | Descripción | Por defecto |
|---|---|---|
| `SMTP_HOST` | Servidor SMTP | `mailpit` |
| `SMTP_PORT` | Puerto SMTP | `1025` |
| `SMTP_AUTH` | Autenticación SMTP | `false` |
| `SMTP_STARTTLS` | STARTTLS | `false` |
| `SMTP_USER` / `SMTP_PASSWORD` | Credenciales SMTP | vacío |
| `MAIL_FROM` | Remitente | `no-reply@gescom.local` |
| `MAIL_FROM_NAME` | Nombre del remitente | `Gescom` |
| `MAIL_APP_NAME` | Nombre de la aplicación en las plantillas | `Gescom` |

En desarrollo los correos llegan a Mailpit (http://localhost:8025). Para usar un servidor real, define las variables `SMTP_*` en el `.env`.

## Comprobar que funciona

1. Levanta el sistema en modo con correo (ver [despliegue.md](despliegue.md)).
2. Registra un usuario o crea uno desde la cuenta de superadministrador.
3. Abre Mailpit: el mensaje debe aparecer en segundos.
4. Si no llega, revisa la consola de RabbitMQ: un mensaje en `gescom.mail.dead` indica que el envío falló tras los reintentos.

## Limitaciones conocidas

- El backend no guarda el estado de entrega de los correos.
- No hay aún un correo de aviso al administrador cuando se crea una incidencia.
