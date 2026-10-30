package com.gescom.backend.dto;

// JSON en camelCase, igual que el resto de respuestas (antes: community_id, zip_code, city_id...)
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CommunityResponse {
    @JsonProperty("communityId")
    private Long id;
    private String name;
    private String nif;
    private Short type;
    private String address;
    private String zipCode;
    private Short cityId;
    private String registrationCode;
    private Boolean isDeleted;
}