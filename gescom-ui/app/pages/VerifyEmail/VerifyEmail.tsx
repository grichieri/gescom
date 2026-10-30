import { useState } from "react";
import { useParams } from "react-router";
import { CenteredAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import Button, { ButtonLink } from "~/components/ui/Button";
import Icon from "~/components/ui/Icon";
import { resendVerification } from "~/api/auth";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

export default function VerifyEmail() {
  useDocumentTitle("Verificación de cuenta");
  const email = useParams().email ?? ""; // ya viene decodificado de la URL /verify-email/:email
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Esta pantalla solo se ve con el correo activado en el back (MAIL_ENABLED=true).
  // El enlace del correo lleva a /account-activated?token=...
  const resend = async () => {
    setMessage("");
    setError("");
    try {
      await resendVerification(email);
      setMessage("Te hemos reenviado el correo de verificación.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo reenviar el correo.");
    }
  };

  return (
    <CenteredAuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg text-brand-green">
          <Icon name="mail" className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-brand-dark">¡Casi listo!</h1>
        <p className="mt-2 text-sm text-gray-500">
          Hemos enviado un enlace de verificación a:
          <br />
          <strong className="text-brand-dark">{email || "tu correo"}</strong>
        </p>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
        <p className="text-xs font-bold uppercase tracking-wide text-gray-500">¿No recibiste el correo?</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Revisa tu carpeta de spam.</li>
          <li>Verifica que el email sea correcto.</li>
        </ul>
      </div>

      {message && (
        <div className="mt-4">
          <Alert tone="success">{message}</Alert>
        </div>
      )}
      {error && (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <ButtonLink to="/login" fullWidth>
          Ir al inicio de sesión
        </ButtonLink>
        <Button variant="secondary" fullWidth onClick={resend}>
          Reenviar correo de verificación
        </Button>
      </div>
    </CenteredAuthLayout>
  );
}
