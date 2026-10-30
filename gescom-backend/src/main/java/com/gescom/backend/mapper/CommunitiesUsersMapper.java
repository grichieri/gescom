package com.gescom.backend.mapper;

import com.gescom.backend.dto.CommunitiesUsersRequest;
import com.gescom.backend.dto.CommunitiesUsersResponse;
import com.gescom.backend.entity.CommunitiesUsers;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommunitiesUsersMapper {
    // --- De Request a Entidad ---
    @Mapping(target = "community_user_id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "move_in_date", ignore = true)
    @Mapping(target = "move_out_date", ignore = true)
    CommunitiesUsers toEntity(CommunitiesUsersRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "community_user_id", target = "community_user_id")
    @Mapping(source = "community.communityId", target = "community_id")
    @Mapping(source = "user.user_id", target = "user_id")
    @Mapping(source = "move_in_date", target = "move_in_date")
    @Mapping(source = "move_out_date", target = "move_out_date")
    CommunitiesUsersResponse toResponse(CommunitiesUsers communitiesUsers);
}