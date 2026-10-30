package com.gescom.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class IncidenceCommentsResponse {
    private long comment_id;
    private long incidence_id;
    private long user_id;
    private String comment;
    private LocalDateTime created_date;
}
