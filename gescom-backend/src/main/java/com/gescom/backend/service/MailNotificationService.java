package com.gescom.backend.service;

import com.gescom.backend.config.MailProperties;
import com.gescom.backend.config.RabbitMailConfig;
import com.gescom.backend.dto.mail.PasswordResetMailMessage;
import com.gescom.backend.dto.mail.VerificationMailMessage;
import com.gescom.backend.dto.mail.WelcomeMailMessage;
import com.gescom.backend.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * Publica en RabbitMQ los mensajes que el microservicio de correo convierte en correos.
 * Con app.mail.enabled=false no hace nada: ni toca RabbitMQ ni necesita el microservicio.
 * Si RabbitMQ no responde, el error se registra y la operación del usuario (registro, etc.) no falla;
 * el usuario puede pedir que se le reenvíe el correo.
 */
@Service
public class MailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(MailNotificationService.class);

    private final MailProperties mailProperties;
    private final ObjectProvider<RabbitTemplate> rabbitTemplate;

    public MailNotificationService(MailProperties mailProperties, ObjectProvider<RabbitTemplate> rabbitTemplate) {
        this.mailProperties = mailProperties;
        this.rabbitTemplate = rabbitTemplate;
    }

    public boolean isEnabled() {
        return mailProperties.isEnabled();
    }

    /** Correo con el enlace para verificar la cuenta recién creada. */
    public boolean sendVerification(User user, String token) {
        String url = mailProperties.getFrontUrl() + "/account-activated?token=" + encode(token);
        return publish(RabbitMailConfig.VERIFICATION_KEY,
                new VerificationMailMessage(user.getEmail(), displayName(user), url, mailProperties.getTokenHours()));
    }

    /** Correo con el enlace para restablecer la contraseña. */
    public boolean sendPasswordReset(User user, String token) {
        String url = mailProperties.getFrontUrl() + "/reset-password?token=" + encode(token);
        return publish(RabbitMailConfig.PASSWORD_RESET_KEY,
                new PasswordResetMailMessage(user.getEmail(), displayName(user), url, mailProperties.getTokenHours()));
    }

    /** Correo de bienvenida a un usuario dado de alta por la administración, con enlace para definir su contraseña. */
    public boolean sendWelcome(User user, String communityName, String token) {
        String url = mailProperties.getFrontUrl() + "/reset-password?token=" + encode(token);
        return publish(RabbitMailConfig.WELCOME_KEY,
                new WelcomeMailMessage(user.getEmail(), displayName(user), communityName, url, mailProperties.getTokenHours()));
    }

    private boolean publish(String routingKey, Object message) {
        if (!mailProperties.isEnabled()) {
            return false;
        }
        RabbitTemplate template = rabbitTemplate.getIfAvailable();
        if (template == null) {
            log.warn("Correo activado pero no hay RabbitTemplate: no se envía el mensaje '{}'", routingKey);
            return false;
        }
        try {
            template.convertAndSend(RabbitMailConfig.EXCHANGE, routingKey, message);
            return true;
        } catch (AmqpException e) {
            // No se escribe el mensaje: lleva el correo y el enlace con el token
            log.error("No se pudo publicar el mensaje de correo '{}' en RabbitMQ: {}", routingKey, e.getMessage());
            return false;
        }
    }

    private static String displayName(User user) {
        return user.getName() == null || user.getName().isBlank() ? user.getEmail() : user.getName();
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
