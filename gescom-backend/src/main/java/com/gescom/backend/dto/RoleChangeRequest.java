package com.gescom.backend.dto;

import java.time.LocalDate;

/**
 * Cambio de cargo de un usuario en una comunidad.
 * role: "administrator", "president", "caretaker" o null para quitarle el cargo.
 * startDate vacío = hoy.
 */
public record RoleChangeRequest(String role, LocalDate startDate, LocalDate endDate) {
}
