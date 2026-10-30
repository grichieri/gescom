// Validaciones sencillas para los formularios. Devuelven el mensaje de error o "".

// La terminación sigue al artículo de la etiqueta: «La ciudad» → obligatoria, «Los apellidos» → obligatorios
const mandatory = (label: string) =>
  label.startsWith("La ") ? "obligatoria" : label.startsWith("Los ") ? "obligatorios" : label.startsWith("Las ") ? "obligatorias" : "obligatorio";

export const required = (value: string, label = "Este campo") => {
  const verb = label.startsWith("Los ") || label.startsWith("Las ") ? "son" : "es";
  return value.trim() === "" ? `${label} ${verb} ${mandatory(label)}` : "";
};

export const email = (value: string) => {
  if (value.trim() === "") return "El correo es obligatorio";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Introduce un correo válido";
};

/** Mínimo 8 caracteres, con al menos una mayúscula, un número y un símbolo (por ejemplo @Passvalid1234). */
export const password = (value: string) => {
  if (value === "") return "La contraseña es obligatoria";
  if (value.length < 8) return "Mínimo 8 caracteres";
  const missing: string[] = [];
  if (!/\p{Lu}/u.test(value)) missing.push("una mayúscula");
  if (!/\d/.test(value)) missing.push("un número");
  if (!/[^\p{L}\p{N}\s]/u.test(value)) missing.push("un símbolo (como @, # o !)");
  return missing.length ? `Debe incluir ${missing.join(", ")}` : "";
};

export const zipCode = (value: string) => {
  if (value.trim() === "") return "El código postal es obligatorio";
  return /^\d{5}$/.test(value.trim()) ? "" : "Debe tener 5 dígitos";
};

export const phone = (value: string) => {
  if (value.trim() === "") return "";
  return /^\+?[\d\s]{9,15}$/.test(value.trim()) ? "" : "Teléfono no válido";
};

/** DNI/NIE españoles: 8 cifras + letra, o X/Y/Z + 7 cifras + letra */
export const dni = (value: string) => {
  const v = value.trim().toUpperCase();
  if (v === "") return "El DNI/NIE es obligatorio";
  return /^([0-9]{8}|[XYZ][0-9]{7})[A-Z]$/.test(v) ? "" : "Formato no válido (12345678X)";
};

/** Quita los mensajes vacíos para saber si el formulario es válido. */
export const hasErrors = (errors: Record<string, string>) =>
  Object.values(errors).some((message) => message !== "");
