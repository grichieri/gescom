package com.gescom.backend.exception;

/** El usuario está identificado pero no puede hacer esto (cuenta sin verificar, desactivada o sin cargo suficiente). Responde 403. */
public class AccesoDenegadoException extends RuntimeException {
    public AccesoDenegadoException(String message) {
        super(message);
    }
}
