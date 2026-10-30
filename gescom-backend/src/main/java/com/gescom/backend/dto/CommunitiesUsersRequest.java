package com.gescom.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CommunitiesUsersRequest {
    @NotNull
    private long community_id;
    @NotNull
    private long user_id;
    @NotNull
    private LocalDate move_in_date;
    private LocalDate move_out_date;
}
