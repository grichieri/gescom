package com.gescom.backend.controller;

import com.gescom.backend.dto.PasswordRequest;
import com.gescom.backend.dto.UserResponse;
import com.gescom.backend.service.AccessService;
import com.gescom.backend.service.AccountService;
import com.gescom.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Contraseña y foto de perfil de un usuario: solo él mismo o el superadmin. */
@RestController
@RequestMapping("api/users/{id}")
@RequiredArgsConstructor
public class UserAccountController {

    private final AccessService accessService;
    private final AccountService accountService;
    private final UserService userService;

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(@PathVariable("id") Long id,
                                               @Valid @RequestBody PasswordRequest request,
                                               Authentication authentication) {
        accessService.requireSelfOrSuperadmin(authentication, id);
        accountService.changePassword(id, request.password());
        return ResponseEntity.noContent().build();
    }

    /** Foto de perfil (multipart, parte "avatar"). Devuelve el usuario con la nueva URL en avatar. */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserResponse changeAvatar(@PathVariable("id") Long id,
                                     @RequestPart("avatar") MultipartFile avatar,
                                     Authentication authentication) {
        accessService.requireSelfOrSuperadmin(authentication, id);
        accountService.changeAvatar(id, avatar);
        return userService.getUserById(id);
    }
}
