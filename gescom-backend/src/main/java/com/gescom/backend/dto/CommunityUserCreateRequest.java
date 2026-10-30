package com.gescom.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Alta de un usuario en una comunidad hecha por la administración (ya validado).
 * password es opcional: sin contraseña, el usuario recibe un correo para definirla (solo si el correo está activado).
 * role es opcional: "administrator", "president" o "caretaker".
 */
public record CommunityUserCreateRequest(
        @NotNull @Valid UserRequest user,
        String role,
        LocalDate roleStartDate,
        LocalDate roleEndDate) {
}
