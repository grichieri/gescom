package com.gescom.backend.controller;

import com.gescom.backend.dto.RegistrationResponse;
import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.entity.User;
import com.gescom.backend.service.AccountService;
import com.gescom.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("api/register")
@RequiredArgsConstructor
public class RegistroController {
    private final UserService userService;
    private final AccountService accountService;

    @PostMapping("/{communityUuid}")
    public ResponseEntity<RegistrationResponse> crearUsuario(@PathVariable("communityUuid") UUID communityUuid, @RequestBody UserRequest userRequest){
        User created = userService.createUserInCommunity(communityUuid, userRequest);
        // Con el correo activado, manda el enlace de verificación; con el correo desactivado no hace nada
        boolean verificationRequired = accountService.startEmailVerification(created);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new RegistrationResponse(created.getUser_id(), created.getEmail(), verificationRequired));
    }
}
