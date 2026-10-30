package com.gescom.mail.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Ajustes propios del microservicio (prefijo gescom.mail en application.yaml).
 *
 * @param from     dirección que aparece como remitente
 * @param fromName nombre que aparece junto al remitente
 * @param appName  nombre de la aplicación que sale en los asuntos y en el pie de los correos
 */
@ConfigurationProperties(prefix = "gescom.mail")
public record MailProperties(String from, String fromName, String appName) {

    public MailProperties {
        if (from == null || from.isBlank()) {
            throw new IllegalStateException("Falta el remitente: define la variable de entorno MAIL_FROM");
        }
        if (fromName == null || fromName.isBlank()) {
            fromName = "Gescom";
        }
        if (appName == null || appName.isBlank()) {
            appName = "Gescom";
        }
    }
}
