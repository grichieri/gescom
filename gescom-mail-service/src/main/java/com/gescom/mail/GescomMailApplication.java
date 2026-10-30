package com.gescom.mail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Microservicio de correo de Gescom: escucha las colas de RabbitMQ y envía los correos por SMTP. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class GescomMailApplication {

    public static void main(String[] args) {
        SpringApplication.run(GescomMailApplication.class, args);
    }
}
