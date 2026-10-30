import { fileUrl } from "~/api/client";
import antonio from "~/assets/avatars/antonio.jpg";
import carlos from "~/assets/avatars/carlos.jpg";
import elena from "~/assets/avatars/elena.jpg";
import laura from "~/assets/avatars/laura.jpg";

// users.avatar guarda una ruta ("avatars/laura.png"); aquí se asocia a las imágenes disponibles.
// Quien no tenga imagen se muestra con sus iniciales.
const files: Record<string, string> = {
  "avatars/antonio.png": antonio,
  "avatars/carlos.png": carlos,
  "avatars/elena.png": elena,
  "avatars/laura.png": laura,
};

// Las fotos pueden ser: texto "data:image/..." (recién elegida), una URL del back ("/upload/avatares/...") o una ruta de ejemplo
export const avatarSrc = (avatar: string | null): string | null => {
  if (!avatar) return null;
  if (avatar.startsWith("data:image/")) return avatar;
  if (avatar.startsWith("/upload/") || /^https?:/.test(avatar)) return fileUrl(avatar);
  return files[avatar] ?? null;
};
