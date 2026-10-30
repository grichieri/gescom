package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Detalle de una incidencia: sus datos, sus fotos y sus comentarios. */
public record IncidenceDetailResponse(
        @JsonProperty("incidenceId") Integer id,
        Integer communityId,
        Integer propertyId,
        Integer reportedByUserId,
        String name,
        String description,
        Integer status,
        Integer priority,
        LocalDateTime createdDate,
        LocalDate maxResolutionDate,
        List<IncidencePictureResponse> pictures,
        List<IncidenceCommentItemResponse> comments) {
}
