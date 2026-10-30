package com.gescom.backend.mapper;

import com.gescom.backend.dto.ProvinceDTO;
import com.gescom.backend.entity.Province;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProvinceMapper {
    @Mapping(source = "province_id", target = "provinceId")
    @Mapping(source = "name", target = "name")
    ProvinceDTO toDTO(Province province);
}
