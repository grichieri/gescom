import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { SplitAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import CheckboxField from "~/components/form/CheckboxField";
import PasswordField from "~/components/form/PasswordField";
import TextField from "~/components/form/TextField";
import { takeNotice } from "~/api/client";
import { useAuth } from "~/hooks/useAuth";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import { useLocalStorage } from "~/hooks/useLocalStorage";
import * as v from "~/utils/validation";
import heroImage from "~/assets/hero-login.jpg";

type LoginValues = { email: string; password: string; remember: boolean };

export default function Login() {
  useDocumentTitle("Iniciar sesión");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [notice] = useState(takeNotice);
  const [sending, setSending] = useState(false);
  // "Recordarme en este equipo": se guarda solo el correo y se rellena al volver a abrir la pantalla
  const [rememberedEmail, setRememberedEmail] = useLocalStorage<string>("gescom-remembered-email", "");

  const form = useForm<LoginValues>({ email: rememberedEmail, password: "", remember: rememberedEmail !== "" }, (values) => ({
    email: v.email(values.email),
    password: values.password === "" ? "La contraseña es obligatoria" : "",
  }));

  const onSubmit = async ({ email, password, remember }: LoginValues) => {
    setError("");
    setSending(true);
    const result = await login(email, password);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRememberedEmail(remember ? email : "");
    navigate(result.needsCommunity ? "/communities" : "/dashboard", { replace: true });
  };

  return (
    <SplitAuthLayout
      image={heroImage}
      headline="Gestiona tu comunidad de forma inteligente."
      text="La plataforma definitiva para la gestión de incidencias y convivencia en tu edificio."
      aside={
        <blockquote className="border-l-2 border-brand-light pl-4 text-sm italic text-gray-200">
          “Desde que usamos Gescom, la comunicación con la administración es instantánea y transparente.”
        </blockquote>
      }
    >
      <h2 className="text-3xl font-bold text-brand-dark">Bienvenido</h2>
      <p className="mt-1 text-gray-500">Accede a la gestión de tu comunidad</p>

      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        {notice && !error && <Alert tone="info">{notice}</Alert>}
        {error && <Alert tone="error">{error}</Alert>}
        <TextField
          label="Correo electrónico"
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          {...form.field("email")}
        />
        <PasswordField
          label="Contraseña"
          placeholder="••••••••"
          autoComplete="current-password"
          labelAction={
            <Link to="/forgot-password" className="font-bold text-brand-green hover:underline">
              ¿La olvidaste?
            </Link>
          }
          {...form.field("password")}
        />
        <CheckboxField label="Recordarme en este equipo" {...form.checkbox("remember")} />
        <Button type="submit" fullWidth disabled={sending}>
          {sending ? "Entrando..." : "Iniciar sesión"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-gray-500">
        ¿Eres nuevo en esta comunidad?{" "}
        <Link to="/register" className="font-bold text-brand-green hover:underline">
          Solicitar registro
        </Link>
      </p>

    </SplitAuthLayout>
  );
}
