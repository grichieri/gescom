package com.gescom.backend.dto.mail;

/** Mensaje de RabbitMQ: avisa a un usuario dado de alta por la administración. Mismos campos que WelcomeMessage del microservicio. */
public record WelcomeMailMessage(String to, String name, String communityName, String setPasswordUrl, Integer expiresInHours) {
}
