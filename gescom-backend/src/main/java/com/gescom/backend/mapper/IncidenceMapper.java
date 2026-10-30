package com.gescom.backend.mapper;

import com.gescom.backend.dto.IncidencePictureResponse;
import com.gescom.backend.entity.IncidencePicture;
import com.gescom.backend.entity.Incidences;
import com.gescom.backend.dto.IncidenceRequest;
import com.gescom.backend.dto.IncidenceResponse;
import com.gescom.backend.dto.IncidenceUpdateRequest;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

/**
 * Conversión entre Incidence y sus DTOs. La comunidad y quien reporta no se mapean aquí:
 * el servicio los carga de la base de datos para comprobar que existen.
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface IncidenceMapper {

    @Mapping(target = "communityId", source = "community.communityId")
    @Mapping(target = "reportedByUserId", source = "reportedBy.user_id")
    IncidenceResponse toResponse(Incidences incidence);

    // Las fotos de la incidencia (se usa para rellenar "pictures" de IncidenceResponse)
    @Mapping(target = "incidenceId", source = "incidence.id")
    IncidencePictureResponse toPictureResponse(IncidencePicture picture);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "reportedBy", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "pictures", ignore = true)
    @Mapping(target = "priority", source = "priority",defaultValue = "1")
    Incidences toEntity(IncidenceRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "reportedBy", ignore = true)
    @Mapping(target = "createdDate", ignore = true)
    @Mapping(target = "pictures", ignore = true)
    // Actualización parcial: lo que no viene en el cuerpo (null) se deja como estaba
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(IncidenceUpdateRequest request, @MappingTarget Incidences incidence);
}