import type { RoleKind, User } from "~/types";
import type { NewUserInput } from "~/data/store";
import { getToken, jsonBody, request } from "./client";

/** Usuario tal como lo devuelve el back (nunca trae la contraseña). */
export type ApiUser = Omit<User, "password">;

/* ------------------------------ Foto de perfil ------------------------------
 * La foto se elige en el navegador como "data:image/..." y se sube al back con
 * POST /api/users/{id}/avatar (multipart, parte "avatar"). Esa ruta pide token, así que cuando alguien
 * se registra por su cuenta (aún sin sesión) la foto se guarda y se sube en su primer login.
 */

const PENDING_AVATAR_KEY = "gescom-pending-avatar";

const isDataImage = (value: string | null | undefined): value is string => !!value && value.startsWith("data:image/");

function dataUrlToBlob(dataUrl: string): Blob {
  const [head, body] = dataUrl.split(",");
  const type = /data:([^;]+)/.exec(head)?.[1] ?? "image/jpeg";
  const bytes = atob(body);
  const buffer = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buffer[i] = bytes.charCodeAt(i);
  return new Blob([buffer], { type });
}

/** POST /api/users/{id}/avatar: devuelve el usuario con la URL de la foto (/upload/avatares/...). */
export async function uploadAvatar(userId: number, dataUrl: string): Promise<ApiUser> {
  const form = new FormData();
  form.append("avatar", dataUrlToBlob(dataUrl), "avatar.jpg");
  return request<ApiUser>(`/api/users/${userId}/avatar`, { method: "POST", body: form });
}

function setPendingAvatar(email: string, dataUrl: string) {
  try {
    localStorage.setItem(`${PENDING_AVATAR_KEY}:${email.toLowerCase()}`, dataUrl);
  } catch {
    // sin espacio: se registra sin foto
  }
}

/** Tras el login: si quedó una foto pendiente de ese correo, la sube. Un fallo no impide entrar. */
export async function flushPendingAvatar(email: string, userId: number): Promise<boolean> {
  const key = `${PENDING_AVATAR_KEY}:${email.toLowerCase()}`;
  try {
    const pending = localStorage.getItem(key);
    if (!pending) return false;
    await uploadAvatar(userId, pending);
    localStorage.removeItem(key);
    return true;
  } catch {
    return false; // se reintentará en el siguiente login
  }
}

/** Respuesta del registro. `emailVerificationRequired` dice en qué modo está el back (MAIL_ENABLED). */
export type RegistrationResult = { userId: number; email: string; emailVerificationRequired: boolean };

/** GET /api/register/{code}: nombre de la comunidad a la que da acceso el código (404 si no existe). */
export function fetchRegistrationInfo(registrationCode: string): Promise<{ communityId: number; name: string }> {
  return request(`/api/register/${encodeURIComponent(registrationCode)}`);
}

/**
 * POST /api/register/{code}: crea el usuario y lo vincula a la comunidad del código.
 * Por defecto queda sin validar (registro propio); el superadmin lo da de alta ya validado (`validated: true`).
 * El avatar no se envía todavía (el back lo hará por multipart más adelante).
 */
export async function registerUser(registrationCode: string, input: NewUserInput, validated = false): Promise<RegistrationResult> {
  const result = await request<RegistrationResult>(
    `/api/register/${encodeURIComponent(registrationCode)}`,
    jsonBody("POST", {
      name: input.name,
      lastname: input.lastname,
      type: 2,
      residentType: input.residentType,
      avatar: null, // la foto va aparte (uploadAvatar)
      dni: input.dni,
      phoneNumber: input.phoneNumber,
      isValidated: validated,
      isActive: true,
      isDisabled: false,
      email: input.email,
      password: input.password,
      address: input.address,
      zipCode: input.zipCode,
      cityId: input.cityId,
    }),
  );
  // Foto: con sesión (alta hecha por un administrador) se sube ya; sin sesión, se sube en el primer login
  if (isDataImage(input.avatar)) {
    if (getToken()) await uploadAvatar(result.userId, input.avatar).catch(() => undefined);
    else setPendingAvatar(input.email, input.avatar);
  }
  return result;
}

/**
 * POST /api/communities/{id}/users: alta hecha por la administración. El usuario queda ya validado, vinculado a la
 * comunidad y con el cargo pedido (opcional). Con el correo activado, el back le manda un correo de bienvenida con un
 * enlace para que defina su propia contraseña. Devuelve el usuario creado (con el userId de la base de datos).
 */
export async function createMember(
  communityId: number,
  input: NewUserInput,
  role: RoleKind | null,
  roleStartDate: string | null,
  roleEndDate: string | null,
): Promise<ApiUser> {
  const created = await request<ApiUser>(
    `/api/communities/${communityId}/users`,
    jsonBody("POST", {
      user: {
        name: input.name,
        lastname: input.lastname,
        type: 2,
        residentType: input.residentType,
        avatar: null, // la foto va aparte (uploadAvatar)
        dni: input.dni,
        phoneNumber: input.phoneNumber,
        isActive: true,
        isDisabled: false,
        email: input.email,
        password: input.password,
        address: input.address,
        zipCode: input.zipCode,
        cityId: input.cityId,
      },
      role,
      roleStartDate: role ? roleStartDate : null,
      roleEndDate: role ? roleEndDate : null,
    }),
  );
  if (isDataImage(input.avatar)) await uploadAvatar(created.userId, input.avatar).catch(() => undefined);
  return created;
}

/**
 * PUT /api/communities/{id}/users/{userId}/role: cambia el cargo de un usuario en la comunidad.
 * role = null le quita el cargo. El back cierra el cargo anterior del usuario y el del titular anterior de ese cargo.
 */
export async function changeRole(
  communityId: number,
  userId: number,
  role: RoleKind | null,
  startDate: string,
  endDate: string | null,
): Promise<void> {
  await request<void>(`/api/communities/${communityId}/users/${userId}/role`, jsonBody("PUT", { role, startDate, endDate }));
}

/**
 * PUT /api/users/{id}: el back espera el usuario completo (sin contraseña ni userId).
 * Una foto nueva ("data:image/...") se sube después con uploadAvatar; en el PUT se envía el avatar que ya tenía el back.
 */
export async function updateUser(user: User, changes: Partial<User>): Promise<ApiUser> {
  const { userId, password: _password, ...rest } = { ...user, ...changes };
  const avatar = rest.avatar?.startsWith("data:") ? (user.avatar?.startsWith("data:") ? null : user.avatar) : rest.avatar;
  const saved = await request<ApiUser>(`/api/users/${userId}`, jsonBody("PUT", { ...rest, avatar }));
  return isDataImage(changes.avatar) ? uploadAvatar(userId, changes.avatar) : saved;
}
