package com.gescom.mail.service;

/** El correo no se pudo preparar o entregar al servidor SMTP. */
public class MailDeliveryException extends RuntimeException {

    public MailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
