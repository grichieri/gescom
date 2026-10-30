import { fieldId } from "./FieldShell";

type CheckboxFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  label: React.ReactNode;
  error?: string;
};

export default function CheckboxField({ label, error, className = "", ...rest }: CheckboxFieldProps) {
  const id = fieldId(typeof label === "string" ? label : "checkbox", rest.name, rest.id);
  return (
    <div>
      <div className="flex items-start gap-2">
        <input id={id} type="checkbox" className={`mt-0.5 h-4 w-4 rounded border-gray-300 accent-emerald-600 ${className}`} {...rest} />
        <label htmlFor={id} className="text-sm text-gray-600">
          {label}
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
