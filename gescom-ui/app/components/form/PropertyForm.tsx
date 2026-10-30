import { useForm } from "~/hooks/useForm";
import * as v from "~/utils/validation";
import Button from "~/components/ui/Button";
import FormActions from "./FormActions";
import TextField from "./TextField";

export type PropertyFormValues = { address: string; blockPortal: string; zipCode: string };

type PropertyFormProps = {
  /** Texto del botón principal */
  submitLabel: string;
  /** Si se indica, se muestra "Guardar y añadir otra propiedad" */
  addAnotherLabel?: string;
  /** Llamado con los datos válidos; `addAnother` indica que se pulsó el botón secundario */
  onSubmit: (values: PropertyFormValues, addAnother: boolean) => void;
  onCancel: () => void;
  defaultZipCode?: string;
};

/** Formulario de propiedad: lo usan la pantalla "Añadir propiedad" y el alta de comunidad. */
export default function PropertyForm({ submitLabel, addAnotherLabel, onSubmit, onCancel, defaultZipCode = "" }: PropertyFormProps) {
  const initial: PropertyFormValues = { address: "", blockPortal: "", zipCode: defaultZipCode };
  const form = useForm<PropertyFormValues>(initial, (values) => ({
    address: v.required(values.address, "La dirección"),
    zipCode: v.zipCode(values.zipCode),
  }));

  // addAnother indica qué botón se ha pulsado
  const save = (addAnother: boolean) => (values: PropertyFormValues) => {
    onSubmit(values, addAnother);
    form.reset();
  };

  return (
    <form onSubmit={form.handleSubmit(save(false))} noValidate>
      <div className="space-y-5">
        <TextField label="Dirección" placeholder="Ej: Calle del Roble 12, 2ºA" {...form.field("address")} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Bloque / portal" placeholder="Ej: Portal 1" {...form.field("blockPortal")} />
          <TextField label="Código postal" placeholder="28001" inputMode="numeric" maxLength={5} {...form.field("zipCode")} />
        </div>
      </div>
      <FormActions>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        {addAnotherLabel && (
          <Button variant="secondary" onClick={() => form.submit(save(true))}>
            {addAnotherLabel}
          </Button>
        )}
        <Button type="submit">{submitLabel}</Button>
      </FormActions>
    </form>
  );
}
