package com.gescom.backend.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CommunitiesAdministratorsRequest {
    @NotNull
    private long community_id;
    @NotNull
    private long user_id;
    @NotNull
    private LocalDate start_date;
    private LocalDate end_date;
}
