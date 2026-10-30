package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CommunitiesUsersResponse {
    @JsonProperty("communityUserId")
    private long community_user_id;
    @JsonProperty("communityId")
    private long community_id;
    @JsonProperty("userId")
    private long user_id;
    @JsonProperty("moveInDate")
    private LocalDate move_in_date;
    @JsonProperty("moveOutDate")
    private LocalDate move_out_date;
}
