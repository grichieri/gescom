import type { CommunityRole } from "~/types";

export const STATUS_LABELS = { 1: "Pendiente", 2: "En proceso", 3: "Resuelta" } as const;
export const PRIORITY_LABELS = { 1: "Baja", 2: "Media", 3: "Alta" } as const;
export const COMMUNITY_TYPE_LABELS = { 1: "Edificio", 2: "Chalet" } as const;
export const RESIDENT_TYPE_LABELS = { 1: "Propietario", 2: "Inquilino" } as const;

export const ROLE_LABELS: Record<CommunityRole, string> = {
  superadmin: "Superadministrador",
  administrator: "Administrador",
  president: "Presidente",
  caretaker: "Conserje",
  owner: "Propietario",
  tenant: "Inquilino",
  none: "Usuario",
};

export const MONTHS_SHORT = [
  "ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic",
];
export const MONTHS_LONG = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
  "septiembre", "octubre", "noviembre", "diciembre",
];

/** Máximo de fotos por incidencia (en la base de datos no hay restricción: lo valida el backend) */
export const MAX_INCIDENCE_PICTURES = 5;
