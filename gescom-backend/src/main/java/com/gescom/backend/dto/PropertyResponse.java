package com.gescom.backend.dto;

import lombok.Data;

@Data
public class PropertyResponse {
    private Long propertyId;
    private Long communityId;
    private String blockPortal;
    private String name;
    private Short propertyType;
    private String address;
    private String zipCode;
}