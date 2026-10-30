import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { SplitAuthLayout } from "~/components/layout/AuthLayout";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import CheckboxField from "~/components/form/CheckboxField";
import PasswordField from "~/components/form/PasswordField";
import TextField from "~/components/form/TextField";
import UserFields, { emptyUserForm, validateUserForm, type UserFormValues } from "~/components/form/UserFields";
import { fetchRegistrationInfo, registerUser } from "~/api/users";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import * as v from "~/utils/validation";
import heroImage from "~/assets/hero-register.jpg";

type RegisterValues = UserFormValues & { code: string; password: string; terms: boolean };

export default function Register() {
  useDocumentTitle("Crear cuenta");
  const { code } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  // La comunidad llega en la URL de registro que genera el superadmin: /register/<registration_code>.
  // Se pregunta al back (GET /api/register/{code}) cómo se llama; si no existe, el enlace no es válido.
  const [linkState, setLinkState] = useState<{ status: "loading" | "ok" | "invalid"; name: string }>({ status: "loading", name: "" });
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    setLinkState({ status: "loading", name: "" });
    fetchRegistrationInfo(code)
      .then((info) => !cancelled && setLinkState({ status: "ok", name: info.name }))
      .catch(() => !cancelled && setLinkState({ status: "invalid", name: "" }));
    return () => {
      cancelled = true;
    };
  }, [code]);

  const form = useForm<RegisterValues>(
    { ...emptyUserForm, code: "", password: "", terms: false },
    (values) => ({
      ...validateUserForm(values),
      code: code || values.code.trim() ? "" : "Introduce el código de registro de tu comunidad",
      password: v.password(values.password),
      terms: values.terms ? "" : "Debes aceptar los términos para continuar",
    }),
  );

  const onSubmit = async (values: RegisterValues) => {
    // El código es el de la URL o el que escribe el usuario; el back busca la comunidad y comprueba duplicados
    const registrationCode = code ?? values.code.trim();
    setSending(true);
    setError("");
    try {
      const result = await registerUser(registrationCode, {
        name: values.name.trim(),
        lastname: values.lastname.trim(),
        residentType: Number(values.residentType) as 1 | 2,
        avatar: values.avatar || null, // se sube en el primer login (la ruta de avatar pide sesión)
        dni: values.dni.trim().toUpperCase(),
        phoneNumber: values.phoneNumber.trim() || null,
        email: values.email.trim(),
        password: values.password,
        address: values.address.trim(),
        zipCode: values.zipCode.trim(),
        cityId: Number(values.cityId),
      });
      // El back dice en qué modo está: con correo → "¡Casi listo!"; sin correo → cuenta ya activada
      if (result?.emailVerificationRequired) navigate(`/verify-email/${encodeURIComponent(values.email.trim())}`);
      else navigate("/account-activated?created=1");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear la cuenta.");
    } finally {
      setSending(false);
    }
  };

  const steps = (
    <ol className="space-y-4 text-sm">
      <li className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green font-bold">1</span>
        Tus datos básicos
      </li>
      <li className="flex items-center gap-3 text-gray-300">
        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-400 font-bold">2</span>
        Cuenta lista
      </li>
    </ol>
  );

  return (
    <SplitAuthLayout image={heroImage} headline="Crear cuenta" text="Completa tu perfil para unirte a tu comunidad." aside={steps}>
      <h2 className="text-2xl font-bold text-brand-dark">Crear cuenta</h2>
      <p className="mt-1 text-sm text-gray-500">Completa tu perfil para unirte a tu comunidad.</p>

      {code && linkState.status === "loading" ? (
        <p className="mt-6 text-sm text-gray-500">Comprobando el enlace de registro…</p>
      ) : code && linkState.status === "invalid" ? (
        <div className="mt-6 space-y-4">
          <Alert tone="error">El enlace de registro no es válido o la comunidad ya no está activa. Pide uno nuevo a tu administrador.</Alert>
          <Link to="/login" className="text-sm font-bold text-brand-green hover:underline">
            Ir al inicio de sesión
          </Link>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="mt-6 space-y-5">
          {error && <Alert tone="error">{error}</Alert>}

          {code ? (
            <div className="rounded-lg border border-brand-light/40 bg-brand-bg px-4 py-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Comunidad asociada</p>
              <p className="font-bold text-brand-dark">{linkState.name}</p>
            </div>
          ) : (
            <TextField
              label="Código de registro de la comunidad"
              hint="Te lo facilita tu administrador (viene al final de su enlace de registro)"
              {...form.field("code")}
            />
          )}

          <UserFields form={form} />

          <PasswordField label="Contraseña" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...form.field("password")} />
          <CheckboxField
            label="Acepto los Términos de Servicio y la Política de Privacidad de Gescom."
            {...form.checkbox("terms")}
          />
          <Button type="submit" fullWidth disabled={sending}>
            {sending ? "Creando cuenta…" : "Registrarme"}
          </Button>
          <p className="text-center text-sm text-gray-500">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login" className="font-bold text-brand-green hover:underline">
              Inicia sesión
            </Link>
          </p>
        </form>
      )}
    </SplitAuthLayout>
  );
}
