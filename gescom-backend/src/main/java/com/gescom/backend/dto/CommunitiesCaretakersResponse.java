package com.gescom.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CommunitiesCaretakersResponse {
    @JsonProperty("id")
    private long community_caretaker_id;
    @JsonProperty("communityId")
    private long community_id;
    @JsonProperty("userId")
    private long user_id;
    @JsonProperty("startDate")
    private LocalDate start_date;
    @JsonProperty("endDate")
    private LocalDate end_date;
}
