import type { CommunityRole, RoleKind, RoleRecord, User } from "~/types";
import type { DataState } from "~/data/seed";
import { toInputDate } from "./formatDate";

const ROLE_TABLE: Record<RoleKind, keyof DataState> = {
  administrator: "administrators",
  president: "presidents",
  caretaker: "caretakers",
};

/** Un cargo está vigente si ya empezó y no ha terminado (end_date NULL o futura). */
export function isCurrent(record: { startDate: string; endDate: string | null }, today = toInputDate()) {
  return record.startDate <= today && (record.endDate === null || record.endDate >= today);
}

export function roleRecords(data: DataState, kind: RoleKind): RoleRecord[] {
  return data[ROLE_TABLE[kind]] as RoleRecord[];
}

/** Titular vigente de un cargo en una comunidad (o undefined si no hay). */
export function currentHolder(data: DataState, kind: RoleKind, communityId: number): User | undefined {
  const record = roleRecords(data, kind).find((r) => r.communityId === communityId && isCurrent(r));
  return record ? data.users.find((u) => u.userId === record.userId) : undefined;
}

/** Cargo principal de un usuario en una comunidad. */
export function roleOf(data: DataState, user: User, communityId: number): CommunityRole {
  if (user.type === 1) return "superadmin";
  const has = (kind: RoleKind) =>
    roleRecords(data, kind).some((r) => r.communityId === communityId && r.userId === user.userId && isCurrent(r));
  if (has("administrator")) return "administrator";
  if (has("president")) return "president";
  if (has("caretaker")) return "caretaker";
  if (user.residentType === 1) return "owner";
  if (user.residentType === 2) return "tenant";
  return "none";
}

/** Quién puede gestionar incidencias (cambiar estado y escribir comentarios). */
export function canManage(role: CommunityRole): boolean {
  return role === "superadmin" || role === "administrator" || role === "president" || role === "caretaker";
}

/** Comunidades a las que pertenece un usuario (residente o con cargo vigente). */
export function communitiesOfUser(data: DataState, user: User): number[] {
  const active = data.communities.filter((c) => !c.isDeleted).map((c) => c.communityId);
  if (user.type === 1) return active;
  const ids = new Set<number>();
  data.communitiesUsers.forEach((r) => {
    if (r.userId === user.userId && r.moveOutDate === null) ids.add(r.communityId);
  });
  (["administrator", "president", "caretaker"] as RoleKind[]).forEach((kind) =>
    roleRecords(data, kind).forEach((r) => {
      if (r.userId === user.userId && isCurrent(r)) ids.add(r.communityId);
    }),
  );
  return active.filter((id) => ids.has(id));
}

/** Usuarios que forman parte de una comunidad ahora mismo. */
export function membersOfCommunity(data: DataState, communityId: number): User[] {
  const ids = new Set<number>();
  data.communitiesUsers.forEach((r) => {
    if (r.communityId === communityId && r.moveOutDate === null) ids.add(r.userId);
  });
  (["administrator", "president", "caretaker"] as RoleKind[]).forEach((kind) =>
    roleRecords(data, kind).forEach((r) => {
      if (r.communityId === communityId && isCurrent(r)) ids.add(r.userId);
    }),
  );
  return data.users.filter((u) => ids.has(u.userId));
}
