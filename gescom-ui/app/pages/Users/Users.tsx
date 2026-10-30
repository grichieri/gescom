import { useState } from "react";
import { useLocation } from "react-router";
import Button, { ButtonLink } from "~/components/ui/Button";
import Avatar from "~/components/ui/Avatar";
import Badge, { RoleBadge } from "~/components/ui/Badge";
import Icon from "~/components/ui/Icon";
import Modal from "~/components/ui/Modal";
import PageHeader from "~/components/ui/PageHeader";
import SearchInput from "~/components/ui/SearchInput";
import Table, { type Column } from "~/components/ui/Table";
import DateField from "~/components/form/DateField";
import SelectField from "~/components/form/SelectField";
import Alert from "~/components/ui/Alert";
import { changeRole as changeRoleInBack, updateUser as updateUserInBack } from "~/api/users";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { useRequireCommunity } from "~/hooks/useRequireCommunity";
import type { RoleKind, User } from "~/types";
import { fullName, propertyLabel, propertyOfUser } from "~/utils/format";
import { toInputDate } from "~/utils/formatDate";
import { membersOfCommunity, roleOf } from "~/utils/roles";

const ROLE_OPTIONS = [
  { value: "none", label: "Sin cargo (usuario)" },
  { value: "administrator", label: "Administrador" },
  { value: "president", label: "Presidente" },
  { value: "caretaker", label: "Conserje" },
];

