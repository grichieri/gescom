# gescom-mail-service

Microservicio de correo de Gescom. **Solo trabaja cuando el back lo pide**: el back tiene un interruptor (`MAIL_ENABLED`); con `false` no publica nada y este servicio no hace falta, con `true` publica un mensaje por correo y este servicio lo envía. Escucha colas de RabbitMQ y envía los correos (verificación de cuenta, restablecer contraseña, bienvenida a un usuario creado por un administrador). No tiene base de datos ni rutas HTTP (solo `/actuator/health`): el back genera y guarda los tokens, y publica un mensaje; este servicio compone y entrega el correo.

Spring Boot 3.4.5, Java 25, Gradle: las mismas versiones que el back.

## Arranque rápido (Docker)

```bash
cp .env.example .env
docker compose up -d --build
```

- RabbitMQ (panel): http://localhost:15672 (usuario y clave de `.env`)
- Mailpit (bandeja de pruebas): http://localhost:8025 — aquí aparecen los correos; no sale ninguno a Internet.
- Salud del microservicio: http://localhost:8081/actuator/health

Si el back ya levanta su RabbitMQ, no arranques el de este compose: `docker compose up -d --build mail-service mailpit` y apunta `RABBITMQ_HOST` al del back.

## Arranque sin Docker

Requiere Java 25, un RabbitMQ y un servidor SMTP (por ejemplo Mailpit en el puerto 1025).

```bash
./gradlew bootRun
./gradlew test
```

## Mensajes

Exchange `gescom.mail` (direct, durable). Un mensaje JSON por correo, con la cabecera `content_type: application/json`.

| Routing key | Cola | Campos del JSON |
|---|---|---|
| `verification` | `gescom.mail.verification` | `to`, `name`, `verificationUrl`, `expiresInHours` (opcional) |
| `password-reset` | `gescom.mail.password-reset` | `to`, `name`, `resetUrl`, `expiresInHours` (opcional) |
| `welcome` | `gescom.mail.welcome` | `to`, `name`, `communityName`, `setPasswordUrl`, `expiresInHours` (opcional) |

Ejemplo (`verification`):

```json
{"to":"ana@ejemplo.com","name":"Ana","verificationUrl":"http://localhost:5173/account-activated?token=abc","expiresInHours":24}
```

### Fallos

- Mensaje no válido (faltan campos, correo mal escrito, enlace que no es http/https): se rechaza y va directo a `gescom.mail.dead`.
- Fallo al enviar (SMTP caído): 4 intentos con espera creciente (5 s, 15 s, 45 s); si todos fallan, el mensaje va a `gescom.mail.dead`.
- `gescom.mail.dead` se revisa desde el panel de RabbitMQ (*Queues → gescom.mail.dead → Get messages*).

### Probar sin el back

En el panel de RabbitMQ: *Exchanges → gescom.mail → Publish message*. Pon la *Routing key* (`verification`), en *Properties* `content_type=application/json` y el JSON en *Payload*. El correo aparece en Mailpit.

## Configuración (variables de entorno)

| Variable | Por defecto | Uso |
|---|---|---|
| `RABBITMQ_HOST`, `RABBITMQ_PORT`, `RABBITMQ_USER`, `RABBITMQ_PASSWORD` | `localhost`, `5672`, `gescom_user_rabbit`, `gescom_password_rabbit` | conexión a RabbitMQ (mismos nombres que el back) |
| `MAIL_FROM`, `MAIL_FROM_NAME`, `MAIL_APP_NAME` | `no-reply@gescom.local`, `Gescom`, `Gescom` | remitente y nombre en los correos |
| `SMTP_HOST`, `SMTP_PORT` | `localhost`, `1025` | servidor SMTP |
| `SMTP_AUTH`, `SMTP_STARTTLS`, `SMTP_USER`, `SMTP_PASSWORD` | `false`, `false`, vacío, vacío | para un SMTP real |
| `SERVER_PORT` | `8081` | puerto HTTP (solo salud) |

## Del servidor de pruebas (Mailpit) a un correo real (Gmail u otro)

Este servicio no sabe si habla con un SMTP de pruebas o con uno real: todo se decide con variables de entorno, sin tocar código.

- **Mailpit (por defecto, desarrollo y demo):** guarda los correos y los enseña en http://localhost:8025. No entrega nada fuera, aunque el destinatario sea una cuenta real de Gmail.
- **Gmail:** cuenta dedicada (por ejemplo `gescom.proyecto@gmail.com`), con verificación en dos pasos y una *contraseña de aplicación* de 16 caracteres (Cuenta de Google → Seguridad → Contraseñas de aplicaciones). Variables:

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_AUTH=true
SMTP_STARTTLS=true
SMTP_USER=gescom.proyecto@gmail.com
SMTP_PASSWORD=<contraseña de aplicación>
MAIL_FROM=gescom.proyecto@gmail.com
```

  Gmail firma siempre con la cuenta con la que te identificas, así que `MAIL_FROM` debe ser esa misma dirección. Límite de unos cientos de correos al día; los primeros pueden caer en spam. La contraseña va solo en `.env` o en el entorno, nunca en el repositorio.
- **Producción:** un proveedor transaccional (Brevo, Mailgun, SendGrid...) o el SMTP del centro, con un dominio propio y los registros SPF/DKIM. Se configura con las mismas variables.

## Plantillas

`src/main/resources/templates/email/`: `layout.html` (diseño común) y, por cada correo, `<nombre>.html` y `<nombre>.txt`. Se rellenan con `{{variable}}` (escapado) y `{{{variable}}}` (sin escapar, solo para el contenido del diseño).

## Cómo conectar el back

El back de Gescom ya publica estos mensajes (clases `MailNotificationService`, `RabbitMailConfig` y `dto/mail/*`). Para usarlo: arrancar este servicio y el back con `MAIL_ENABLED=true`. En el repositorio del back, `compose.mail.yaml` levanta este servicio y Mailpit junto al RabbitMQ que ya trae su `compose.yaml`.

Los enlaces de los correos apuntan al front: `/account-activated?token=...` (verificación), `/reset-password?token=...` (restablecer o definir contraseña).

Más detalle:

Ver el documento "Gescom: microservicio de correo con RabbitMQ y cómo conectarlo con el back (V2)".
