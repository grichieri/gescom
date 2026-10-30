import FieldShell, { controlClasses, fieldId } from "./FieldShell";

type TextFieldProps = React.ComponentPropsWithoutRef<"input"> & {
  label: string;
  error?: string;
  hint?: string;
  /** Clases para el contenedor (por ejemplo, para el ancho en una rejilla) */
  wrapperClassName?: string;
};

export default function TextField({ label, error, hint, wrapperClassName, className = "", ...rest }: TextFieldProps) {
  const id = fieldId(label, rest.name, rest.id);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <input
        {...rest}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClasses(error)} ${className}`}
      />
    </FieldShell>
  );
}
