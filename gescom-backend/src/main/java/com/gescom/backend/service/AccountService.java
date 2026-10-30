package com.gescom.backend.service;

import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.MailStatusResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.User;
import com.gescom.backend.entity.VerificationToken;
import com.gescom.backend.exception.ArchivoNoValidoException;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Operaciones de cuenta: verificación del correo, contraseña olvidada, cambio de contraseña y avatar.
 * Las que envían correo solo lo hacen con app.mail.enabled=true (ver MailNotificationService).
 */
@Service
@RequiredArgsConstructor
public class AccountService {

    /** Subcarpeta de uploads/ donde se guardan los avatares */
    private static final String CARPETA_AVATARES = "avatares";

    private final UserRepository userRepository;
    private final VerificationTokenService tokenService;
    private final MailNotificationService mailService;
    private final FileStorageService fileStorageService;

    /**
     * Después de crear un usuario por el registro: si el correo está activado, genera el enlace y lo manda.
     * Devuelve true cuando el usuario tendrá que verificar su correo antes de entrar.
     */
    public boolean startEmailVerification(User user) {
        if (!mailService.isEnabled()) {
            return false;
        }
        String token = tokenService.create(user, VerificationToken.EMAIL_VERIFICATION);
        mailService.sendVerification(user, token);
        return true;
    }

    /** Pulsar el enlace del correo: marca al usuario como validado. */
    @Transactional
    public void verifyEmail(String token) {
        User user = tokenService.consume(token, VerificationToken.EMAIL_VERIFICATION);
        user.setValidated(true);
        userRepository.save(user);
    }

    /** Reenvía el correo de verificación. Responde igual exista o no la cuenta, para no revelar qué correos hay registrados. */
    public MailStatusResponse resendVerification(String email) {
        if (!mailService.isEnabled()) {
            return new MailStatusResponse("El envío de correos no está activado.", false);
        }
        User user = userRepository.findByEmail(email == null ? "" : email.trim());
        if (user != null && !user.isValidated()) {
            String token = tokenService.create(user, VerificationToken.EMAIL_VERIFICATION);
            mailService.sendVerification(user, token);
        }
        return new MailStatusResponse("Si la cuenta existe y está pendiente de verificar, recibirás un correo.", true);
    }

    /** Contraseña olvidada: manda el enlace para restablecerla. Responde igual exista o no la cuenta. */
    public MailStatusResponse forgotPassword(String email) {
        if (!mailService.isEnabled()) {
            return new MailStatusResponse("El envío de correos no está activado.", false);
        }
        User user = userRepository.findByEmail(email == null ? "" : email.trim());
        if (user != null && user.isActive() && !user.isDisabled()) {
            String token = tokenService.create(user, VerificationToken.PASSWORD_RESET);
            mailService.sendPasswordReset(user, token);
        }
        return new MailStatusResponse("Si la cuenta existe, recibirás un correo con las instrucciones.", true);
    }

    /** Pulsar el enlace de restablecer o definir contraseña. El correo queda también como verificado. */
    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = tokenService.consume(token, VerificationToken.PASSWORD_RESET);
        user.setPassword(newPassword);
        user.setValidated(true);
        userRepository.save(user);
    }

    /** Cambio de contraseña desde el perfil (el usuario ya está identificado por el token). */
    @Transactional
    public void changePassword(long userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: " + userId));
        user.setPassword(newPassword);
        userRepository.save(user);
    }

    /** Guarda la foto de perfil en disco y deja su URL en el usuario. Devuelve la URL. */
    @Transactional
    public String changeAvatar(long userId, MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            throw new ArchivoNoValidoException("No se ha recibido ninguna imagen");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: " + userId));
        fileStorageService.validarImagen(avatar);
        String previous = user.getAvatar();
        String url = fileStorageService.guardar(avatar, CARPETA_AVATARES);
        user.setAvatar(url);
        userRepository.save(user);
        if (previous != null && previous.startsWith(FileStorageService.URL_PREFIX)) {
            fileStorageService.borrar(previous);
        }
        return url;
    }

    /** Alta hecha por la administración: si el correo está activado, avisa al usuario con un enlace para definir su contraseña. */
    public void sendWelcome(User user, Communities community) {
        if (!mailService.isEnabled()) {
            return;
        }
        String token = tokenService.create(user, VerificationToken.PASSWORD_RESET);
        mailService.sendWelcome(user, community.getName(), token);
    }
}
