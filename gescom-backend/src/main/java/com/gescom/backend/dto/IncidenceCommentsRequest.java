package com.gescom.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidenceCommentsRequest {
    @NotNull
    private long incidence_id;
    @NotNull
    private long user_id;
    @NotNull
    private String comment;
    @NotNull
    private LocalDateTime created_date;
}
