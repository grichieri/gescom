package com.gescom.backend.dto;

import java.util.List;

/** Quién es el usuario del token y qué cargo tiene en cada una de sus comunidades. */
public record MeResponse(UserResponse user, List<CommunityRoleResponse> communities) {
}
