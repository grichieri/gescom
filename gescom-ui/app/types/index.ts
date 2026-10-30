// Tipos que reflejan las tablas de la base de datos gescom (columnas en camelCase,
// igual que devuelve la API de Spring).

export type Province = { provinceId: number; name: string };
export type City = { cityId: number; provinceId: number; name: string };

export type User = {
  userId: number;
  name: string;
  lastname: string;
  type: 1 | 2; // 1 Superadmin, 2 Usuario
  residentType: 1 | 2 | null; // 1 Propietario, 2 Inquilino
  avatar: string | null;
  dni: string | null;
  phoneNumber: string | null;
  isValidated: boolean;
  isActive: boolean;
  isDisabled: boolean;
  email: string;
  password: string;
  address: string | null;
  zipCode: string | null;
  cityId: number | null;
};

export type Community = {
  communityId: number;
  name: string;
  nif: string;
  type: 1 | 2; // 1 Edificio, 2 Chalet
  address: string;
  zipCode: string;
  cityId: number;
  isDeleted: boolean;
  registrationCode: string;
};

export type Property = {
  propertyId: number;
  communityId: number;
  blockPortal: string | null;
  address: string;
  zipCode: string;
};

export type CommunityUser = {
  communityUserId: number;
  communityId: number;
  userId: number;
  moveInDate: string;
  moveOutDate: string | null;
};

// Las tres tablas de cargos tienen la misma forma
export type RoleKind = "administrator" | "president" | "caretaker";

export type RoleRecord = {
  id: number;
  communityId: number;
  userId: number;
  startDate: string;
  endDate: string | null;
};

export type Incidence = {
  incidenceId: number;
  communityId: number;
  propertyId: number | null;
  reportedByUserId: number;
  name: string;
  status: 1 | 2 | 3;
  priority: 1 | 2 | 3;
  description: string | null;
  createdDate: string;
  maxResolutionDate: string | null;
};

/** Foto de una incidencia (tabla incidence_pictures): de 0 a 5 por incidencia */
export type IncidencePicture = {
  pictureId: number;
  incidenceId: number;
  /** Ruta del archivo, o la propia imagen ("data:image/...") mientras no hay backend */
  url: string;
  createdDate: string;
};

export type IncidenceComment = {
  commentId: number;
  incidenceId: number;
  userId: number;
  comment: string;
  createdDate: string;
};

// Cargo "visible" de un usuario dentro de una comunidad
export type CommunityRole =
  | "superadmin"
  | "administrator"
  | "president"
  | "caretaker"
  | "owner"
  | "tenant"
  | "none";
