import type { Option } from "./SelectField";

type SegmentedFieldProps = {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
  className?: string;
};

/** Grupo de opciones excluyentes con aspecto de botones (relación con la vivienda, prioridad...). */
export default function SegmentedField({ label, value, options, onChange, error, className = "" }: SegmentedFieldProps) {
  return (
    <div className={className} role="radiogroup" aria-label={label}>
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "border-brand-green bg-brand-green text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
