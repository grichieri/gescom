import Button from "~/components/ui/Button";
import Card from "~/components/ui/Card";
import CopyField from "~/components/ui/CopyField";
import type { Community, User } from "~/types";
import { communityCode, fullName, locationOf } from "~/utils/format";

type CommunityCardProps = {
  community: Community;
  administrator: User | undefined;
  units: number;
  neighbours: number;
  onEnter: () => void;
  /** Acción secundaria (ver ficha), solo para el superadmin */
  onDetails?: () => void;
  /** URL de registro de la comunidad; solo se pasa si quien mira puede compartirla (superadmin) */
  registrationUrl?: string;
};

export default function CommunityCard({
  community,
  administrator,
  units,
  neighbours,
  onEnter,
  onDetails,
  registrationUrl,
}: CommunityCardProps) {
  return (
    <Card className="flex flex-col">
      <h2 className="text-lg font-bold text-brand-dark">{community.name}</h2>
      <p className="text-xs text-gray-400">ID: {communityCode(community)}</p>
      <dl className="mt-4 flex-1 space-y-1.5 text-sm text-gray-600">
        <div>
          {community.address}, {locationOf(community.cityId).city?.name}
        </div>
        <div>Admin: {administrator ? fullName(administrator) : "Sin asignar"}</div>
        <div>
          {units} {units === 1 ? "Unidad" : "Unidades"} · {neighbours} {neighbours === 1 ? "Vecino" : "Vecinos"}
        </div>
      </dl>
      {registrationUrl && (
        <div className="mt-4">
          <CopyField id={`url-${community.communityId}`} label="Enlace de registro" value={registrationUrl} />
        </div>
      )}
      <div className="mt-5 flex gap-3">
        <Button fullWidth onClick={onEnter}>
          ENTRAR
        </Button>
        {onDetails && (
          <Button variant="secondary" onClick={onDetails}>
            Ficha
          </Button>
        )}
      </div>
    </Card>
  );
}
