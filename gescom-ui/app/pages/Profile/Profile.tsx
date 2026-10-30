import { useState } from "react";
import { useNavigate } from "react-router";
import Alert from "~/components/ui/Alert";
import Avatar from "~/components/ui/Avatar";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import Modal from "~/components/ui/Modal";
import Tabs from "~/components/ui/Tabs";
import { RoleBadge } from "~/components/ui/Badge";
import AvatarField from "~/components/form/AvatarField";
import FormActions from "~/components/form/FormActions";
import PasswordField from "~/components/form/PasswordField";
import TextField from "~/components/form/TextField";
import { updateUser as updateUserInBack } from "~/api/users";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { cities, provinces } from "~/data/seed";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import { fullName } from "~/utils/format";
import { formatMonthYear } from "~/utils/formatDate";
import * as v from "~/utils/validation";

type Tab = "account" | "security";
type ProfileValues = { name: string; lastname: string; phoneNumber: string; address: string; avatar: string };
type PasswordValues = { password: string; repeat: string };

export default function Profile() {
  useDocumentTitle("Mi perfil");
  const { user: sessionUser, community, role, logout } = useAuth();
  const { data, updateUser } = useData();
  // Los datos del usuario se toman de esta pantalla (useData) para que se vean los cambios al guardar
  const user = data.users.find((u) => u.userId === sessionUser?.userId) ?? null;
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>("account");
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const profileForm = useForm<ProfileValues>(
    {
      name: user?.name ?? "",
      lastname: user?.lastname ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      address: user?.address ?? "",
      avatar: user?.avatar ?? "",
    },
    (values) => ({
      name: v.required(values.name, "El nombre"),
      lastname: v.required(values.lastname, "Los apellidos"),
      phoneNumber: v.phone(values.phoneNumber),
      address: "",
      avatar: "",
    }),
  );

  const passwordForm = useForm<PasswordValues>({ password: "", repeat: "" }, (values) => ({
    password: v.password(values.password),
    repeat: values.repeat === values.password ? "" : "Las contraseñas no coinciden",
  }));

  if (!user) return null;

  const city = cities.find((c) => c.cityId === user.cityId);
  const province = provinces.find((p) => p.provinceId === city?.provinceId);
  const membership = community
    ? data.communitiesUsers.find((r) => r.userId === user.userId && r.communityId === community.communityId)
    : undefined;

  const startEditing = () => {
    profileForm.setValues({
      name: user.name,
      lastname: user.lastname,
      phoneNumber: user.phoneNumber ?? "",
      address: user.address ?? "",
      avatar: user.avatar ?? "",
    });
    setEditing(true);
    setMessage("");
    setSaveError("");
  };

  const saveProfile = async (values: ProfileValues) => {
    const changes = {
      name: values.name.trim(),
      lastname: values.lastname.trim(),
      phoneNumber: values.phoneNumber.trim() || null,
      address: values.address.trim() || null,
      avatar: values.avatar || null,
    };
    setSaving(true);
    setSaveError("");
    try {
      // PUT /api/users/{id}: el back devuelve el usuario actualizado; la copia local se alinea con él
      const saved = await updateUserInBack(user, changes);
      updateUser(user.userId, {
        name: saved.name,
        lastname: saved.lastname,
        phoneNumber: saved.phoneNumber,
        address: saved.address,
        avatar: saved.avatar ?? changes.avatar, // el back devuelve la URL de la foto ya subida
      });
      setEditing(false);
      setMessage("Perfil actualizado.");
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = (values: PasswordValues) => {
    updateUser(user.userId, { password: values.password });
    passwordForm.reset();
    setChangingPassword(false);
    setMessage("Contraseña actualizada.");
  };

  const disableAccount = () => {
    updateUser(user.userId, { isActive: false });
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-5">
          <Avatar user={user} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-brand-dark">{fullName(user)}</h1>
            <p className="mt-1 text-sm text-gray-500">
              {user.address ?? "Sin dirección"}
              {membership ? ` · Miembro desde ${formatMonthYear(membership.moveInDate)}` : ""}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <RoleBadge role={role} />
              {community && <span className="text-xs font-bold uppercase text-gray-500">{community.name}</span>}
            </div>
          </div>
          {!editing && tab === "account" && (
            <Button variant="secondary" onClick={startEditing}>
              Editar perfil
            </Button>
          )}
        </div>
      </Card>

      {message && <Alert tone="success">{message}</Alert>}

      <Tabs
        tabs={[
          { key: "account", label: "Datos de cuenta" },
          { key: "security", label: "Seguridad" },
        ]}
        active={tab}
        onChange={(key) => {
          setTab(key);
          setMessage("");
        }}
      />

      {tab === "account" && (
        <Card>
          {editing ? (
            <form onSubmit={profileForm.handleSubmit(saveProfile)} noValidate className="space-y-5">
              {saveError && <Alert tone="error">{saveError}</Alert>}
              <AvatarField
                value={profileForm.values.avatar}
                name={profileForm.values.name}
                lastname={profileForm.values.lastname}
                onChange={(image) => profileForm.setValue("avatar", image)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField label="Nombre" {...profileForm.field("name")} />
                <TextField label="Apellidos" {...profileForm.field("lastname")} />
                <TextField label="Teléfono" type="tel" {...profileForm.field("phoneNumber")} />
                <TextField label="Correo electrónico" value={user.email} disabled readOnly hint="El correo no se puede cambiar" />
              </div>
              <TextField label="Dirección de vivienda" {...profileForm.field("address")} />
              <FormActions>
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando…" : "Guardar cambios"}
                </Button>
              </FormActions>
            </form>
          ) : (
            <dl className="grid gap-6 sm:grid-cols-2">
              <Field label="Nombre completo" value={fullName(user)} />
              <Field label="Correo electrónico" value={user.email} />
              <Field label="Teléfono" value={user.phoneNumber ?? "—"} />
              <Field label="DNI / NIE" value={user.dni ?? "—"} />
              <Field label="Vivienda asociada" value={user.address ? `${user.address}${user.zipCode ? ` (${user.zipCode})` : ""}` : "—"} />
              <Field label="Ciudad" value={city ? `${city.name}${province ? `, ${province.name}` : ""}` : "—"} />
            </dl>
          )}
        </Card>
      )}

      {tab === "security" && (
        <>
          <Card title="Contraseña">
            {changingPassword ? (
              <form onSubmit={passwordForm.handleSubmit(savePassword)} noValidate className="space-y-5">
                <PasswordField label="Nueva contraseña" placeholder="Mínimo 8 caracteres" autoComplete="new-password" {...passwordForm.field("password")} />
                <PasswordField label="Repite la contraseña" autoComplete="new-password" {...passwordForm.field("repeat")} />
                <FormActions>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      passwordForm.reset();
                      setChangingPassword(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Cambiar contraseña</Button>
                </FormActions>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-gray-600">Usa una contraseña de al menos 8 caracteres.</p>
                <Button variant="secondary" onClick={() => setChangingPassword(true)}>
                  Cambiar
                </Button>
              </div>
            )}
          </Card>

          {role !== "superadmin" && (
            <Card title="Zona de peligro" className="border-red-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="max-w-lg text-sm text-gray-600">
                  Al desactivar tu cuenta, ya no recibirás notificaciones ni podrás reportar incidencias.
                </p>
                <Button variant="danger" onClick={() => setConfirmDisable(true)}>
                  Desactivar cuenta
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {confirmDisable && (
        <Modal
          title="¿Desactivar tu cuenta?"
          onClose={() => setConfirmDisable(false)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setConfirmDisable(false)}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={disableAccount}>
                Sí, desactivar
              </Button>
            </>
          }
        >
          Se cerrará tu sesión y no podrás volver a entrar hasta que un administrador reactive tu cuenta.
        </Modal>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-brand-dark">{value}</dd>
    </div>
  );
}
