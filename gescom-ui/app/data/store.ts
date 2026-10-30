// Almacén de datos SIN React: funciones normales de JavaScript.
//  - loadData / saveData: leen y guardan en localStorage (con los datos de ejemplo como punto de partida).
//  - Las funciones de cambio reciben el estado actual y devuelven [estadoNuevo, resultado]; no modifican nada.
// Los hooks useData y useAuth (carpeta hooks) las usan con useState.
import type { Community, CommunityUser, Incidence, IncidenceComment, IncidencePicture, Property, RoleKind, RoleRecord, User } from "~/types";
import { addDays, toInputDate, toTimestamp } from "~/utils/formatDate";
import { isCurrent } from "~/utils/roles";
import { MAX_INCIDENCE_PICTURES } from "./labels";
import { seedState, type DataState } from "./seed";

/* ------------------------------ localStorage ------------------------------ */

// v3: las fotos ya no tienen campo sortOrder (se ordenan por pictureId); los datos guardados con v1 y v2 se descartan
const DATA_KEY = "gescom-data-v3";
const SESSION_KEY = "gescom-session";

export type Session = { userId: number | null; communityId: number | null };

export function loadData(): DataState {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (saved) return JSON.parse(saved) as DataState;
  } catch {
    // datos dañados o sin localStorage: se usan los de ejemplo
  }
  return seedState;
}

export function saveData(data: DataState) {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch {
    // sin espacio o bloqueado
  }
}

export function resetData() {
  try {
    localStorage.removeItem(DATA_KEY);
  } catch {
    // nada que hacer
  }
}

export function loadSession(): Session {
  try {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) return JSON.parse(saved) as Session;
  } catch {
    // sesión dañada: se parte sin sesión
  }
  return { userId: null, communityId: null };
}

export function saveSession(session: Session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // sin espacio o bloqueado
  }
}

/**
 * Vuelca en el almacén local la identidad que devuelve el back (usuario + cargo en cada comunidad),
 * para que el resto de pantallas, que todavía leen en local, sepan quién es y qué cargo tiene.
 */
export function applyIdentity(
  data: DataState,
  identity: { user: Omit<User, "password">; communities: { communityId: number; name: string; role: string; roleStartDate: string | null; roleEndDate: string | null }[] },
): DataState {
  const { user, communities } = identity;
  const id = user.userId;
  const day = toInputDate();
  const residentRole = communities.find((c) => c.role === "owner" || c.role === "tenant")?.role;
  const full: User = { ...user, password: "", residentType: residentRole === "owner" ? 1 : residentRole === "tenant" ? 2 : user.residentType };

  const nextId = (rows: RoleRecord[]) => rows.reduce((m, r) => Math.max(m, r.id), 0) + 1;
  const roles: Record<RoleKind, RoleRecord[]> = {
    administrator: data.administrators.filter((r) => r.userId !== id),
    president: data.presidents.filter((r) => r.userId !== id),
    caretaker: data.caretakers.filter((r) => r.userId !== id),
  };
  const knownCommunities = [...data.communities];
  const membership = data.communitiesUsers.filter((m) => m.userId !== id);
  let membershipId = membership.reduce((m, r) => Math.max(m, r.communityUserId), 0) + 1;

  for (const c of communities) {
    if (!knownCommunities.some((k) => k.communityId === c.communityId)) {
      knownCommunities.push({ communityId: c.communityId, name: c.name, nif: "", type: 1, address: "", zipCode: "", cityId: 1, isDeleted: false, registrationCode: "" });
    }
    if (user.type !== 1) {
      membership.push({ communityUserId: membershipId++, communityId: c.communityId, userId: id, moveInDate: c.roleStartDate ?? day, moveOutDate: null });
    }
    if (c.role === "administrator" || c.role === "president" || c.role === "caretaker") {
      roles[c.role].push({ id: nextId(roles[c.role]), communityId: c.communityId, userId: id, startDate: c.roleStartDate ?? day, endDate: c.roleEndDate });
    }
  }

  const users = data.users.some((u) => u.userId === id) ? data.users.map((u) => (u.userId === id ? full : u)) : [...data.users, full];
  return { ...data, users, communities: knownCommunities, communitiesUsers: membership, administrators: roles.administrator, presidents: roles.president, caretakers: roles.caretaker };
}

