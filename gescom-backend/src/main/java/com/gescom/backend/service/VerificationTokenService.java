package com.gescom.backend.service;

import com.gescom.backend.config.MailProperties;
import com.gescom.backend.data.VerificationTokenRepository;
import com.gescom.backend.entity.User;
import com.gescom.backend.entity.VerificationToken;
import com.gescom.backend.exception.TokenNoValidoException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

/** Crea y consume los enlaces de un solo uso que se mandan por correo. */
@Service
@RequiredArgsConstructor
public class VerificationTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final VerificationTokenRepository tokenRepository;
    private final MailProperties mailProperties;

    /** Crea un enlace nuevo para el usuario y devuelve su texto (64 caracteres). */
    @Transactional
    public String create(User user, short type) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);

        VerificationToken entity = new VerificationToken();
        entity.setUser(user);
        entity.setToken(token);
        entity.setType(type);
        entity.setExpiresAt(LocalDateTime.now().plusHours(mailProperties.getTokenHours()));
        tokenRepository.save(entity);
        return token;
    }

    /** Marca el enlace como usado y devuelve su usuario. Falla si no existe, es de otro tipo, ya se usó o caducó. */
    @Transactional
    public User consume(String token, short type) {
        VerificationToken entity = tokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenNoValidoException("El enlace no es válido."));
        if (entity.getType() != type) {
            throw new TokenNoValidoException("El enlace no es válido.");
        }
        if (entity.getUsedAt() != null) {
            throw new TokenNoValidoException("Este enlace ya se ha usado.");
        }
        if (entity.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new TokenNoValidoException("El enlace ha caducado. Solicita uno nuevo.");
        }
        entity.setUsedAt(LocalDateTime.now());
        tokenRepository.save(entity);
        return entity.getUser();
    }
}
