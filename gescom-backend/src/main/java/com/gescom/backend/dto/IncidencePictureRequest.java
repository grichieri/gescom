package com.gescom.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class IncidencePictureRequest {

    /** Solo se usa al actualizar una foto existente. En creación debe venir null. */
    private Long pictureId;

    @NotBlank
    @Size(max = 255)
    private String url;
}