package com.gescom.backend.dto;

import java.time.LocalDateTime;

/** Comentario de una incidencia tal como lo espera el front (camelCase). */
public record IncidenceCommentItemResponse(
        long commentId,
        long incidenceId,
        long userId,
        String comment,
        LocalDateTime createdDate) {
}
