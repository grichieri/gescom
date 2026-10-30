package com.gescom.mail.service;

/** Los correos que sabe enviar el microservicio: el nombre de sus plantillas y su asunto. */
public enum EmailTemplate {

    VERIFICATION("verification", "Verifica tu cuenta de %s"),
    PASSWORD_RESET("password-reset", "Restablece tu contraseña de %s"),
    WELCOME("welcome", "Tu cuenta de %s está lista");

    private final String resource;
    private final String subjectFormat;

    EmailTemplate(String resource, String subjectFormat) {
        this.resource = resource;
        this.subjectFormat = subjectFormat;
    }

    /** Nombre de los archivos de plantilla (sin extensión) en templates/email. */
    public String resource() {
        return resource;
    }

    public String subject(String appName) {
        return String.format(subjectFormat, appName);
    }
}
