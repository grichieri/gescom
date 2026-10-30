package com.gescom.backend.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Exchange y colas del correo. Solo existe cuando app.mail.enabled=true.
 * Tiene que declarar EXACTAMENTE lo mismo que el microservicio de correo (nombres y argumentos):
 * RabbitMQ rechaza redeclarar una cola con argumentos distintos.
 */
@Configuration
@ConditionalOnProperty(name = "app.mail.enabled", havingValue = "true")
public class RabbitMailConfig {

    public static final String EXCHANGE = "gescom.mail";
    public static final String DEAD_EXCHANGE = "gescom.mail.dlx";

    public static final String VERIFICATION_QUEUE = "gescom.mail.verification";
    public static final String PASSWORD_RESET_QUEUE = "gescom.mail.password-reset";
    public static final String WELCOME_QUEUE = "gescom.mail.welcome";
    public static final String DEAD_QUEUE = "gescom.mail.dead";

    public static final String VERIFICATION_KEY = "verification";
    public static final String PASSWORD_RESET_KEY = "password-reset";
    public static final String WELCOME_KEY = "welcome";

    @Bean
    DirectExchange mailExchange() {
        return ExchangeBuilder.directExchange(EXCHANGE).durable(true).build();
    }

    @Bean
    DirectExchange mailDeadExchange() {
        return ExchangeBuilder.directExchange(DEAD_EXCHANGE).durable(true).build();
    }

    @Bean
    Queue verificationQueue() {
        return mailQueue(VERIFICATION_QUEUE);
    }

    @Bean
    Queue passwordResetQueue() {
        return mailQueue(PASSWORD_RESET_QUEUE);
    }

    @Bean
    Queue welcomeQueue() {
        return mailQueue(WELCOME_QUEUE);
    }

    @Bean
    Queue mailDeadQueue() {
        return QueueBuilder.durable(DEAD_QUEUE).build();
    }

    @Bean
    Binding verificationBinding() {
        return BindingBuilder.bind(verificationQueue()).to(mailExchange()).with(VERIFICATION_KEY);
    }

    @Bean
    Binding passwordResetBinding() {
        return BindingBuilder.bind(passwordResetQueue()).to(mailExchange()).with(PASSWORD_RESET_KEY);
    }

    @Bean
    Binding welcomeBinding() {
        return BindingBuilder.bind(welcomeQueue()).to(mailExchange()).with(WELCOME_KEY);
    }

    @Bean
    Binding mailDeadBinding() {
        return BindingBuilder.bind(mailDeadQueue()).to(mailDeadExchange()).with(DEAD_QUEUE);
    }

    /** Los mensajes viajan en JSON; el RabbitTemplate de Spring Boot usa este conversor automáticamente. */
    @Bean
    MessageConverter mailJsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    private static Queue mailQueue(String name) {
        return QueueBuilder.durable(name)
                .deadLetterExchange(DEAD_EXCHANGE)
                .deadLetterRoutingKey(DEAD_QUEUE)
                .build();
    }
}
