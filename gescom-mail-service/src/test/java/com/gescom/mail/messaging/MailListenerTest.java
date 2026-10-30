package com.gescom.mail.messaging;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import jakarta.validation.Validation;
import jakarta.validation.Validator;

import com.gescom.mail.message.PasswordResetMessage;
import com.gescom.mail.message.VerificationMessage;
import com.gescom.mail.service.MailDeliveryException;
import com.gescom.mail.service.MailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.AmqpRejectAndDontRequeueException;

class MailListenerTest {

    private MailService mailService;
    private MailListener listener;

    @BeforeEach
    void setUp() {
        mailService = mock(MailService.class);
        Validator validator = Validation.buildDefaultValidatorFactory().getValidator();
        listener = new MailListener(mailService, validator);
    }

    @Test
    void mensajeValidoSeEnvia() {
        VerificationMessage message = new VerificationMessage(
                "ana@ejemplo.com", "Ana", "http://localhost:5173/verify-email?token=abc", 24);

        listener.onVerification(message);

        verify(mailService).sendVerification(message);
    }

    @Test
    void mensajeInvalidoSeRechazaSinReencolarYNoSeEnvia() {
        VerificationMessage message = new VerificationMessage("no-es-un-correo", "Ana", "javascript:alert(1)", 24);

        assertThatThrownBy(() -> listener.onVerification(message))
                .isInstanceOf(AmqpRejectAndDontRequeueException.class)
                .hasMessageContaining("to")
                .hasMessageContaining("verificationUrl");
        verify(mailService, never()).sendVerification(any());
    }

    @Test
    void siFallaElEnvioLaExcepcionSubeParaQueSeReintente() {
        PasswordResetMessage message = new PasswordResetMessage(
                "ana@ejemplo.com", "Ana", "http://localhost:5173/reset-password?token=abc", 1);
        doThrow(new MailDeliveryException("smtp caído", new RuntimeException())).when(mailService)
                .sendPasswordReset(message);

        assertThatThrownBy(() -> listener.onPasswordReset(message)).isInstanceOf(MailDeliveryException.class);
    }
}
