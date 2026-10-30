package com.gescom.backend.mapper;

import com.gescom.backend.dto.CommunityRequest;
import com.gescom.backend.dto.CommunityResponse;
import com.gescom.backend.entity.Communities;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CommunityMapper {

    // --- De Request a Entidad ---
    @Mapping(target = "communityId", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "registrationCode", ignore = true)// se inicializa a false en el servicio
    Communities toEntity(CommunityRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "communityId", target = "id")
    CommunityResponse toResponse(Communities community);

    // --- Para actualizar una entidad existente ---
    @Mapping(target = "communityId", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "registrationCode", ignore = true)
    void updateEntityFromRequest(CommunityRequest request, @MappingTarget Communities community);
}