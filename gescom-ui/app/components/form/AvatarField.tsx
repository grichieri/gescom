import { useState } from "react";
import Avatar from "~/components/ui/Avatar";
import Icon from "~/components/ui/Icon";
import { avatarSrc } from "~/utils/avatars";
import { readImage } from "~/utils/images";

type AvatarFieldProps = {
  label?: string;
  /** Imagen actual: una ruta de ejemplo ("avatars/laura.png"), una imagen ya cargada o "" si no hay */
  value: string;
  /** Nombre del usuario, para mostrar sus iniciales cuando no hay foto */
  name?: string;
  lastname?: string;
  onChange: (value: string) => void;
};

const MAX_SIZE = 256; // lado máximo en píxeles: así la imagen ocupa poco en localStorage
const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Selector de foto de perfil: muestra la foto actual (o las iniciales), permite subir otra
 * y quitarla. Hasta que exista el backend, la imagen se guarda en el navegador junto al resto de datos.
 */
export default function AvatarField({ label = "Foto de perfil", value, name = "", lastname = "", onChange }: AvatarFieldProps) {
  const [error, setError] = useState("");
  // Cambiar la `key` del <input> lo recrea vacío, así se puede volver a elegir el mismo archivo
  const [inputKey, setInputKey] = useState(0);
  const hasPhoto = avatarSrc(value) !== null;

  const pick = (file: File | undefined) => {
    setInputKey((k) => k + 1);
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("El archivo debe ser una imagen (JPG, PNG...).");
    if (file.size > MAX_BYTES) return setError("La imagen no puede superar los 5 MB.");
    setError("");
    readImage(file, MAX_SIZE, 0.85).then(onChange, () => setError("No se ha podido leer la imagen."));
  };

  return (
    <div>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex items-center gap-4">
        {hasPhoto || name || lastname ? (
          <Avatar user={{ name, lastname, avatar: value || null }} size="lg" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-gray-400">
            <Icon name="camera" />
          </div>
        )}
        <div className="text-sm">
          <label className="cursor-pointer font-bold text-brand-green hover:underline">
            {hasPhoto ? "Cambiar foto" : "Subir foto"}
            <input key={inputKey} type="file" accept="image/*" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {hasPhoto && (
            <p className="mt-0.5">
              <button type="button" onClick={() => onChange("")} className="text-red-500 hover:underline">
                Eliminar foto
              </button>
            </p>
          )}
          {error && (
            <p role="alert" className="mt-0.5 text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
