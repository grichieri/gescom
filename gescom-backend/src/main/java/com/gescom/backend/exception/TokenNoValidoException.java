package com.gescom.backend.exception;

/** El enlace del correo no existe, ya se usó o ha caducado. Responde 400. */
public class TokenNoValidoException extends RuntimeException {
    public TokenNoValidoException(String message) {
        super(message);
    }
}
