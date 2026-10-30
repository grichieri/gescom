package com.gescom.backend.mapper;

import com.gescom.backend.dto.CommunitiesCaretakersRequest;
import com.gescom.backend.dto.CommunitiesCaretakersResponse;
import com.gescom.backend.entity.CommunitiesCaretakers;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CommunitiesCaretakersMapper {
    // --- De Request a Entidad ---
    @Mapping(target = "community_caretaker_id", ignore = true)
    @Mapping(target = "community", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "start_date", ignore = true)
    @Mapping(target = "end_date", ignore = true)
    CommunitiesCaretakers toEntity(CommunitiesCaretakersRequest request);

    // --- De Entidad a Response ---
    @Mapping(source = "community_caretaker_id", target = "community_caretaker_id")
    @Mapping(source = "community.communityId", target = "community_id")
    @Mapping(source = "user.user_id", target = "user_id")
    @Mapping(source = "start_date", target = "start_date")
    @Mapping(source = "end_date", target = "end_date")
    CommunitiesCaretakersResponse toResponse(CommunitiesCaretakers communitiesCaretakers);
}