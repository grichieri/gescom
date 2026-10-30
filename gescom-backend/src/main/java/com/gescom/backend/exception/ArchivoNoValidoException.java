package com.gescom.backend.exception;

/** Un archivo subido no se acepta (vacío, tipo no permitido, no es una imagen o hay demasiados). Responde 400. */
public class ArchivoNoValidoException extends RuntimeException {
    public ArchivoNoValidoException(String message) {
        super(message);
    }
}
