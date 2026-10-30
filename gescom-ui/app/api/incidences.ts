import type { Incidence, IncidenceComment, IncidencePicture } from "~/types";
import type { NewIncidenceInput } from "~/data/store";
import { fileUrl, jsonBody, request } from "./client";

/** Incidencia tal como la devuelve el back: con sus fotos dentro. */
export type IncidenceWithPictures = Incidence & { pictures: IncidencePicture[] };

// TODO: confirmar con el back los nombres de las partes del POST multipart (el JSON y las fotos)
const JSON_PART = "incidencia";
const PICTURES_PART = "fotos";

const normalize = (raw: IncidenceWithPictures): IncidenceWithPictures => ({
  ...raw,
  pictures: (raw.pictures ?? []).map((p) => ({ ...p, url: fileUrl(p.url) })),
});

/** GET /api/communities/{id}/incidences */
export async function listIncidences(communityId: number): Promise<IncidenceWithPictures[]> {
  const rows = await request<IncidenceWithPictures[]>(`/api/communities/${communityId}/incidences`);
  return rows.map(normalize);
}

/** "data:image/jpeg;base64,..." -> archivo para enviar por multipart */
async function toFile(dataUrl: string, index: number): Promise<File> {
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], `foto-${index + 1}.jpg`, { type: blob.type || "image/jpeg" });
}

/** POST /api/incidences (multipart: el JSON de la incidencia y hasta 5 fotos). Devuelve la incidencia creada. */
export async function createIncidence(input: NewIncidenceInput, pictures: string[]): Promise<IncidenceWithPictures> {
  const form = new FormData();
  form.append(JSON_PART, new Blob([JSON.stringify(input)], { type: "application/json" }));
  const files = await Promise.all(pictures.map(toFile));
  files.forEach((file) => form.append(PICTURES_PART, file));
  const created = await request<IncidenceWithPictures>("/api/incidences", { method: "POST", body: form });
  return normalize(created);
}


/** Detalle de una incidencia: la incidencia con sus fotos y sus comentarios. */
export type IncidenceDetailData = IncidenceWithPictures & { comments: IncidenceComment[] };

/** GET /api/incidences/{id} */
export async function getIncidence(id: number): Promise<IncidenceDetailData> {
  const raw = await request<IncidenceDetailData>(`/api/incidences/${id}`);
  return { ...normalize(raw), comments: raw.comments ?? [] };
}

/** PUT /api/incidences/{id} (solo administración, presidencia y conserjería). Devuelve la incidencia actualizada. */
export async function updateIncidence(id: number, changes: Pick<Incidence, "status" | "priority"> & Partial<Pick<Incidence, "maxResolutionDate">>): Promise<IncidenceWithPictures> {
  const updated = await request<IncidenceWithPictures>(`/api/incidences/${id}`, jsonBody("PUT", changes));
  return normalize(updated);
}

/** POST /api/incidences/{id}/comments. Devuelve el comentario creado. */
export function addComment(id: number, userId: number, comment: string): Promise<IncidenceComment> {
  return request<IncidenceComment>(`/api/incidences/${id}/comments`, jsonBody("POST", { userId, comment: comment.trim() }));
}
