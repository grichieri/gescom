package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CommunityRequest {

    @NotBlank
    @Size(max = 150)
    private String name;

    @NotBlank
    @Size(max = 20)
    private String nif;

    @NotNull @Min(1) @Max(2)
    private Short type;

    @NotBlank
    @Size(max = 255)
    private String address;

    @NotBlank
    @Size(max = 10)
    @JsonAlias("zip_code")   // se sigue admitiendo el nombre antiguo
    private String zipCode;

    @NotNull
    @JsonAlias("city_id")
    private Short cityId;
}