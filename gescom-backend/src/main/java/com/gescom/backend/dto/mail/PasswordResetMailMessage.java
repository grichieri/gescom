package com.gescom.backend.dto.mail;

/** Mensaje de RabbitMQ: pide el correo para restablecer una contraseña. Mismos campos que PasswordResetMessage del microservicio. */
public record PasswordResetMailMessage(String to, String name, String resetUrl, Integer expiresInHours) {
}
