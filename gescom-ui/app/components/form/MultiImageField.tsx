import { useState } from "react";
import Icon from "~/components/ui/Icon";
import { readImage } from "~/utils/images";

type MultiImageFieldProps = {
  label: string;
  /** Imágenes ya elegidas (cada una como "data:image/...") */
  images: string[];
  onChange: (images: string[]) => void;
  /** Máximo de imágenes */
  max: number;
  hint?: string;
};

const MAX_SIZE = 800; // lado máximo en píxeles: así 5 fotos caben de sobra en localStorage
const MAX_BYTES = 10 * 1024 * 1024;

/**
 * Selector de varias imágenes con miniaturas. Se pueden elegir varias a la vez, añadir más
 * después (hasta `max`) y quitar cada una por separado. Cuando se llega al máximo desaparece el botón de añadir.
 */
export default function MultiImageField({ label, images, onChange, max, hint }: MultiImageFieldProps) {
  const [error, setError] = useState("");
  // Cambiar la `key` del <input> lo recrea vacío, así se puede volver a elegir el mismo archivo
  const [inputKey, setInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const free = max - images.length;

  const pick = (list: FileList | null) => {
    setInputKey((k) => k + 1);
    const files = Array.from(list ?? []);
    if (files.length === 0) return;

    const messages: string[] = [];
    const valid = files.filter((f) => {
      if (!f.type.startsWith("image/")) {
        messages.push(`«${f.name}» no es una imagen.`);
        return false;
      }
      if (f.size > MAX_BYTES) {
        messages.push(`«${f.name}» supera los 10 MB.`);
        return false;
      }
      return true;
    });
    if (valid.length > free) messages.push(`Solo se pueden adjuntar ${max} fotos: se han añadido las ${free} primeras.`);
    const chosen = valid.slice(0, free);
    setError(messages.join(" "));
    if (chosen.length === 0) return;

    setLoading(true);
    Promise.all(chosen.map((f) => readImage(f, MAX_SIZE, 0.7))).then(
      (added) => {
        setLoading(false);
        onChange([...images, ...added]);
      },
      () => {
        setLoading(false);
        setError("No se ha podido leer alguna de las imágenes.");
      },
    );
  };

  const remove = (index: number) => {
    setError("");
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
        <p className="text-xs text-gray-500" aria-live="polite">
          {images.length} de {max}
        </p>
      </div>
      {hint && <p className="mb-2 text-xs text-gray-500">{hint}</p>}

      <ul className="flex flex-wrap gap-3">
        {images.map((src, index) => (
          <li key={index} className="relative h-20 w-20">
            <img src={src} alt={`Foto ${index + 1}`} className="h-20 w-20 rounded-lg border border-gray-200 object-cover" />
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Quitar la foto ${index + 1}`}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow hover:bg-red-700"
            >
              <Icon name="close" className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
        {free > 0 && (
          <li>
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs font-bold text-brand-green hover:bg-brand-bg">
              <Icon name="camera" />
              {loading ? "Cargando…" : "Añadir foto"}
              <input
                key={inputKey}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={loading}
                onChange={(e) => pick(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
