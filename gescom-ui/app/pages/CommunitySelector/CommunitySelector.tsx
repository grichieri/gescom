import { useNavigate } from "react-router";
import Icon from "~/components/ui/Icon";
import EmptyState from "~/components/ui/EmptyState";
import PageHeader from "~/components/ui/PageHeader";
import { ButtonLink } from "~/components/ui/Button";
import { useAuth } from "~/hooks/useAuth";
import { useData } from "~/hooks/useData";
import { useDocumentTitle } from "~/hooks/useDocumentTitle";
import { currentHolder, membersOfCommunity } from "~/utils/roles";
import CommunityCard from "./CommunityCard";

/** Elección de comunidad: el superadmin ve todas; el resto, solo las suyas. */
export default function CommunitySelector() {
  useDocumentTitle("Comunidades");
  const { user, role, communityIds, selectCommunity } = useAuth();
  const { data } = useData();
  const navigate = useNavigate();

  if (!user) return null;
  const isSuperadmin = user.type === 1;
  const communities = data.communities.filter((c) => communityIds.includes(c.communityId));

  const enter = (communityId: number) => {
    selectCommunity(communityId);
    navigate("/dashboard");
  };

  return (
    <>
      <PageHeader
        title={isSuperadmin ? "Panel de control" : "Elige tu comunidad"}
        subtitle={
          isSuperadmin
            ? "Gestión global de todas las comunidades. Pulsa ENTRAR en una para ver sus incidencias y usuarios."
            : "Perteneces a varias comunidades: elige con cuál quieres trabajar."
        }
        actions={
          isSuperadmin && (
            <ButtonLink to="/communities/new">
              <Icon name="plus" className="h-4 w-4" />
              AGREGAR COMUNIDAD
            </ButtonLink>
          )
        }
      />

      {communities.length === 0 ? (
        <EmptyState title="No hay comunidades" description="Crea la primera para empezar a registrar vecinos e incidencias." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {communities.map((c) => (
            <CommunityCard
              key={c.communityId}
              community={c}
              administrator={currentHolder(data, "administrator", c.communityId)}
              units={data.properties.filter((p) => p.communityId === c.communityId).length}
              neighbours={membersOfCommunity(data, c.communityId).length}
              onEnter={() => enter(c.communityId)}
              onDetails={role === "superadmin" ? () => navigate(`/communities/${c.communityId}`) : undefined}
              registrationUrl={role === "superadmin" ? `${window.location.origin}/register/${c.registrationCode}` : undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
