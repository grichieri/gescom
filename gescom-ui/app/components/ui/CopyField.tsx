import { useEffect, useState } from "react";
import Icon from "./Icon";

type CopyFieldProps = {
  id: string;
  label: string;
  value: string;
};

/** Campo de solo lectura con botón «Copiar» (copia al portapapeles). */
export default function CopyField({ id, label, value }: CopyFieldProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  // El aviso «Copiado» desaparece solo a los 2 segundos
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setFailed(false);
    } catch {
      setFailed(true); // sin permiso para el portapapeles: se puede copiar a mano
    }
  };

  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-gray-500">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-xs text-gray-700"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold text-brand-dark hover:bg-gray-50"
        >
          <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      {failed && <p className="mt-1 text-xs text-red-600">No se pudo copiar automáticamente: selecciona el texto y pulsa Ctrl+C.</p>}
    </div>
  );
}
