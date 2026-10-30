// Cliente HTTP común para hablar con el backend (Spring Boot).
// La URL base sale de VITE_API_URL (archivo .env); si no existe, se usa el Spring local.

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/** Error de una llamada: el estado HTTP (0 = no hubo respuesta) y el mensaje listo para mostrar. */
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/* ------------------------------ Token de sesión ------------------------------ */

const TOKEN_KEY = "gescom-token";
const NOTICE_KEY = "gescom-notice";
const SESSION_KEY = "gescom-session";
/** Evento que se lanza cuando el back rechaza el token (caducado o inválido) */
export const UNAUTHORIZED_EVENT = "gescom-unauthorized";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // sin localStorage no hay sesión que conservar
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // nada que hacer
  }
}

/** Aviso que se enseña en el login (por ejemplo, "Tu sesión ha caducado"). Se lee una sola vez. */
export function setNotice(text: string) {
  try {
    sessionStorage.setItem(NOTICE_KEY, text);
  } catch {
    // no es imprescindible
  }
}

export function takeNotice(): string {
  try {
    const text = sessionStorage.getItem(NOTICE_KEY) ?? "";
    sessionStorage.removeItem(NOTICE_KEY);
    return text;
  } catch {
    return "";
  }
}

const authHeaders = (): Record<string, string> => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** Rutas que no llevan token: un 401 ahí significa "credenciales incorrectas", no "sesión caducada". */
const PUBLIC_PATHS = [
  "/user/auth/login",
  "/user/auth/verify-email",
  "/user/auth/resend-verification",
  "/user/auth/forgot-password",
  "/user/auth/reset-password",
  "/api/register/",
];
const isPublicPath = (path: string) => PUBLIC_PATHS.some((p) => path.startsWith(p));

/**
 * El back responde con JSON ({"mensaje": "..."}) en el login y en los 401, y con texto plano
 * ("Error: Ya existe un usuario con ese email") en el resto: se admiten los dos y se quita el prefijo.
 */
function cleanMessage(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    try {
      const json = JSON.parse(trimmed) as Record<string, unknown>;
      for (const key of ["mensaje", "message", "error", "detail"]) {
        if (typeof json[key] === "string" && json[key]) return (json[key] as string).replace(/^Error:\s*/, "").trim();
      }
    } catch {
      // no era JSON válido: se trata como texto
    }
  }
  return trimmed.replace(/^Error:\s*/, "");
}

/** Token rechazado: se borra la sesión y se avisa a la pantalla para que vuelva al login. */
function handleUnauthorized() {
  clearToken();
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // nada que hacer
  }
  setNotice("Tu sesión ha caducado. Vuelve a iniciar sesión.");
  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}

const FALLBACK_MESSAGES: Record<number, string> = {
  401: "Correo o contraseña incorrectos.",
  403: "No tienes permiso para hacer esto.",
  400: "Hay datos que el servidor no ha aceptado.",
  404: "No se ha encontrado lo que se pedía.",
  409: "Ya existe un registro con esos datos.",
  500: "Error interno del servidor. Inténtalo más tarde.",
};

/** Llama al back y devuelve el JSON de la respuesta (o undefined si no hay cuerpo). */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers: { ...authHeaders(), ...init.headers } });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. Comprueba que está en marcha e inténtalo de nuevo.");
  }
  if (!response.ok) {
    if (response.status === 401 && !isPublicPath(path)) handleUnauthorized();
    const text = await response.text().catch(() => "");
    throw new ApiError(response.status, cleanMessage(text) || FALLBACK_MESSAGES[response.status] || `Error ${response.status}`);
  }
  const body = await response.text();
  return (body ? JSON.parse(body) : undefined) as T;
}

/** Opciones para enviar un cuerpo JSON. */
export const jsonBody = (method: "POST" | "PUT", body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

/** Las fotos pueden llegar como URL completa (Cloudinary) o como ruta del servidor (/upload/...). */
export const fileUrl = (url: string) => (/^(https?:|data:)/.test(url) ? url : `${API_URL}${url}`);
