package com.gescom.backend.controller;

import com.gescom.backend.dto.EmailRequest;
import com.gescom.backend.dto.MailStatusResponse;
import com.gescom.backend.dto.MeResponse;
import com.gescom.backend.dto.ResetPasswordRequest;
import com.gescom.backend.dto.TokenRequest;
import com.gescom.backend.service.AccountService;
import com.gescom.backend.service.IdentityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Rutas de cuenta bajo /user/auth (junto al login de AuthController):
 *  - GET  /me                  quién soy y qué cargo tengo en cada comunidad (necesita token)
 *  - POST /verify-email        pulsar el enlace del correo de verificación (pública)
 *  - POST /resend-verification reenviar ese correo (pública)
 *  - POST /forgot-password     pedir el correo para restablecer la contraseña (pública)
 *  - POST /reset-password      definir la contraseña nueva con el enlace del correo (pública)
 */
@RestController
@RequestMapping("/user/auth")
@RequiredArgsConstructor
public class AccountController {

    private final IdentityService identityService;
    private final AccountService accountService;

    @GetMapping("/me")
    public MeResponse me(Authentication authentication) {
        return identityService.identityOf(authentication.getName());
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody TokenRequest request) {
        accountService.verifyEmail(request.token());
        return ResponseEntity.ok(Map.of("mensaje", "Correo verificado correctamente"));
    }

    @PostMapping("/resend-verification")
    public MailStatusResponse resendVerification(@Valid @RequestBody EmailRequest request) {
        return accountService.resendVerification(request.email());
    }

    @PostMapping("/forgot-password")
    public MailStatusResponse forgotPassword(@Valid @RequestBody EmailRequest request) {
        return accountService.forgotPassword(request.email());
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        accountService.resetPassword(request.token(), request.password());
        return ResponseEntity.ok(Map.of("mensaje", "Contraseña actualizada correctamente"));
    }
}
