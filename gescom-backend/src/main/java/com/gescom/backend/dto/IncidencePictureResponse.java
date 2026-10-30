package com.gescom.backend.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class IncidencePictureResponse {
    private Long pictureId;
    private Long incidenceId;
    private String url;
    private LocalDateTime createdDate;
}