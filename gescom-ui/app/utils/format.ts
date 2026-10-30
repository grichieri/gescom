import type { Community, Incidence, Property, User } from "~/types";
import { cities, provinces } from "~/data/seed";
import { parseDate, toInputDate } from "./formatDate";

export const fullName = (u: Pick<User, "name" | "lastname">) => `${u.name} ${u.lastname}`;

/** #INC-2026-084 */
export const incidenceCode = (i: Incidence) =>
  `#INC-${parseDate(i.createdDate).getFullYear()}-${String(i.incidenceId).padStart(3, "0")}`;

/** COM-001 */
export const communityCode = (c: Community) => `COM-${String(c.communityId).padStart(3, "0")}`;

/** Vivienda tal como se muestra en toda la app: "Calle Mayor 45, 4º A - Portal 1". Sin propiedad, es la zona común. */
export const propertyLabel = (p: Property | undefined) =>
  p ? [p.address, p.blockPortal].filter(Boolean).join(" - ") : "Zona común";

/** Vivienda de un usuario: la propiedad de la lista cuya dirección es la suya (se guarda en users.address). */
export const propertyOfUser = (properties: Property[], user: Pick<User, "address">) =>
  user.address ? properties.find((p) => p.address === user.address) : undefined;

/** Sin resolver y con la fecha máxima ya pasada. */
export const isOverdue = (i: Incidence) =>
  i.status !== 3 && i.maxResolutionDate !== null && i.maxResolutionDate < toInputDate();

/** Cuenta incidencias por estado. */
export function countByStatus(incidences: Incidence[]) {
  return {
    pending: incidences.filter((i) => i.status === 1).length,
    inProgress: incidences.filter((i) => i.status === 2).length,
    resolved: incidences.filter((i) => i.status === 3).length,
  };
}

/** Más recientes primero. */
export const newestFirst = (a: Incidence, b: Incidence) => b.createdDate.localeCompare(a.createdDate);

/** Ciudad y provincia a partir de city_id. */
export function locationOf(cityId: number | null) {
  const city = cities.find((c) => c.cityId === cityId);
  const province = provinces.find((p) => p.provinceId === city?.provinceId);
  return { city, province, label: city ? `${city.name}${province ? `, ${province.name}` : ""}` : "—" };
}
