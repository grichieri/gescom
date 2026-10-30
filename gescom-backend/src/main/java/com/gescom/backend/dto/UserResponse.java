package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class UserResponse {
    private long userId;
    private String name;
    private String lastname;
    private byte type;
    private Byte residentType;
    private String avatar;
    private String dni;
    private String phoneNumber;
    @JsonProperty("isValidated")
    private boolean validated;
    @JsonProperty("isActive")
    private boolean active;
    @JsonProperty("isDisabled")
    private boolean disabled;
    private String email;
    private String address;
    private String zipCode;
    private short cityId;
}
