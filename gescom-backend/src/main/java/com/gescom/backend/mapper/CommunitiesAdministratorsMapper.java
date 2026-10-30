package com.gescom.backend.mapper;

import com.gescom.backend.dto.CommunitiesAdministratorsRequest;
import com.gescom.backend.dto.CommunitiesAdministratorsResponse;
import com.gescom.backend.entity.CommunitiesAdministrators;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommunitiesAdministratorsMapper {
    // --- De Request a Entidad ---
    @Mapping(target = "community_administrator_id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "start_date", ignore = true)
    @Mapping(target = "end_date", ignore = true)
    CommunitiesAdministrators toEntity(CommunitiesAdministratorsRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "community_administrator_id", target = "community_administrator_id")
    @Mapping(source = "community.communityId", target = "community_id")
    @Mapping(source = "user.user_id", target = "user_id")
    @Mapping(source = "start_date", target = "start_date")
    @Mapping(source = "end_date", target = "end_date")
    CommunitiesAdministratorsResponse toResponse(CommunitiesAdministrators communitiesAdministrators);
}