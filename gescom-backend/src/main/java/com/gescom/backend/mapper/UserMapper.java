package com.gescom.backend.mapper;

import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.dto.UserResponse;
import com.gescom.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    //Pasar datos de UserEntity a UserResponse
    @Mapping(source = "user_id", target = "userId")
    @Mapping(source = "name", target = "name")
    @Mapping(source = "lastname", target = "lastname")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "resident_type", target = "residentType")
    @Mapping(source = "avatar", target = "avatar")
    @Mapping(source = "dni", target = "dni")
    @Mapping(source = "phone_number", target = "phoneNumber")
    @Mapping(source = "validated", target = "validated")
    @Mapping(source = "active", target = "active")
    @Mapping(source = "disabled", target = "disabled")
    @Mapping(source = "email", target = "email")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "zip_code", target = "zipCode")
    @Mapping(source = "city.city_id", target = "cityId")
    UserResponse toResponse(User userEntity);

    //Pasar datos de UserRequest a UserEntity
    @Mapping(target = "user_id", ignore = true)
    @Mapping(source = "name", target = "name")
    @Mapping(source = "lastname", target = "lastname")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "residentType", target = "resident_type")
    @Mapping(source = "avatar", target = "avatar")
    @Mapping(source = "dni", target = "dni")
    @Mapping(source = "phoneNumber", target = "phone_number")
    @Mapping(target = "validated", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "disabled", ignore = true)
    @Mapping(source = "email", target = "email")
    @Mapping(source = "password", target = "password")
    @Mapping(source = "address", target = "address")
    @Mapping(source = "zipCode", target = "zip_code")
    @Mapping(target = "city", ignore = true)
    User toEntity(UserRequest userRequest);

    //Actualizar datos de UserRequest a UserEntity
    @Mapping(target = "user_id", ignore = true)
    @Mapping(source = "name", target = "name")
    @Mapping(source = "lastname", target = "lastname")
    @Mapping(source = "type", target = "type")
    @Mapping(source = "residentType", target = "resident_type")
    @Mapping(source = "avatar", target = "avatar")
    @Mapping(source = "dni", target = "dni")
    @Mapping(source = "phoneNumber", target = "phone_number")
    @Mapping(target = "validated", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "disabled", ignore = true)
    @Mapping(source = "email", target = "email")
    @Mapping(target = "password", ignore = true)
    @Mapping(source = "address", target = "address")
    @Mapping(source = "zipCode", target = "zip_code")
    @Mapping(target = "city", ignore = true)
    User updateEntity(UserRequest userRequest, @MappingTarget User userEntity);
}