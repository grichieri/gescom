package com.gescom.backend.dto;

import jakarta.validation.constraints.NotBlank;

/** Cuerpo de POST /api/incidences/{id}/comments. Quien comenta sale del token, no del cuerpo. */
public record IncidenceCommentCreateRequest(@NotBlank String comment) {
}
