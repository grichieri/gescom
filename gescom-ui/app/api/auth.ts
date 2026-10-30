import type { CommunityRole } from "~/types";
import type { ApiUser } from "./users";
import { ApiError, clearToken, getToken, jsonBody, request, setToken } from "./client";

/* Login con token:
 *   1. POST /user/auth/login  → { mensaje, token }          (el back no devuelve el usuario ni el rol)
 *   2. GET  /user/auth/me     → { user, communities[] }     (quién soy y qué cargo tengo en cada comunidad)
 * Todas las demás llamadas llevan  Authorization: Bearer <token>  (lo añade client.ts).
 */

/** Cargo vigente del usuario en una comunidad */
export type IdentityCommunity = {
  communityId: number;
  name: string;
  role: CommunityRole;
  roleStartDate: string | null;
  roleEndDate: string | null;
};

export type Identity = { user: ApiUser; communities: IdentityCommunity[] };

/** POST /user/auth/login: guarda el token. Un 401/403 llega como ApiError con el mensaje del back. */
export async function loginRequest(email: string, password: string): Promise<void> {
  const res = await request<{ mensaje?: string; token?: string }>("/user/auth/login", jsonBody("POST", { email, password }));
  if (!res?.token) throw new ApiError(500, "El servidor no ha devuelto el token de sesión.");
  setToken(res.token);
}

/* ------------------------------ Identidad ------------------------------ */

/** El back (UserResponse) llama al estado validated/active/disabled; el resto de la app usa isValidated... */
function normalizeUser(raw: Record<string, unknown>): ApiUser {
  const flag = (a: string, b: string, fallback: boolean) => (typeof raw[a] === "boolean" ? (raw[a] as boolean) : typeof raw[b] === "boolean" ? (raw[b] as boolean) : fallback);
  return {
    userId: raw.userId as number,
    name: (raw.name as string) ?? "",
    lastname: (raw.lastname as string) ?? "",
    type: (raw.type as 1 | 2) ?? 2,
    residentType: (raw.residentType as 1 | 2 | null) ?? null,
    avatar: (raw.avatar as string | null) ?? null,
    dni: (raw.dni as string | null) ?? null,
    phoneNumber: (raw.phoneNumber as string | null) ?? null,
    isValidated: flag("isValidated", "validated", true),
    isActive: flag("isActive", "active", true),
    isDisabled: flag("isDisabled", "disabled", false),
    email: (raw.email as string) ?? "",
    address: (raw.address as string | null) ?? null,
    zipCode: (raw.zipCode as string | null) ?? null,
    cityId: (raw.cityId as number | null) ?? null,
  };
}

/** Correo del usuario, leído del token (el back guarda el email como "sub"). */
function emailFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(decodeURIComponent(escape(atob(payload)))) as { sub?: string };
    return json.sub ?? null;
  } catch {
    return null;
  }
}

const today = () => new Date().toISOString().slice(0, 10);
const isCurrent = (start: string | null, end: string | null) => (start === null || start <= today()) && (end === null || end >= today());
const RANK: CommunityRole[] = ["administrator", "president", "caretaker"];

/**
 * Identidad del usuario del token.
 * Camino bueno: GET /user/auth/me (el back resuelve usuario y cargos con una consulta).
 * Mientras ese endpoint no exista (404/405/501), se reconstruye con las rutas actuales de develop.
 * Un 401 sí se propaga: el token no vale.
 */
export async function fetchIdentity(): Promise<Identity> {
  try {
    const me = await request<{ user: Record<string, unknown>; communities?: Record<string, unknown>[] }>("/user/auth/me");
    return {
      user: normalizeUser(me.user),
      communities: (me.communities ?? []).map((c) => ({
        communityId: (c.communityId ?? c.community_id) as number,
        name: (c.name as string) ?? "",
        role: ((c.role as CommunityRole) ?? "none"),
        roleStartDate: (c.roleStartDate as string | null) ?? null,
        roleEndDate: (c.roleEndDate as string | null) ?? null,
      })),
    };
  } catch (e) {
    if (!(e instanceof ApiError) || ![403, 404, 405, 501].includes(e.status)) throw e;
    return identityFromCurrentRoutes();
  }
}

/** Alternativa temporal: /api/users + /api/communities + /api/communities/{id}/users. */
async function identityFromCurrentRoutes(): Promise<Identity> {
  const email = emailFromToken();
  if (!email) throw new ApiError(401, "No se pudo leer el usuario del token.");
  const users = await request<Record<string, unknown>[]>("/api/users");
  const raw = users.find((u) => String(u.email).toLowerCase() === email.toLowerCase());
  if (!raw) throw new ApiError(404, "No se ha encontrado tu usuario.");
  const user = normalizeUser(raw);

  const communities = await request<Record<string, unknown>[]>("/api/communities");
  const result: IdentityCommunity[] = [];
  for (const c of communities) {
    const communityId = (c.community_id ?? c.communityId) as number;
    const name = (c.name as string) ?? "";
    if (c.is_deleted === true || c.isDeleted === true) continue;
    if (user.type === 1) {
      result.push({ communityId, name, role: "superadmin", roleStartDate: null, roleEndDate: null });
      continue;
    }
    const members = await request<Record<string, unknown>[]>(`/api/communities/${communityId}/users`);
    const mine = members.filter((m) => m.userId === user.userId);
    if (mine.length === 0) continue;
    const current = mine.filter((m) => isCurrent((m.roleStartDate as string | null) ?? null, (m.roleEndDate as string | null) ?? null));
    const best = RANK.map((r) => current.find((m) => m.role === r)).find(Boolean);
    if (best) {
      result.push({ communityId, name, role: best.role as CommunityRole, roleStartDate: (best.roleStartDate as string | null) ?? null, roleEndDate: (best.roleEndDate as string | null) ?? null });
    } else if (user.residentType === 1 || user.residentType === 2) {
      result.push({ communityId, name, role: user.residentType === 1 ? "owner" : "tenant", roleStartDate: null, roleEndDate: null });
    }
  }
  return { user, communities: result };
}

export function logoutLocal() {
  clearToken();
}

/* ------------------------------ Verificación de correo y contraseña olvidada ------------------------------
 * Estas rutas son públicas (sin token). Las que dependen del correo devuelven `emailEnabled`:
 * false = el back está con MAIL_ENABLED=false y no ha enviado nada.
 */

type MailStatus = { mensaje?: string; emailEnabled?: boolean };

/** POST /user/auth/verify-email: el token viene en el enlace del correo (/account-activated?token=...). */
export async function verifyEmail(token: string): Promise<void> {
  await request("/user/auth/verify-email", jsonBody("POST", { token }));
}

/** POST /user/auth/resend-verification: reenvía el enlace (no revela si el correo existe). */
export function resendVerification(email: string): Promise<MailStatus | undefined> {
  return request("/user/auth/resend-verification", jsonBody("POST", { email }));
}

/** POST /user/auth/forgot-password: manda el enlace para elegir otra contraseña (no revela si el correo existe). */
export function forgotPassword(email: string): Promise<MailStatus | undefined> {
  return request("/user/auth/forgot-password", jsonBody("POST", { email }));
}

/** POST /user/auth/reset-password: el token viene en el enlace del correo (/reset-password?token=...). */
export async function resetPassword(token: string, password: string): Promise<void> {
  await request("/user/auth/reset-password", jsonBody("POST", { token, password }));
}
