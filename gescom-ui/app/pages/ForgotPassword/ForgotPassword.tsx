import { useState } from "react";
import { Link } from "react-router";
import { forgotPassword } from "~/api/auth";
import { CenteredAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import Button, { ButtonLink } from "~/components/ui/Button";
import TextField from "~/components/form/TextField";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import * as v from "~/utils/validation";

export default function ForgotPassword() {
  useDocumentTitle("Recuperar acceso");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [mailOff, setMailOff] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const form = useForm<{ email: string }>({ email: "" }, (values) => ({ email: v.email(values.email) }));

  const onSubmit = async ({ email }: { email: string }) => {
    setSending(true);
    setError("");
    try {
      const res = await forgotPassword(email.trim());
      setMailOff(res?.emailEnabled === false);
      setSentTo(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo enviar la solicitud.");
    } finally {
      setSending(false);
    }
  };

  return (
    <CenteredAuthLayout>
      <h1 className="text-2xl font-bold text-brand-dark">Recuperar acceso</h1>
      {sentTo ? (
        <div className="mt-6 space-y-5">
          {mailOff ? (
            <Alert tone="info">
              El envío de correos no está activado en este entorno, así que no se ha enviado nada. Pide a tu administrador que
              restablezca tu contraseña.
            </Alert>
          ) : (
            <Alert tone="success">
              Si <strong>{sentTo}</strong> corresponde a una cuenta de GESCOM, recibirás un correo con las instrucciones para
              restablecer tu contraseña.
            </Alert>
          )}
          <ButtonLink to="/login" fullWidth>
            Volver al inicio
          </ButtonLink>
        </div>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-500">Te enviaremos las instrucciones para restablecer tu contraseña.</p>
          {/* No se comprueba si el correo existe: así no se revela qué cuentas hay registradas */}
          <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
            <TextField label="Correo electrónico" type="email" placeholder="nombre@ejemplo.com" autoComplete="email" {...form.field("email")} />
            {error && <Alert tone="error">{error}</Alert>}
            <Button type="submit" fullWidth disabled={sending}>
              {sending ? "Enviando…" : "Enviar instrucciones"}
            </Button>
            <p className="text-center text-sm">
              <Link to="/login" className="font-bold text-brand-green hover:underline">
                Volver al inicio
              </Link>
            </p>
          </form>
        </>
      )}
    </CenteredAuthLayout>
  );
}
