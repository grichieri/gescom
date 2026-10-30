package com.gescom.backend.dto;

/** Respuesta de las rutas que dependen del correo: dice si el envío de correos está activado. */
public record MailStatusResponse(String mensaje, boolean emailEnabled) {
}
