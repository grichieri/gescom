# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.

## Login con token (connectionBack_V3)

- `POST /user/auth/login` → `{ mensaje, token }`. El token se guarda en `localStorage` (`gescom-token`) y se envía en
  `Authorization: Bearer <token>` en todas las llamadas (`app/api/client.ts`).
- Quién es el usuario y su cargo en cada comunidad: `GET /user/auth/me` → `{ user, communities: [{ communityId, name, role, roleStartDate, roleEndDate }] }`
  (`app/api/auth.ts`). Si el back aún no tiene esa ruta (404/405), el front la reconstruye con `/api/users`,
  `/api/communities` y `/api/communities/{id}/users` (solución temporal).
- Un 401 fuera del login borra la sesión y lleva al login con el aviso "Tu sesión ha caducado".
- Comunidades, propiedades y usuarios siguen leyéndose en local; la identidad del login se vuelca al almacén local.
- El front debe abrirse en `http://localhost:5173` (CORS del back).

## Registro y correo: pantallas según el interruptor del back

El back tiene un interruptor (`MAIL_ENABLED`, por defecto `false`). El front no lo configura: lo averigua con la respuesta de
`POST /api/register/{code}` (`emailVerificationRequired`).

| Modo del back | Tras registrarse | Texto |
| --- | --- | --- |
| `MAIL_ENABLED=false` | `/account-activated?created=1` | "Cuenta creada. Ya puedes iniciar sesión." |
| `MAIL_ENABLED=true` | `/verify-email/:email` | "¡Casi listo!" + reenviar correo (`/user/auth/resend-verification`) |

- El enlace del correo lleva a `/account-activated?token=...`: se llama a `POST /user/auth/verify-email` y se muestra
  "Correo verificado. Ya puedes iniciar sesión." (o el error del back si el enlace caducó).
- `/forgot-password` llama a `/user/auth/forgot-password`; si el back responde `emailEnabled: false` avisa de que no se ha enviado nada.
- `/reset-password?token=...` llama a `/user/auth/reset-password`.
- El registro con enlace (`/register/<código>`) pregunta el nombre de la comunidad a `GET /api/register/{code}`.
- Rutas públicas (sin token): login, verify-email, resend-verification, forgot-password, reset-password y `/api/register/*`.

## Foto de perfil

- La foto se elige en el navegador, se reduce a 256 px y se sube con `POST /api/users/{id}/avatar` (multipart, parte `avatar`). El back guarda el archivo y devuelve el usuario con `avatar: "/upload/avatares/..."`; el front la pinta con `API_URL + avatar`.
- **Registro propio (sin sesión):** la ruta de avatar pide token, así que la foto queda guardada en el navegador (`gescom-pending-avatar:<correo>`) y se sube sola en el primer login.
- **Perfil / alta o edición de un usuario con sesión:** se sube al guardar (el alta de otro usuario solo funciona si quien la hace es superadmin o el propio usuario).
