// Datos de ejemplo cargados desde los JSON generados a partir de
// gescom_datos_ejemplo.sql y gescom_tablas.sql (provincias y ciudades).
import type {
  City, Community, CommunityUser, Incidence, IncidenceComment, IncidencePicture, Property, Province, RoleRecord, User,
} from "~/types";

import usersJson from "./users.json";
import communitiesJson from "./communities.json";
import propertiesJson from "./properties.json";
import communitiesUsersJson from "./communities_users.json";
import administratorsJson from "./communities_administrators.json";
import presidentsJson from "./communities_presidents.json";
import caretakersJson from "./communities_caretakers.json";
import incidencesJson from "./incidences.json";
import commentsJson from "./incidence_comments.json";
import picturesJson from "./incidence_pictures.json";
import provincesJson from "./provinces.json";
import citiesJson from "./cities.json";

// Catálogos fijos (no cambian durante la sesión)
export const provinces = provincesJson as Province[];
export const cities: City[] = (citiesJson as [number, number, string][]).map(
  ([cityId, provinceId, name]) => ({ cityId, provinceId, name }),
);

export type DataState = {
  users: User[];
  communities: Community[];
  properties: Property[];
  communitiesUsers: CommunityUser[];
  administrators: RoleRecord[];
  presidents: RoleRecord[];
  caretakers: RoleRecord[];
  incidences: Incidence[];
  comments: IncidenceComment[];
  incidencePictures: IncidencePicture[];
};

// Las tablas de cargos usan un id distinto en cada tabla; aquí se unifican en "id"
const toRoles = (rows: Record<string, unknown>[], idKey: string): RoleRecord[] =>
  rows.map((r) => ({
    id: r[idKey] as number,
    communityId: r.communityId as number,
    userId: r.userId as number,
    startDate: r.startDate as string,
    endDate: (r.endDate as string | null) ?? null,
  }));

export const seedState: DataState = {
  users: usersJson as User[],
  communities: communitiesJson as Community[],
  properties: propertiesJson as Property[],
  communitiesUsers: communitiesUsersJson as CommunityUser[],
  administrators: toRoles(administratorsJson, "communityAdministratorId"),
  presidents: toRoles(presidentsJson, "communityPresidentId"),
  caretakers: toRoles(caretakersJson, "communityCaretakerId"),
  incidences: incidencesJson as Incidence[],
  comments: commentsJson as IncidenceComment[],
  incidencePictures: picturesJson as IncidencePicture[],
};
