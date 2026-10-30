package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CommunityUserResponse {
    @JsonProperty("userId")
    private long userId;
    private String name;
    private String lastname;
    private Byte residentType;
    private String email;
    private String avatar;
    private String address;
    @JsonProperty("isValidated")
    private boolean validated;
    @JsonProperty("isActive")
    private boolean active;
    @JsonProperty("isDisabled")
    private boolean disabled;
    private String role;
    private LocalDate roleStartDate;
    private LocalDate roleEndDate;
}
