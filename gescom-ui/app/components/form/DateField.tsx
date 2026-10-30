import TextField from "./TextField";

type DateFieldProps = Omit<React.ComponentPropsWithoutRef<typeof TextField>, "type">;

/** Campo de fecha (input type="date"): el valor es "YYYY-MM-DD". */
export default function DateField(props: DateFieldProps) {
  return <TextField type="date" {...props} />;
}
