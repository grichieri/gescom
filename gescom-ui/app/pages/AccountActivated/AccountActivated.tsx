import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { verifyEmail } from "~/api/auth";
import { CenteredAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import { ButtonLink } from "~/components/ui/Button";
import Icon from "~/components/ui/Icon";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";

/**
 * Pantalla única de "Cuenta activada". Según de dónde se llegue:
 *  - /account-activated?token=...  → viene del enlace del correo: se verifica el token y se enseña
 *                                    "Correo verificado. Ya puedes iniciar sesión."   (MAIL_ENABLED=true)
 *  - /account-activated?created=1  → se llega tras registrarse con el correo desactivado:
 *                                    "Cuenta creada. Ya puedes iniciar sesión."       (MAIL_ENABLED=false)
 */
export default function AccountActivated() {
  useDocumentTitle("Cuenta activada");
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"checking" | "ok" | "error">(token ? "checking" : "ok");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token)
      .then(() => !cancelled && setState("ok"))
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "No se pudo verificar el correo.");
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const text = token ? "Correo verificado. Ya puedes iniciar sesión." : "Cuenta creada. Ya puedes iniciar sesión.";

  return (
    <CenteredAuthLayout>
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-bg text-brand-green">
          <Icon name="mail" className="h-7 w-7" />
        </span>
        {state === "checking" && <p className="mt-4 text-sm text-gray-500">Verificando tu correo…</p>}
        {state === "ok" && (
          <>
            <h1 className="mt-4 text-2xl font-bold text-brand-dark">Cuenta activada</h1>
            <p className="mt-2 text-sm text-gray-500">{text}</p>
          </>
        )}
      </div>
      {state === "error" && (
        <div className="mt-6">
          <Alert tone="error">{error}</Alert>
          <p className="mt-3 text-sm text-gray-500">El enlace puede haber caducado o haberse usado ya. Si no puedes entrar, vuelve a registrarte o pide otro correo.</p>
        </div>
      )}
      {state !== "checking" && (
        <div className="mt-6">
          <ButtonLink to="/login" fullWidth>
            Ir al inicio de sesión
          </ButtonLink>
        </div>
      )}
    </CenteredAuthLayout>
  );
}
