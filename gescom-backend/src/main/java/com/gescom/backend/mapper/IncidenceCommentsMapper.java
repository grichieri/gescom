package com.gescom.backend.mapper;

import com.gescom.backend.dto.IncidenceCommentsRequest;
import com.gescom.backend.dto.IncidenceCommentsResponse;
import com.gescom.backend.entity.IncidenceComments;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IncidenceCommentsMapper {
    // --- De Request a Entidad ---
    @Mapping(target = "comment_id", ignore = true)
    @Mapping(target = "incidence", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(source = "comment", target = "comment")
    @Mapping(target = "created_date", ignore = true)
    IncidenceComments toEntity(IncidenceCommentsRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "comment_id", target = "comment_id")
    @Mapping(source = "incidence.id", target = "incidence_id")
    @Mapping(source = "user.user_id", target = "user_id")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "created_date", target = "created_date")
    IncidenceCommentsResponse toResponse(IncidenceComments incidenceComments);
}