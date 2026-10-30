package com.gescom.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Ajustes del correo (application.yaml, bloque app.mail).
 * El interruptor es app.mail.enabled (variable de entorno MAIL_ENABLED):
 *  - false: no se envía ningún correo y el usuario que se registra queda validado al momento.
 *  - true : el registro publica un mensaje en RabbitMQ, el microservicio de correo envía el enlace
 *           y el usuario no puede entrar hasta pulsarlo.
 */
@Component
public class MailProperties {

    private final boolean enabled;
    private final String frontUrl;
    private final int tokenHours;

    public MailProperties(@Value("${app.mail.enabled:false}") boolean enabled,
                          @Value("${app.mail.front-url:http://localhost:5173}") String frontUrl,
                          @Value("${app.mail.token-hours:24}") int tokenHours) {
        this.enabled = enabled;
        this.frontUrl = frontUrl.endsWith("/") ? frontUrl.substring(0, frontUrl.length() - 1) : frontUrl;
        this.tokenHours = tokenHours;
    }

    public boolean isEnabled() {
        return enabled;
    }

    /** Dirección del front, sin barra final (los enlaces de los correos apuntan ahí). */
    public String getFrontUrl() {
        return frontUrl;
    }

    /** Horas de validez de los enlaces de los correos. */
    public int getTokenHours() {
        return tokenHours;
    }
}
