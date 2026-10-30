package com.gescom.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

/** Datos editables de una incidencia. La comunidad y quien la reportó no cambian. */
public record IncidenceUpdateRequest(
		Long communityId,
		Integer propertyId,
		Long reportedByUserId,
		@Size(max = 150) String name,
		String description,
		@NotNull Integer status,
		@NotNull Integer priority,
		LocalDate maxResolutionDate,
		List<IncidencePictureRequest> picture){
}
