package com.gescom.backend.mapper;

import com.gescom.backend.dto.CityDTO;
import com.gescom.backend.entity.City;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CityMapper {
    @Mapping(source = "city_id", target = "cityId")
    @Mapping(source = "province.province_id", target = "provinceId")
    @Mapping(source = "name", target = "name")
    CityDTO toDTO(City city);
}
