import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import Alert from "~/components/ui/Alert";
import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import PageHeader from "~/components/ui/PageHeader";
import DateField from "~/components/form/DateField";
import FormActions from "~/components/form/FormActions";
import PasswordField from "~/components/form/PasswordField";
import SelectField from "~/components/form/SelectField";
import UserFields, { emptyUserForm, validateUserForm, type UserFormValues } from "~/components/form/UserFields";
import { createMember, updateUser as updateUserInBack } from "~/api/users";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { ROLE_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useForm } from "~/hooks/useForm";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import type { RoleKind, User } from "~/types";
import { propertyLabel, propertyOfUser } from "~/utils/format";
import { toInputDate } from "~/utils/formatDate";
import { roleOf } from "~/utils/roles";
import * as v from "~/utils/validation";

type NewUserValues = UserFormValues & {
  role: string; // "none" | RoleKind (solo en el alta)
  startDate: string;
  endDate: string;
  password: string; // solo en el alta
  propertyId: string; // "" = sin vivienda, "current" = la dirección que ya tenía el usuario
};

const roleOptions = [
  { value: "none", label: "Usuario (sin cargo)" },
  { value: "president", label: ROLE_LABELS.president },
  { value: "administrator", label: ROLE_LABELS.administrator },
  { value: "caretaker", label: ROLE_LABELS.caretaker },
];

// Administrador y conserje pueden no vivir en la comunidad: su vivienda es opcional
const isExternalRole = (role: string) => role === "administrator" || role === "caretaker";

