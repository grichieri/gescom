import FieldShell, { controlClasses, fieldId } from "./FieldShell";

export type Option = { value: string; label: string };

type SelectFieldProps = React.ComponentPropsWithoutRef<"select"> & {
  label: string;
  options: Option[];
  /** Texto de la primera opción vacía; si no se indica, no hay opción vacía */
  placeholder?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export default function SelectField({ label, options, placeholder, error, hint, wrapperClassName, className = "", ...rest }: SelectFieldProps) {
  const id = fieldId(label, rest.name, rest.id);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <select
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClasses(error)} ${className}`}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
