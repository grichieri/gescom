package com.gescom.backend.controller;

import com.gescom.backend.dto.CommunityRequest;
import com.gescom.backend.dto.CommunityResponse;
import com.gescom.backend.dto.CommunityUserResponse;
import com.gescom.backend.dto.IncidenceResponse;
import com.gescom.backend.service.AccessService;
import com.gescom.backend.service.CommunityService;
import com.gescom.backend.service.CommunitiesUsersService;
import com.gescom.backend.service.IncidenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/communities")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final IncidenceService incidenciasService;
    private final CommunitiesUsersService communitiesUsersService;
    private final AccessService accessService;

    @GetMapping
    public ResponseEntity<List<CommunityResponse>> getAllCommunities() {
        return ResponseEntity.ok(communityService.obtenerTodos());
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<CommunityUserResponse>> getAllUsersInCommunity(@PathVariable Long id, Authentication authentication) {
        accessService.requireMember(authentication, id);
        return ResponseEntity.ok(communitiesUsersService.getAllUsersByCommunity(id));
    }

    @PostMapping
    public ResponseEntity<CommunityResponse> createCommunity(@Valid @RequestBody CommunityRequest request, Authentication authentication) {
        accessService.requireSuperadmin(authentication);
        return new ResponseEntity<>(communityService.guardar(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommunityResponse> updateCommunity(@PathVariable Long id, @Valid @RequestBody CommunityRequest request, Authentication authentication) {
        accessService.requireManager(authentication, id);
        return ResponseEntity.ok(communityService.actualizar(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.obtenerPorId(id));
    }

    @GetMapping("/{id}/incidences")
    public ResponseEntity<List<IncidenceResponse>> obtenerPorComunidad(@PathVariable Long id, Authentication authentication) {
        accessService.requireMember(authentication, id);
        return ResponseEntity.ok(incidenciasService.obtenerTodosPorComunidad(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        accessService.requireSuperadmin(authentication);
        communityService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}