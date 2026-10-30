package com.gescom.backend.dto;

/**
 * Respuesta de POST /api/register/{uuid}.
 * emailVerificationRequired = true  : se ha mandado un correo y el usuario no puede entrar hasta pulsar el enlace.
 * emailVerificationRequired = false : el usuario ya está validado y puede iniciar sesión.
 */
public record RegistrationResponse(long userId, String email, boolean emailVerificationRequired) {
}
