import * as v from "~/utils/validation";
import { RESIDENT_TYPE_LABELS } from "~/data/labels";
import AvatarField from "./AvatarField";
import SegmentedField from "./SegmentedField";
import TextField from "./TextField";
import CityProvinceFields from "./CityProvinceFields";

/** Campos personales que comparten el registro de vecinos y el alta de usuarios del superadmin. */
export type UserFormValues = {
  residentType: string; // "1" Propietario, "2" Inquilino
  avatar: string;
  name: string;
  lastname: string;
  dni: string;
  phoneNumber: string;
  email: string;
  address: string;
  zipCode: string;
  provinceId: string;
  cityId: string;
};

export const emptyUserForm: UserFormValues = {
  residentType: "1",
  avatar: "",
  name: "",
  lastname: "",
  dni: "",
  phoneNumber: "",
  email: "",
  address: "",
  zipCode: "",
  provinceId: "",
  cityId: "",
};

/**
 * `withLocation = false` es para el alta/edición del superadmin: allí la vivienda se elige de una lista
 * y la dirección, el código postal y la ciudad salen de ella, así que no se piden.
 */
export function validateUserForm(values: UserFormValues, addressRequired = true, withLocation = true) {
  if (!withLocation) {
    return {
      name: v.required(values.name, "El nombre"),
      lastname: v.required(values.lastname, "Los apellidos"),
      dni: v.dni(values.dni),
      phoneNumber: v.phone(values.phoneNumber),
      email: v.email(values.email),
      address: "",
      zipCode: "",
      provinceId: "",
      cityId: "",
    };
  }
  return {
    name: v.required(values.name, "El nombre"),
    lastname: v.required(values.lastname, "Los apellidos"),
    dni: v.dni(values.dni),
    phoneNumber: v.phone(values.phoneNumber),
    email: v.email(values.email),
    address: addressRequired ? v.required(values.address, "La dirección") : "",
    zipCode: v.zipCode(values.zipCode),
    provinceId: v.required(values.provinceId, "La provincia"),
    cityId: v.required(values.cityId, "La ciudad"),
  };
}

/**
 * Parte de useForm que necesitan estos campos. Así los pueden usar formularios con
 * más campos (contraseña, rol...) además de los personales.
 */
export type UserFormApi = {
  values: UserFormValues;
  field: (name: keyof UserFormValues & string) => {
    name: string;
    value: string;
    error: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  };
  setValue: (name: "residentType" | "avatar", value: string) => void;
  setValues: (changes: Partial<UserFormValues>) => void;
};

type UserFieldsProps = {
  form: UserFormApi;
  addressRequired?: boolean;
  /** false: oculta dirección, código postal, provincia y ciudad (la pantalla pide la vivienda aparte) */
  withLocation?: boolean;
};

export default function UserFields({ form, addressRequired = true, withLocation = true }: UserFieldsProps) {
  const { values } = form;
  return (
    <div className="space-y-5">
      <SegmentedField
        label="Relación con la vivienda"
        value={values.residentType}
        onChange={(value) => form.setValue("residentType", value)}
        options={[
          { value: "1", label: RESIDENT_TYPE_LABELS[1] },
          { value: "2", label: RESIDENT_TYPE_LABELS[2] },
        ]}
      />
      <AvatarField value={values.avatar} name={values.name} lastname={values.lastname} onChange={(image) => form.setValue("avatar", image)} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Nombre" placeholder="Ej: Juan" autoComplete="given-name" {...form.field("name")} />
        <TextField label="Apellidos" placeholder="Ej: García" autoComplete="family-name" {...form.field("lastname")} />
        <TextField label="DNI / NIE" placeholder="12345678X" {...form.field("dni")} />
        <TextField label="Teléfono" type="tel" placeholder="+34 600 000 000" autoComplete="tel" {...form.field("phoneNumber")} />
      </div>
      <TextField label="Correo electrónico" type="email" placeholder="juan.garcia@email.com" autoComplete="email" {...form.field("email")} />
      {withLocation && (
        <>
          <TextField
            label="Dirección"
            placeholder="Ej: Calle del Roble 12, 2ºA"
            hint={addressRequired ? undefined : "Opcional para administrador y conserje"}
            {...form.field("address")}
          />
          <div className="grid gap-5 sm:grid-cols-3">
            <TextField label="Código postal" placeholder="28001" inputMode="numeric" maxLength={5} {...form.field("zipCode")} />
            <CityProvinceFields
              provinceId={values.provinceId}
              cityId={values.cityId}
              onChange={(next) => form.setValues(next)}
              errors={{ provinceId: form.field("provinceId").error, cityId: form.field("cityId").error }}
            />
          </div>
        </>
      )}
    </div>
  );
}
