import FieldShell, { controlClasses, fieldId } from "./FieldShell";

type TextAreaFieldProps = React.ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
};

export default function TextAreaField({ label, error, hint, wrapperClassName, className = "", ...rest }: TextAreaFieldProps) {
  const id = fieldId(label, rest.name, rest.id);
  return (
    <FieldShell id={id} label={label} error={error} hint={hint} className={wrapperClassName}>
      <textarea
        {...rest}
        id={id}
        rows={5}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${controlClasses(error)} resize-y ${className}`}
      />
    </FieldShell>
  );
}
