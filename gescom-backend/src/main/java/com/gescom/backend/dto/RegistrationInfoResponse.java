package com.gescom.backend.dto;

/** Comunidad a la que pertenece un código de registro (para enseñar su nombre antes de crear la cuenta). */
public record RegistrationInfoResponse(Long communityId, String name) {
}
