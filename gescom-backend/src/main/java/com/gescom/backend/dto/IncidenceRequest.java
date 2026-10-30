package com.gescom.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Datos para crear una incidencia. El estado inicial siempre es PENDING. */

public record IncidenceRequest(
        @NotNull Long communityId,
        Long propertyId,
        @NotNull Long reportedByUserId,
        @NotBlank @Size(max = 150) String name,
        String description,
        Integer priority,
        LocalDate maxResolutionDate,
        List<IncidencePictureRequest> picture) {
}