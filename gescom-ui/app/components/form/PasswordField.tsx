import { useState } from "react";
import FieldShell, { controlClasses, fieldId } from "./FieldShell";

type PasswordFieldProps = Omit<React.ComponentPropsWithoutRef<"input">, "type"> & {
  label: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  /** Contenido a la derecha de la etiqueta (por ejemplo "¿La olvidaste?") */
  labelAction?: React.ReactNode;
};

export default function PasswordField({ label, error, hint, wrapperClassName, labelAction, className = "", ...rest }: PasswordFieldProps) {
  const id = fieldId(label, rest.name, rest.id);
  const [visible, setVisible] = useState(false);
  return (
    <div className={wrapperClassName}>
      {labelAction && <div className="-mb-1 flex justify-end text-xs">{labelAction}</div>}
      <FieldShell id={id} label={label} error={error} hint={hint}>
        <div className="relative">
          <input
            id={id}
            type={visible ? "text" : "password"}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`${controlClasses(error)} pr-16 ${className}`}
            {...rest}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-green"
          >
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </FieldShell>
    </div>
  );
}
