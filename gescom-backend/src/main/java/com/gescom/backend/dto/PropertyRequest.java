package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class PropertyRequest {

    @NotNull
    @JsonAlias("community_id")   // se sigue admitiendo el nombre antiguo
    private Long communityId;
    @Size(max = 50)
    @JsonAlias("block_portal")
    private String blockPortal;
    @Size(max = 150)
    private String name;
    @NotNull
    @Min(1) @Max(3)
    @JsonAlias("property_type")
    private Short propertyType;
    @NotBlank
    @Size(max = 255)
    private String address;
    @NotBlank
    @Size(max = 10)
    @JsonAlias("zip_code")
    private String zipCode;
}