/** Misma pantalla para el alta (/users/new) y para corregir los datos de un usuario (/users/:userId/edit). */
export default function NewUser() {
  const { userId } = useParams();
  const isEdit = userId !== undefined;
  useDocumentTitle(isEdit ? "Editar usuario" : "Añadir usuario");
  const community = useRequireCommunity();
  const { role: myRole } = useAuth();
  const { data, createUser, updateUser } = useData();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const editing = isEdit ? data.users.find((u) => u.userId === Number(userId)) : undefined;
  const communityProperties = community ? data.properties.filter((p) => p.communityId === community.communityId) : [];
  const currentProperty = editing ? propertyOfUser(communityProperties, editing) : undefined;
  // Un usuario que se registró él mismo puede tener una dirección que no es ninguna de las viviendas de la lista
  const keepsOwnAddress = !!editing?.address && !currentProperty;
  const editingExternal = editing && community ? isExternalRole(roleOf(data, editing, community.communityId)) : false;

  const form = useForm<NewUserValues>(
    editing
      ? {
          ...emptyUserForm,
          residentType: String(editing.residentType ?? 1),
          avatar: editing.avatar ?? "",
          name: editing.name,
          lastname: editing.lastname,
          dni: editing.dni ?? "",
          phoneNumber: editing.phoneNumber ?? "",
          email: editing.email,
          role: "none",
          startDate: "",
          endDate: "",
          password: "",
          propertyId: currentProperty ? String(currentProperty.propertyId) : keepsOwnAddress ? "current" : "",
        }
      : { ...emptyUserForm, role: "none", startDate: toInputDate(), endDate: "", password: "", propertyId: "" },
    (values) => {
      const external = isEdit ? editingExternal : isExternalRole(values.role);
      return {
        ...validateUserForm(values, true, false),
        propertyId: !external && values.propertyId === "" ? "Elige la vivienda" : "",
        startDate: !isEdit && values.role !== "none" && values.startDate === "" ? "Indica la fecha de inicio" : "",
        endDate: !isEdit && values.role !== "none" && values.endDate !== "" && values.endDate < values.startDate ? "No puede ser anterior al inicio" : "",
        password: isEdit ? "" : v.password(values.password),
      };
    },
  );

  if (!community) return null;

  // Solo el superadmin da de alta y edita usuarios
  if (myRole !== "superadmin") {
    return <Alert tone="error">Solo el superadministrador puede {isEdit ? "editar" : "añadir"} usuarios.</Alert>;
  }
  if (isEdit && !editing) {
    return <Alert tone="error">No se ha encontrado el usuario.</Alert>;
  }

  const hasRole = !isEdit && form.values.role !== "none";
  const roleLabel = hasRole ? ROLE_LABELS[form.values.role as RoleKind] : "";
  const external = isEdit ? editingExternal : isExternalRole(form.values.role);

  const propertyOptions = [
    ...communityProperties.map((p) => ({ value: String(p.propertyId), label: propertyLabel(p) })),
    ...(keepsOwnAddress ? [{ value: "current", label: `${editing!.address} (dirección que indicó el usuario)` }] : []),
  ];

  /** Dirección, código postal y ciudad salen de la vivienda elegida (o de la comunidad si no tiene vivienda). */
  const locationFor = (values: NewUserValues, previous?: User) => {
    const property = communityProperties.find((p) => String(p.propertyId) === values.propertyId);
    if (property) return { address: property.address, zipCode: property.zipCode, cityId: community.cityId };
    if (values.propertyId === "current" && previous) return { address: previous.address, zipCode: previous.zipCode, cityId: previous.cityId };
    return { address: null, zipCode: community.zipCode, cityId: community.cityId };
  };

  const onSubmit = async (values: NewUserValues) => {
    const personal = {
      name: values.name.trim(),
      lastname: values.lastname.trim(),
      residentType: Number(values.residentType) as 1 | 2,
      avatar: values.avatar || null,
      dni: values.dni.trim().toUpperCase(),
      phoneNumber: values.phoneNumber.trim() || null,
      email: values.email.trim(),
      ...locationFor(values, editing),
    };
    setSaving(true);
    setError("");
    try {
      // El back comprueba email, DNI y teléfono duplicados (409) y valida los datos (400)
      if (editing) {
        const saved = await updateUserInBack(editing, personal);
        updateUser(editing.userId, { ...personal, avatar: saved.avatar ?? personal.avatar });
      } else {
        const input = { ...personal, password: values.password };
        // El back crea el usuario (ya validado), lo vincula a la comunidad y le da el cargo; con el correo activado,
        // además le manda un correo de bienvenida con un enlace para definir su contraseña
        const role = hasRole ? (values.role as RoleKind) : null;
        const endDate = values.endDate === "" ? null : values.endDate;
        const created = await createMember(community.communityId, input, role, values.startDate, endDate);
        // Copia local (la pantalla aún lee de ahí), con el mismo id que tiene en la base de datos
        createUser(input, community.communityId, role, values.startDate, endDate, created.userId);
      }
      // En el alta, la lista de usuarios muestra un aviso (el correo solo sale si el envío está activado en el back)
      navigate("/users", {
        state: editing
          ? undefined
          : { notice: `Usuario ${personal.name} ${personal.lastname} creado correctamente.` },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el usuario.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        title={isEdit ? "Editar usuario" : "Añadir nuevo usuario"}
        subtitle={isEdit ? `${community.name} · Corrige los datos del usuario` : `${community.name} · Registro de vecino o cargo`}
      />
      <Card className="max-w-3xl">
        <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-5">
          {error && <Alert tone="error">{error}</Alert>}
          <UserFields form={form} withLocation={false} />

          <SelectField
            label="Vivienda"
            placeholder={external ? "Sin vivienda (gestión externa)" : "Elige una vivienda"}
            hint={external ? "Opcional para administrador y conserje" : "Las viviendas se dan de alta desde la comunidad"}
            options={propertyOptions}
            {...form.field("propertyId")}
          />

          {!isEdit && (
            <>
              <SelectField label="Rol en la comunidad" options={roleOptions} {...form.field("role")} />
              {hasRole && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-gray-500">Periodo como {roleLabel.toLowerCase()}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DateField label="Fecha inicio" {...form.field("startDate")} />
                    <DateField label="Fecha fin" hint="Opcional" {...form.field("endDate")} />
                  </div>
                </div>
              )}

              <PasswordField
                label="Contraseña temporal"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                {...form.field("password")}
              />
            </>
          )}

          <FormActions>
            <Button variant="secondary" onClick={() => navigate("/users")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Guardar usuario"}
            </Button>
          </FormActions>
        </form>
      </Card>
    </>
  );
}
