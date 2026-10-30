package com.gescom.backend.mapper;

import com.gescom.backend.dto.PropertyRequest;
import com.gescom.backend.dto.PropertyResponse;
import com.gescom.backend.entity.Properties;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PropertyMapper {

    @Mapping(target = "propertyId", ignore = true)
    @Mapping(target = "community", ignore = true)
    Properties toEntity(PropertyRequest request);

    @Mapping(source = "community.communityId", target = "communityId")
    PropertyResponse toResponse(Properties property);

    @Mapping(target = "propertyId", ignore = true)
    @Mapping(target = "community", ignore = true)
    void updateEntityFromRequest(PropertyRequest request, @MappingTarget Properties property);
}