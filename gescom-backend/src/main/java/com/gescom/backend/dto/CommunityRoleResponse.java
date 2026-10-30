package com.gescom.backend.dto;

import java.time.LocalDate;

/** Cargo vigente de un usuario en una comunidad (lo que devuelve GET /user/auth/me). */
public record CommunityRoleResponse(
        Long communityId,
        String name,
        String role,
        LocalDate roleStartDate,
        LocalDate roleEndDate) {
}
