package com.gescom.backend.controller;


import com.gescom.backend.dto.LoginRequest;
import com.gescom.backend.dto.LoginResponse;
import com.gescom.backend.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/user/auth")
class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> userLogin(@RequestBody LoginRequest loginRequest){
        LoginResponse loguinResponse = authService.loginUser(loginRequest.email(), loginRequest.password());
        return ResponseEntity.ok(loguinResponse);
    }

    @PostMapping ("/logout")
    public ResponseEntity<?> userLogout(@RequestHeader(value = "Authorization", required = false) String authHeader){
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            authHeader.substring(7);
        }
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
    }
}