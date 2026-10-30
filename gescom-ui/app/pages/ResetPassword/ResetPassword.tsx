import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { resetPassword } from "~/api/auth";
import PasswordField from "~/components/form/PasswordField";
import { CenteredAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import Button, { ButtonLink } from "~/components/ui/Button";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import * as v from "~/utils/validation";

/** Destino del enlace del correo de "contraseña olvidada": /reset-password?token=... */
export default function ResetPassword() {
  useDocumentTitle("Nueva contraseña");
  const token = useSearchParams()[0].get("token");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const form = useForm<{ password: string }>({ password: "" }, (values) => ({ password: v.password(values.password) }));

  const onSubmit = async ({ password }: { password: string }) => {
    if (!token) return;
    setSending(true);
    setError("");
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSending(false);
    }
  };

  return (
    <CenteredAuthLayout>
      <h1 className="text-2xl font-bold text-brand-dark">Nueva contraseña</h1>
      {!token ? (
        <div className="mt-6 space-y-4">
          <Alert tone="error">El enlace no es válido. Pide uno nuevo desde «Recuperar acceso».</Alert>
          <Link to="/forgot-password" className="text-sm font-bold text-brand-green hover:underline">
            Recuperar acceso
          </Link>
        </div>
      ) : done ? (
        <div className="mt-6 space-y-5">
          <Alert tone="success">Contraseña actualizada. Ya puedes iniciar sesión.</Alert>
          <ButtonLink to="/login" fullWidth>
            Ir al inicio de sesión
          </ButtonLink>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <PasswordField label="Contraseña nueva" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...form.field("password")} />
          <Button type="submit" fullWidth disabled={sending}>
            {sending ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      )}
    </CenteredAuthLayout>
  );
}
