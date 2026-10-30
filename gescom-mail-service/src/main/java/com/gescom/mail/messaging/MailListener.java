package com.gescom.mail.messaging;

import java.util.Set;
import java.util.stream.Collectors;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;

import com.gescom.mail.config.RabbitConfig;
import com.gescom.mail.message.PasswordResetMessage;
import com.gescom.mail.message.VerificationMessage;
import com.gescom.mail.message.WelcomeMessage;
import com.gescom.mail.service.MailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Lee las colas de correo.
 *
 * <ul>
 *   <li>Mensaje inválido (faltan campos, correo mal escrito...): reintentar no lo arreglaría, así que se
 *       rechaza sin reencolar y va directo a la cola de fallidos.</li>
 *   <li>Fallo al enviar (SMTP caído): la excepción sube, Spring reintenta con espera y, si se agotan los
 *       intentos, el mensaje va a la cola de fallidos (ver spring.rabbitmq.listener en application.yaml).</li>
 * </ul>
 */
@Component
public class MailListener {

    private static final Logger log = LoggerFactory.getLogger(MailListener.class);

    private final MailService mailService;
    private final Validator validator;

    public MailListener(MailService mailService, Validator validator) {
        this.mailService = mailService;
        this.validator = validator;
    }

    @RabbitListener(queues = RabbitConfig.VERIFICATION_QUEUE)
    public void onVerification(VerificationMessage message) {
        validate(message);
        mailService.sendVerification(message);
    }

    @RabbitListener(queues = RabbitConfig.PASSWORD_RESET_QUEUE)
    public void onPasswordReset(PasswordResetMessage message) {
        validate(message);
        mailService.sendPasswordReset(message);
    }

    @RabbitListener(queues = RabbitConfig.WELCOME_QUEUE)
    public void onWelcome(WelcomeMessage message) {
        validate(message);
        mailService.sendWelcome(message);
    }

    private <T> void validate(T message) {
        if (message == null) {
            throw new AmqpRejectAndDontRequeueException("Mensaje vacío");
        }
        Set<ConstraintViolation<T>> violations = validator.validate(message);
        if (!violations.isEmpty()) {
            String detail = violations.stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .sorted()
                    .collect(Collectors.joining("; "));
            // No se escribe el mensaje entero: lleva el correo y el enlace con el token
            log.error("Mensaje de correo rechazado por no ser válido: {}", detail);
            throw new AmqpRejectAndDontRequeueException("Mensaje no válido: " + detail);
        }
    }
}
