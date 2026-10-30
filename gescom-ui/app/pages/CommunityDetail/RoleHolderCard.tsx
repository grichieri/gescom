import Avatar from "~/components/ui/Avatar";
import Card from "~/components/ui/Card";
import type { User } from "~/types";
import { fullName } from "~/utils/format";

type RoleHolderCardProps = {
  title: string;
  holder: User | undefined;
  emptyText?: string;
};

/** Ficha de la persona que ocupa un cargo (administrador, presidente, conserje). */
export default function RoleHolderCard({ title, holder, emptyText = "Sin asignar" }: RoleHolderCardProps) {
  return (
    <Card title={title}>
      {holder ? (
        <div className="flex items-start gap-3">
          <Avatar user={holder} />
          <div className="min-w-0 text-sm">
            <p className="font-bold text-brand-dark">{fullName(holder)}</p>
            {holder.phoneNumber && <p className="text-gray-600">{holder.phoneNumber}</p>}
            <p className="truncate text-gray-600">{holder.email}</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500">{emptyText}</p>
      )}
    </Card>
  );
}
