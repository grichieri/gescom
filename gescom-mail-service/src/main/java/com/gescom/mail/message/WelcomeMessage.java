package com.gescom.mail.message;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/**
 * Avisa a un usuario al que el superadmin ha dado de alta, para que defina su contraseña.
 * No se envía ninguna contraseña por correo: el enlace lleva a la pantalla de definir contraseña.
 *
 * @param to             correo del usuario
 * @param name           nombre con el que se le saluda
 * @param communityName  comunidad en la que se le ha dado de alta
 * @param setPasswordUrl enlace completo que el back ha generado (con el token) y que abre el front
 * @param expiresInHours horas de validez del enlace; opcional, solo para avisar en el correo
 */
public record WelcomeMessage(
        @NotBlank(message = "no puede estar vacío") @Email(message = "no es un correo válido") @Size(max = 255, message = "no puede superar 255 caracteres") String to,
        @NotBlank(message = "no puede estar vacío") @Size(max = 150, message = "no puede superar 150 caracteres") String name,
        @NotBlank(message = "no puede estar vacío") @Size(max = 150, message = "no puede superar 150 caracteres") String communityName,
        @NotBlank(message = "no puede estar vacío") @Size(max = 2000, message = "no puede superar 2000 caracteres")
        @Pattern(regexp = "^https?://\\S+$", message = "debe ser una dirección http o https") String setPasswordUrl,
        @Positive(message = "debe ser mayor que cero") Integer expiresInHours) {
}
