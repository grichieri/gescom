package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/** Datos de una incidencia que devuelve la API, construidos a partir de la entidad. */
public record IncidenceResponse(
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
        List<IncidencePictureResponse> pictures) {
}