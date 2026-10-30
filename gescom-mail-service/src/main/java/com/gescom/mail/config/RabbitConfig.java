package com.gescom.mail.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.ExchangeBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JavaTypeMapper;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Colas de correo. El back debe declarar EXACTAMENTE lo mismo (mismos nombres y argumentos): RabbitMQ rechaza
 * redeclarar una cola con argumentos distintos. Así da igual quién arranque primero.
 *
 * <pre>
 *   back --(routing key)--> gescom.mail --> cola gescom.mail.verification | .password-reset | .welcome
 *                                            └ si falla tras los reintentos --> gescom.mail.dlx --> gescom.mail.dead
 * </pre>
 */
@Configuration
public class RabbitConfig {

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
    DirectExchange deadExchange() {
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
    Queue deadQueue() {
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

    /** Todo lo que acaba en gescom.mail.dead se lee desde el panel de RabbitMQ (no hay listener). */
    @Bean
    Binding deadBinding() {
        return BindingBuilder.bind(deadQueue()).to(deadExchange()).with(DEAD_QUEUE);
    }

    /**
     * Mensajes en JSON. Con TypePrecedence.INFERRED el tipo sale del parámetro del listener y no de la
     * cabecera __TypeId__ que añade el back (que apunta a una clase del back que aquí no existe).
     */
    @Bean
    MessageConverter jsonMessageConverter() {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter();
        DefaultJackson2JavaTypeMapper typeMapper = new DefaultJackson2JavaTypeMapper();
        typeMapper.setTypePrecedence(Jackson2JavaTypeMapper.TypePrecedence.INFERRED);
        converter.setJavaTypeMapper(typeMapper);
        return converter;
    }

    private static Queue mailQueue(String name) {
        return QueueBuilder.durable(name)
                .deadLetterExchange(DEAD_EXCHANGE)
                .deadLetterRoutingKey(DEAD_QUEUE)
                .build();
    }
}
