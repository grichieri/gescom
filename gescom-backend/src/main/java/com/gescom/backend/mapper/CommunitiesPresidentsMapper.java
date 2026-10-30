package com.gescom.backend.mapper;

import com.gescom.backend.dto.CommunitiesPresidentsRequest;
import com.gescom.backend.dto.CommunitiesPresidentsResponse;
import com.gescom.backend.entity.CommunitiesPresidents;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommunitiesPresidentsMapper {
    // --- De Request a Entidad ---
    @Mapping(target = "community_president_id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "start_date", ignore = true)
    @Mapping(target = "end_date", ignore = true)
    CommunitiesPresidents toEntity(CommunitiesPresidentsRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "community_president_id", target = "community_president_id")
    @Mapping(source = "community.communityId", target = "community_id")
    @Mapping(source = "user.user_id", target = "user_id")
    @Mapping(source = "start_date", target = "start_date")
    @Mapping(source = "end_date", target = "end_date")
    CommunitiesPresidentsResponse toResponse(CommunitiesPresidents communitiesPresidents);
}