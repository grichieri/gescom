package com.gescom.mail.service;

import java.io.UnsupportedEncodingException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import com.gescom.mail.config.MailProperties;
import com.gescom.mail.message.PasswordResetMessage;
import com.gescom.mail.message.VerificationMessage;
import com.gescom.mail.message.WelcomeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/** Prepara cada correo (plantilla + datos) y lo entrega al servidor SMTP. */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender sender;
    private final TemplateRenderer renderer;
    private final MailProperties properties;

    public MailService(JavaMailSender sender, TemplateRenderer renderer, MailProperties properties) {
        this.sender = sender;
        this.renderer = renderer;
        this.properties = properties;
    }

    public void sendVerification(VerificationMessage request) {
        send(request.to(), EmailTemplate.VERIFICATION, Map.of(
                "name", request.name(),
                "url", request.verificationUrl(),
                "expiryNote", expiryNote(request.expiresInHours())));
    }

    public void sendPasswordReset(PasswordResetMessage request) {
        send(request.to(), EmailTemplate.PASSWORD_RESET, Map.of(
                "name", request.name(),
                "url", request.resetUrl(),
                "expiryNote", expiryNote(request.expiresInHours())));
    }

    public void sendWelcome(WelcomeMessage request) {
        send(request.to(), EmailTemplate.WELCOME, Map.of(
                "name", request.name(),
                "communityName", request.communityName(),
                "url", request.setPasswordUrl(),
                "expiryNote", expiryNote(request.expiresInHours())));
    }

    private void send(String to, EmailTemplate template, Map<String, String> data) {
        // Variables comunes a todas las plantillas: el nombre de la aplicación y el título del correo
        Map<String, String> variables = new java.util.HashMap<>(data);
        variables.put("appName", properties.appName());
        variables.put("title", template.subject(properties.appName()));

        String html = renderer.renderHtml(template, variables);
        String text = renderer.renderText(template, variables);
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
            helper.setFrom(properties.from(), properties.fromName());
            helper.setTo(to);
            helper.setSubject(template.subject(properties.appName()));
            helper.setText(text, html);
            sender.send(message);
        } catch (MessagingException | UnsupportedEncodingException | MailException e) {
            // En el registro no se escribe la dirección completa: es un dato personal
            log.error("No se pudo enviar el correo {} a {}: {}", template, mask(to), e.getMessage());
            throw new MailDeliveryException("No se pudo enviar el correo", e);
        }
        log.info("Correo {} enviado a {}", template, mask(to));
    }

    private static String expiryNote(Integer hours) {
        if (hours == null) {
            return "";
        }
        return "Este enlace caduca en " + hours + (hours == 1 ? " hora." : " horas.");
    }

    /** juan.perez@ejemplo.com -> j***@ejemplo.com */
    static String mask(String email) {
        int at = email.indexOf('@');
        if (at <= 0) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(at);
    }
}
