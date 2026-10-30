type FieldShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
};

/** Etiqueta + control + mensaje de error/ayuda. Lo usan todos los campos del formulario. */
export default function FieldShell({ id, label, error, hint, children, className = "" }: FieldShellProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
    </div>
  );
}

export const controlClasses = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none disabled:bg-gray-50 disabled:text-gray-500 ${
    error ? "border-red-400 focus:border-red-500" : "border-gray-300 focus:border-brand-green"
  }`;

/**
 * Identificador que une la etiqueta con su campo (<label htmlFor> ↔ <input id>).
 * Sale del `id` o del `name` si se indican y, si no, del texto de la etiqueta.
 */
export const fieldId = (label: string, name?: string, id?: string) =>
  id ?? name ?? `campo-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