/* ------------------------------ UUID sencillo ------------------------------ */

/** Código de registro de una comunidad (en producción lo genera la base de datos con gen_random_uuid()). */
export function generateUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === "x" ? r : (r % 4) + 8).toString(16);
  });
}

/* ------------------------------ Cambios de datos ------------------------------ */

export type Change<R = void> = (data: DataState) => [DataState, R];

export type NewUserInput = Omit<User, "userId" | "type" | "isValidated" | "isActive" | "isDisabled">;
export type NewCommunityInput = Omit<Community, "communityId" | "isDeleted" | "registrationCode">;
export type NewPropertyInput = Omit<Property, "propertyId" | "communityId">;
export type NewIncidenceInput = Pick<
  Incidence,
  "communityId" | "propertyId" | "reportedByUserId" | "name" | "priority" | "description"
>;

const nextId = <T>(rows: T[], pick: (row: T) => number) => rows.reduce((max, r) => Math.max(max, pick(r)), 0) + 1;

const tableOf = { administrator: "administrators", president: "presidents", caretaker: "caretakers" } as const;
const KINDS: RoleKind[] = ["administrator", "president", "caretaker"];

/** Crea la incidencia y sus fotos (como mucho MAX_INCIDENCE_PICTURES, en el orden recibido). */
export const createIncidence: (input: NewIncidenceInput, pictures: string[]) => Change<number> = (input, pictures) => (data) => {
  const incidenceId = nextId(data.incidences, (i) => i.incidenceId);
  const createdDate = toTimestamp();
  const incidence: Incidence = { ...input, incidenceId, status: 1, createdDate, maxResolutionDate: null };
  let pictureId = nextId(data.incidencePictures, (p) => p.pictureId);
  const newPictures: IncidencePicture[] = pictures
    .slice(0, MAX_INCIDENCE_PICTURES)
    .map((url) => ({ pictureId: pictureId++, incidenceId, url, createdDate }));
  return [
    { ...data, incidences: [...data.incidences, incidence], incidencePictures: [...data.incidencePictures, ...newPictures] },
    incidenceId,
  ];
};

export const updateIncidence: (id: number, changes: Partial<Incidence>) => Change = (id, changes) => (data) => [
  { ...data, incidences: data.incidences.map((i) => (i.incidenceId === id ? { ...i, ...changes } : i)) },
  undefined,
];

export const addComment: (incidenceId: number, userId: number, text: string) => Change = (incidenceId, userId, text) => (data) => {
  const comment: IncidenceComment = {
    commentId: nextId(data.comments, (c) => c.commentId),
    incidenceId,
    userId,
    comment: text.trim(),
    createdDate: toTimestamp(),
  };
  return [{ ...data, comments: [...data.comments, comment] }, undefined];
};

export const updateUser: (userId: number, changes: Partial<User>) => Change = (userId, changes) => (data) => [
  { ...data, users: data.users.map((u) => (u.userId === userId ? { ...u, ...changes } : u)) },
  undefined,
];

/**
 * Cierra (end_date = el día anterior a `from`) los cargos vigentes que cumplan `match`.
 * Si el cargo empezó ese mismo día (o después) no puede terminar antes de empezar, y dejarlo con fin = inicio lo
 * mantendría vigente ese día (dos titulares a la vez): en ese caso se elimina, porque no llegó a ejercerse.
 */
function closeRoles(data: DataState, communityId: number, from: string, match: (r: RoleRecord, kind: RoleKind) => boolean): DataState {
  const next = { ...data };
  const today = toInputDate();
  KINDS.forEach((kind) => {
    next[tableOf[kind]] = data[tableOf[kind]].flatMap((r) => {
      if (r.communityId !== communityId || !isCurrent(r, today) || !match(r, kind)) return [r];
      if (r.startDate >= from) return [];
      return [{ ...r, endDate: addDays(from, -1) }];
    });
  });
  return next;
}

