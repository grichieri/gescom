import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  index("pages/Home/Home.tsx"),

  // Pantallas públicas (sin sesión)
  route("login", "pages/Login/Login.tsx"),
  route("register/:code?", "pages/Register/Register.tsx"),
  route("demo-registro", "pages/DemoRegistro/DemoRegistro.tsx"), // solo para la presentación (guion de mensajes, sin back)
  route("verify-email/:email", "pages/VerifyEmail/VerifyEmail.tsx"),
  route("account-activated", "pages/AccountActivated/AccountActivated.tsx"),
  route("forgot-password", "pages/ForgotPassword/ForgotPassword.tsx"),
  route("reset-password", "pages/ResetPassword/ResetPassword.tsx"),

  // Pantallas internas: comparten el menú lateral y exigen sesión
  layout("components/layout/AppLayout.tsx", [
    route("dashboard", "pages/Dashboard/Dashboard.tsx"),

    route("communities", "pages/CommunitySelector/CommunitySelector.tsx"),
    route("communities/new", "pages/NewCommunity/NewCommunity.tsx", { id: "community-new" }),
    route("communities/:id/edit", "pages/NewCommunity/NewCommunity.tsx", { id: "community-edit" }),
    route("communities/:id/properties/new", "pages/NewProperty/NewProperty.tsx"),
    route("communities/:id", "pages/CommunityDetail/CommunityDetail.tsx"),

    route("incidences", "pages/Incidences/Incidences.tsx"),
    route("incidences/new", "pages/NewIncidence/NewIncidence.tsx"),
    route("incidences/:id", "pages/IncidenceDetail/IncidenceDetail.tsx"),

    route("users", "pages/Users/Users.tsx"),
    route("users/new", "pages/NewUser/NewUser.tsx", { id: "user-new" }),
    route("users/:userId/edit", "pages/NewUser/NewUser.tsx", { id: "user-edit" }),

    route("profile", "pages/Profile/Profile.tsx"),
  ]),
] satisfies RouteConfig;
