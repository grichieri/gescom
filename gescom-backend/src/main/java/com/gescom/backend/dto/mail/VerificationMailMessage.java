package com.gescom.backend.dto.mail;

/** Mensaje de RabbitMQ: pide al microservicio el correo de verificación. Mismos campos que VerificationMessage del microservicio. */
public record VerificationMailMessage(String to, String name, String verificationUrl, Integer expiresInHours) {
}