/**
 * Asigna (o quita, si kind es null) el cargo de un usuario en una comunidad:
 *  - un usuario tiene un solo cargo por comunidad, así que se cierra el que tuviera;
 *  - administrador, presidente y conserje son cargos de una sola persona a la vez,
 *    así que se cierra el del titular anterior.
 */
function applyRole(data: DataState, communityId: number, userId: number, kind: RoleKind | null, startDate: string, endDate: string | null): DataState {
  let next = closeRoles(data, communityId, kind ? startDate : toInputDate(), (r) => r.userId === userId);
  if (kind) {
    next = closeRoles(next, communityId, startDate, (_r, k) => k === kind);
    const key = tableOf[kind];
    const record: RoleRecord = { id: nextId(next[key], (r) => r.id), communityId, userId, startDate, endDate };
    next = { ...next, [key]: [...next[key], record] };
  }
  return next;
}

export const assignRole: (userId: number, communityId: number, kind: RoleKind | null, startDate: string, endDate: string | null) => Change =
  (userId, communityId, kind, startDate, endDate) => (data) => [applyRole(data, communityId, userId, kind, startDate, endDate), undefined];

/** Registro desde la URL de la comunidad: usuario sin validar + vínculo con la comunidad. */
export const registerUser: (input: NewUserInput, communityId: number) => Change<number> = (input, communityId) => (data) => {
  const userId = nextId(data.users, (u) => u.userId);
  const user: User = { ...input, userId, type: 2, isValidated: false, isActive: true, isDisabled: false };
  const link: CommunityUser = {
    communityUserId: nextId(data.communitiesUsers, (r) => r.communityUserId),
    communityId,
    userId,
    moveInDate: toInputDate(),
    moveOutDate: null,
  };
  return [{ ...data, users: [...data.users, user], communitiesUsers: [...data.communitiesUsers, link] }, userId];
};

/** Alta hecha por el superadmin: usuario ya validado, con cargo opcional. */
export const createUser: (
  input: NewUserInput,
  communityId: number,
  kind: RoleKind | null,
  startDate: string,
  endDate: string | null,
  userIdFromBack?: number,
) => Change<number> =
  (input, communityId, kind, startDate, endDate, userIdFromBack) => (data) => {
    // Con back, el id es el de la base de datos (si no, los cambios posteriores irían a otro usuario)
    const userId = userIdFromBack ?? nextId(data.users, (u) => u.userId);
    const user: User = { ...input, userId, type: 2, isValidated: true, isActive: true, isDisabled: false };
    let next: DataState = { ...data, users: [...data.users, user] };
    // quien tiene vivienda (propietario/inquilino) además es residente de la comunidad
    if (input.residentType) {
      const link: CommunityUser = {
        communityUserId: nextId(data.communitiesUsers, (r) => r.communityUserId),
        communityId,
        userId,
        moveInDate: toInputDate(),
        moveOutDate: null,
      };
      next = { ...next, communitiesUsers: [...next.communitiesUsers, link] };
    }
    if (kind) next = applyRole(next, communityId, userId, kind, startDate, endDate);
    return [next, userId];
  };

export const addCommunity: (input: NewCommunityInput, properties: NewPropertyInput[]) => Change<number> = (input, properties) => (data) => {
  const communityId = nextId(data.communities, (c) => c.communityId);
  let propertyId = nextId(data.properties, (p) => p.propertyId);
  const community: Community = { ...input, communityId, isDeleted: false, registrationCode: generateUuid() };
  const newProperties: Property[] = properties.map((p) => ({ ...p, propertyId: propertyId++, communityId }));
  return [{ ...data, communities: [...data.communities, community], properties: [...data.properties, ...newProperties] }, communityId];
};

export const updateCommunity: (communityId: number, changes: Partial<Community>) => Change = (communityId, changes) => (data) => [
  { ...data, communities: data.communities.map((c) => (c.communityId === communityId ? { ...c, ...changes } : c)) },
  undefined,
];

export const addProperty: (communityId: number, input: NewPropertyInput) => Change<number> = (communityId, input) => (data) => {
  const propertyId = nextId(data.properties, (p) => p.propertyId);
  return [{ ...data, properties: [...data.properties, { ...input, propertyId, communityId }] }, propertyId];
};