export default function Users() {
  useDocumentTitle("Usuarios");
  const community = useRequireCommunity();
  const { role: myRole } = useAuth();
  const { data, assignRole, updateUser } = useData();

  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const [roleValue, setRoleValue] = useState("none");
  const [startDate, setStartDate] = useState(toInputDate());
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [actionError, setActionError] = useState("");
  const [roleError, setRoleError] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  // Aviso que deja la pantalla de alta al volver aquí (se lee una sola vez)
  const location = useLocation();
  const [notice, setNotice] = useState<string>(() => (location.state as { notice?: string } | null)?.notice ?? "");

  if (!community) return null;

  const isSuperadmin = myRole === "superadmin";
  const term = search.trim().toLowerCase();
  const properties = data.properties.filter((p) => p.communityId === community.communityId);
  // Vivienda del usuario con el formato de toda la app; si no es una de la lista, la dirección que él indicó
  const housingOf = (u: User) => {
    const property = propertyOfUser(properties, u);
    if (property) return propertyLabel(property);
    if (u.address) return u.address;
    const role = roleOf(data, u, community.communityId);
    return role === "administrator" || role === "caretaker" ? "Gestión externa" : "—";
  };
  const members = membersOfCommunity(data, community.communityId)
    .filter((u) => `${fullName(u)} ${u.email} ${housingOf(u)}`.toLowerCase().includes(term))
    .sort((a, b) => a.lastname.localeCompare(b.lastname));

  const openRoleModal = (user: User) => {
    const current = roleOf(data, user, community.communityId);
    setEditing(user);
    setRoleValue(current === "administrator" || current === "president" || current === "caretaker" ? current : "none");
    setStartDate(toInputDate());
    setEndDate("");
    setDateError("");
    setRoleError("");
  };

  const saveRole = async () => {
    if (!editing) return;
    if (roleValue !== "none" && endDate !== "" && endDate < startDate) {
      setDateError("La fecha de fin no puede ser anterior a la de inicio");
      return;
    }
    const role = roleValue === "none" ? null : (roleValue as RoleKind);
    const end = endDate === "" ? null : endDate;
    setSavingRole(true);
    setRoleError("");
    try {
      // El back guarda el cambio (y cierra el cargo anterior); después se actualiza la copia local que lee la pantalla
      await changeRoleInBack(community.communityId, editing.userId, role, startDate, end);
      assignRole(editing.userId, community.communityId, role, startDate, end);
      setEditing(null);
    } catch (e) {
      setRoleError(e instanceof Error ? e.message : "No se pudo cambiar el cargo.");
    } finally {
      setSavingRole(false);
    }
  };

  // Dar de baja / reactivar: se guarda en el back (PUT /api/users/{id}) y después en local
  const toggleActive = async (u: User) => {
    const changes = { isActive: !u.isActive, isDisabled: false };
    setActionError("");
    try {
      await updateUserInBack(u, changes);
      updateUser(u.userId, changes);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "No se pudo actualizar el usuario.");
    }
  };

  const columns: Column<User>[] = [
    {
      header: "Usuario",
      cell: (u) => (
        <div className="flex items-center gap-3">
          <Avatar user={u} size="sm" />
          <div>
            <p className="font-bold text-brand-dark">{fullName(u)}</p>
            <p className="text-xs text-gray-500">{u.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Vivienda", cell: (u) => <span className="text-gray-600">{housingOf(u)}</span> },
    { header: "Cargo", cell: (u) => <RoleBadge role={roleOf(data, u, community.communityId)} /> },
    {
      header: "Estado",
      cell: (u) =>
        u.isDisabled || !u.isActive ? (
          <Badge tone="red">Baja</Badge>
        ) : u.isValidated ? (
          <Badge tone="green">Activo</Badge>
        ) : (
          <Badge tone="orange">Sin verificar</Badge>
        ),
    },
  ];

  if (isSuperadmin) {
    columns.push({
      header: "Acciones",
      cell: (u) => (
        <div className="flex gap-2">
          <ButtonLink size="sm" variant="secondary" to={`/users/${u.userId}/edit`} aria-label={`Editar a ${fullName(u)}`}>
            <Icon name="edit" className="h-3.5 w-3.5" />
            Editar
          </ButtonLink>
          <Button size="sm" variant="secondary" onClick={() => openRoleModal(u)}>
            Cambiar cargo
          </Button>
          <Button
            size="sm"
            variant={u.isActive ? "danger" : "secondary"}
            onClick={() => toggleActive(u)}
          >
            {u.isActive ? "Dar de baja" : "Reactivar"}
          </Button>
        </div>
      ),
    });
  }

  return (
    <>
      <PageHeader
        title="Usuarios"
        subtitle={`Listado de vecinos y cargos de ${community.name}`}
        actions={
          isSuperadmin && (
            <ButtonLink to="/users/new">
              <Icon name="plus" className="h-4 w-4" />
              Añadir usuario
            </ButtonLink>
          )
        }
      />

      {notice && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex-1">
            <Alert tone="success">{notice}</Alert>
          </div>
          <Button variant="secondary" onClick={() => setNotice("")}>
            Cerrar
          </Button>
        </div>
      )}

      {actionError && (
        <div className="mb-4">
          <Alert tone="error">{actionError}</Alert>
        </div>
      )}

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar usuario..." />
      </div>

      <Table columns={columns} rows={members} rowKey={(u) => u.userId} emptyMessage="No hay usuarios que coincidan" />
      <p className="mt-2 text-xs text-gray-500">{members.length} usuarios</p>

      {editing && (
        <Modal
          title={`Cargo de ${fullName(editing)}`}
          onClose={() => setEditing(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditing(null)}>
                Cancelar
              </Button>
              <Button onClick={saveRole} disabled={savingRole}>
                Guardar
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {roleError && <Alert tone="error">{roleError}</Alert>}
            <SelectField label="Cargo en la comunidad" options={ROLE_OPTIONS} value={roleValue} onChange={(e) => setRoleValue(e.target.value)} />
            {roleValue !== "none" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <DateField label="Fecha inicio" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <DateField label="Fecha fin" hint="Opcional" value={endDate} onChange={(e) => setEndDate(e.target.value)} error={dateError} />
              </div>
            )}
            <p className="text-xs text-gray-500">
              Al asignar un cargo se cierra el del titular anterior. Un usuario tiene un solo cargo por comunidad.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
