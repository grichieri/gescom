import { useState } from "react";

type Errors<T> = Partial<Record<keyof T, string>>;
type TextKeys<T> = { [K in keyof T]: T[K] extends string ? K : never }[keyof T];
type BoolKeys<T> = { [K in keyof T]: T[K] extends boolean ? K : never }[keyof T];

export type FormApi<T> = {
  values: T;
  /** Props listas para un campo de texto: <TextField {...form.field("name")} /> */
  field: (name: TextKeys<T> & string) => {
    name: string;
    value: string;
    error: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  };
  /** Props para un checkbox */
  checkbox: (name: BoolKeys<T> & string) => {
    name: string;
    checked: boolean;
    error: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  setValues: (changes: Partial<T>) => void;
  /** Valida y, solo si no hay errores, llama a onValid con los valores */
  submit: (onValid: (values: T) => void) => void;
  /** Igual que submit, pero como manejador del evento onSubmit de un <form> */
  handleSubmit: (onValid: (values: T) => void) => (e: React.FormEvent<HTMLFormElement>) => void;
  reset: () => void;
};

/**
 * Hook personalizado para formularios controlados.
 * Los errores se muestran después del primer intento de envío.
 */
export function useForm<T extends Record<string, string | boolean | string[]>>(
  initial: T,
  validate: (values: T) => Errors<T>,
): FormApi<T> {
  const [values, setValuesState] = useState<T>(initial);
  const [submitted, setSubmitted] = useState(false);

  // Se recalcula en cada render: es un dato derivado, no estado
  const errors = validate(values);
  const visible = (name: keyof T) => (submitted && errors[name] ? errors[name] : undefined);

  const setValue = <K extends keyof T>(name: K, value: T[K]) =>
    setValuesState((prev) => ({ ...prev, [name]: value }));

  const setValues = (changes: Partial<T>) => setValuesState((prev) => ({ ...prev, ...changes }));

  const submit = (onValid: (values: T) => void) => {
    setSubmitted(true);
    const hasErrors = Object.values(errors).some((message) => message);
    if (!hasErrors) onValid(values);
  };

  return {
    values,
    field: (name) => ({
      name,
      value: values[name] as string,
      error: visible(name),
      onChange: (e) => setValue(name, e.target.value as T[typeof name]),
    }),
    checkbox: (name) => ({
      name,
      checked: values[name] as boolean,
      error: visible(name),
      onChange: (e) => setValue(name, e.target.checked as T[typeof name]),
    }),
    setValue,
    setValues,
    submit,
    handleSubmit: (onValid) => (e) => {
      e.preventDefault();
      submit(onValid);
    },
    reset: () => {
      setValuesState(initial);
      setSubmitted(false);
    },
  };
}
