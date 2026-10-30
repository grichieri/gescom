import { useNavigate, useParams } from "react-router";
import Alert from "~/components/ui/Alert";
import Badge from "~/components/ui/Badge";
import Button, { ButtonLink } from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import CopyField from "~/components/ui/CopyField";
import EmptyState from "~/components/ui/EmptyState";
import Icon from "~/components/ui/Icon";
import PageHeader from "~/components/ui/PageHeader";
import StatCard from "~/components/ui/StatCard";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { COMMUNITY_TYPE_LABELS } from "~/data/labels";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { communityCode, locationOf, propertyLabel } from "~/utils/format";
import { currentHolder, membersOfCommunity } from "~/utils/roles";
import Info from "../IncidenceDetail/Info";
import RoleHolderCard from "./RoleHolderCard";

export default function CommunityDetail() {
  const { id } = useParams();
  const { role, selectCommunity } = useAuth();
  const navigate = useNavigate();
  const { data } = useData();
  const community = data.communities.find((c) => String(c.communityId) === id);
  useDocumentTitle(community ? community.name : "Comunidad");

  if (role !== "superadmin") return <Alert tone="error">Solo el superadministrador puede ver la gestión de comunidades.</Alert>;
  if (!community) {
    return <EmptyState title="Comunidad no encontrada" action={<ButtonLink to="/communities">Volver a comunidades</ButtonLink>} />;
  }

  const location = locationOf(community.cityId);
  const properties = data.properties.filter((p) => p.communityId === community.communityId);
  const incidences = data.incidences.filter((i) => i.communityId === community.communityId);
  const registrationUrl = `${window.location.origin}/register/${community.registrationCode}`;

  return (
    <>
      <PageHeader
        title={community.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            {community.address}, {location.city?.name}
            <Badge tone={community.isDeleted ? "red" : "green"}>{community.isDeleted ? "De baja" : "Activa"}</Badge>
            <span className="text-xs text-gray-400">ID: {communityCode(community)}</span>
          </span>
        }
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                selectCommunity(community.communityId);
                navigate("/dashboard");
              }}
            >
              Trabajar en esta comunidad
            </Button>
            <ButtonLink to={`/communities/${community.communityId}/edit`} variant="secondary">
              <Icon name="edit" className="h-4 w-4" />
              Editar
            </ButtonLink>
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Propiedades" value={properties.length} />
        <StatCard label="Incidencias abiertas" value={incidences.filter((i) => i.status !== 3).length} tone="orange" />
        <StatCard label="Incidencias resueltas" value={incidences.filter((i) => i.status === 3).length} tone="green" />
        <StatCard label="Usuarios" value={membersOfCommunity(data, community.communityId).length} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Datos de la comunidad">
            <dl className="grid gap-5 sm:grid-cols-2">
              <Info label="Nombre" value={community.name} />
              <Info label="Tipo" value={COMMUNITY_TYPE_LABELS[community.type]} />
              <Info label="CIF / NIF" value={community.nif} />
              <Info label="Dirección" value={community.address} />
              <Info label="Ciudad" value={location.city?.name ?? "—"} />
              <Info label="Provincia" value={location.province?.name ?? "—"} />
              <Info label="Código postal" value={community.zipCode} />
            </dl>
          </Card>

          <Card title="Enlace de registro">
            <p className="mb-3 text-sm text-gray-600">Quien se registre con este enlace quedará vinculado a la comunidad.</p>
            <CopyField id="registration-url" label="Enlace de registro" value={registrationUrl} />
          </Card>

          <Card
            title="Propiedades"
            action={
              <ButtonLink to={`/communities/${community.communityId}/properties/new`} size="sm">
                <Icon name="plus" className="h-4 w-4" />
                Añadir propiedad
              </ButtonLink>
            }
          >
            {properties.length === 0 ? (
              <p className="text-sm text-gray-500">Aún no hay propiedades registradas.</p>
            ) : (
              <ul className="divide-y divide-gray-100 text-sm">
                {properties.map((p) => (
                  <li key={p.propertyId} className="flex justify-between gap-3 py-2.5">
                    <span className="font-medium text-brand-dark">{propertyLabel(p)}</span>
                    <span className="text-gray-500">CP {p.zipCode}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <RoleHolderCard title="Administrador" holder={currentHolder(data, "administrator", community.communityId)} />
          <RoleHolderCard title="Presidente" holder={currentHolder(data, "president", community.communityId)} />
          <RoleHolderCard title="Conserje" holder={currentHolder(data, "caretaker", community.communityId)} />
          <p className="text-xs text-gray-500">
            Los cargos se asignan desde Usuarios, dentro de la comunidad (entra con «Trabajar en esta comunidad»).
          </p>
        </div>
      </div>
    </>
  );
}
