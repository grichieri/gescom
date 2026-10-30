package com.gescom.backend.controller;

import com.gescom.backend.dto.CommunityUserCreateRequest;
import com.gescom.backend.dto.RoleChangeRequest;
import com.gescom.backend.dto.UserResponse;
import com.gescom.backend.entity.User;
import com.gescom.backend.mapper.UserMapper;
import com.gescom.backend.service.AccessService;
import com.gescom.backend.service.AccountService;
import com.gescom.backend.service.CommunityMembersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Usuarios de una comunidad (el listado GET /api/communities/{id}/users sigue en CommunityController):
 *  - POST /api/communities/{communityId}/users                alta hecha por la administración (usuario ya validado)
 *  - PUT  /api/communities/{communityId}/users/{userId}/role  cambiar o quitar el cargo de un usuario
 */
@RestController
@RequestMapping("/api/communities/{communityId}/users")
@RequiredArgsConstructor
public class CommunityMembersController {

    private final CommunityMembersService communityMembersService;
    private final AccountService accountService;
    private final AccessService accessService;
    private final UserMapper userMapper;

    @PostMapping
    public ResponseEntity<UserResponse> createMember(@PathVariable Long communityId,
                                                     @Valid @RequestBody CommunityUserCreateRequest request,
                                                     Authentication authentication) {
        accessService.requireManager(authentication, communityId);
        User created = communityMembersService.createMember(communityId, request);
        // Con el correo activado, el usuario recibe un enlace para definir su contraseña
        accountService.sendWelcome(created, communityMembersService.communityOf(communityId));
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponse(created));
    }

    @PutMapping("/{userId}/role")
    public ResponseEntity<Void> changeRole(@PathVariable Long communityId,
                                           @PathVariable Long userId,
                                           @RequestBody RoleChangeRequest request,
                                           Authentication authentication) {
        accessService.requireManager(authentication, communityId);
        communityMembersService.changeRole(communityId, userId, request.role(), request.startDate(), request.endDate());
        return ResponseEntity.noContent().build();
    }
}
