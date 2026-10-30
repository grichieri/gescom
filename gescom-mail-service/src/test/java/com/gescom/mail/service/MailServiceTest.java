package com.gescom.mail.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;

import com.gescom.mail.config.MailProperties;
import com.gescom.mail.message.VerificationMessage;
import com.gescom.mail.message.WelcomeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

class MailServiceTest {

    private JavaMailSender sender;
    private MailService service;

    @BeforeEach
    void setUp() {
        sender = mock(JavaMailSender.class);
        when(sender.createMimeMessage()).thenReturn(new MimeMessage((Session) null));
        MailProperties properties = new MailProperties("no-reply@gescom.local", "Gescom", "Gescom");
        service = new MailService(sender, new TemplateRenderer(), properties);
    }

    @Test
    void enviaLaVerificacionConAsuntoYDestinatario() throws Exception {
        service.sendVerification(new VerificationMessage(
                "ana@ejemplo.com", "Ana", "http://localhost:5173/verify?token=abc", 24));

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        MimeMessage message = captor.getValue();
        assertThat(message.getSubject()).isEqualTo("Verifica tu cuenta de Gescom");
        assertThat(message.getAllRecipients()[0].toString()).isEqualTo("ana@ejemplo.com");
    }

    @Test
    void enviaLaBienvenida() throws Exception {
        service.sendWelcome(new WelcomeMessage(
                "ana@ejemplo.com", "Ana", "Comunidad Sol", "http://localhost:5173/reset-password?token=t", null));

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(sender).send(captor.capture());
        assertThat(captor.getValue().getSubject()).isEqualTo("Tu cuenta de Gescom está lista");
    }

    @Test
    void siFallaElServidorSmtpLanzaMailDeliveryException() {
        doThrow(new MailSendException("smtp caído")).when(sender).send(any(MimeMessage.class));

        assertThatThrownBy(() -> service.sendVerification(new VerificationMessage(
                "ana@ejemplo.com", "Ana", "http://localhost:5173/verify?token=abc", 24)))
                .isInstanceOf(MailDeliveryException.class);
    }

    @Test
    void enmascaraLaDireccion() {
        assertThat(MailService.mask("juan.perez@ejemplo.com")).isEqualTo("j***@ejemplo.com");
        assertThat(MailService.mask("sin-arroba")).isEqualTo("***");
    }
}
