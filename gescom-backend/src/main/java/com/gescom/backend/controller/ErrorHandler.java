package com.gescom.backend.controller;

import com.gescom.backend.exception.ArchivoNoValidoException;
import com.gescom.backend.exception.EntidadDuplicadaException;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.exception.AccesoDenegadoException;
import com.gescom.backend.exception.InvalidCredentialsException;
import com.gescom.backend.exception.TokenNoValidoException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class ErrorHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCredentialsException(InvalidCredentialsException ex) {
        return  ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Error de logueo",
                "mensaje", ex.getMessage()
        ));
    }

    // 403 - Cuenta sin verificar o desactivada, o sin cargo suficiente. JSON, como el resto de errores de login.
    @ExceptionHandler(AccesoDenegadoException.class)
    public ResponseEntity<Map<String, String>> handleAccesoDenegado(AccesoDenegadoException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", "Acceso denegado",
                "mensaje", ex.getMessage()
        ));
    }

    // 400 - Foto no válida (vacía, tipo no permitido, demasiadas) o demasiadas fotos en una incidencia
    @ExceptionHandler({ArchivoNoValidoException.class, IllegalArgumentException.class})
    public ResponseEntity<String> handleBadRequest(RuntimeException e) {
        return ResponseEntity.status(400).body("Error: " + e.getMessage());
    }

    // 400 - Enlace del correo no válido, usado o caducado
    @ExceptionHandler(TokenNoValidoException.class)
    public ResponseEntity<String> handleTokenNoValido(TokenNoValidoException e) {
        return ResponseEntity.status(400).body("Error: " + e.getMessage());
    }

    // Los ResponseStatusException que lanzan los servicios (400, 404...) conservan su código en vez de caer en el 500 de abajo
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<String> handleResponseStatus(org.springframework.web.server.ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode()).body("Error: " + e.getReason());
    }

    // 404 - Entidad no encontrada
    @ExceptionHandler(EntidadNoEncontradaException.class)
    public ResponseEntity<String> handleNotFound(EntidadNoEncontradaException e) {
        return ResponseEntity.status(404).body("Error: " + e.getMessage());
    }

    // 409 - Duplicado detectado por el service (antes de tocar la BD)
    @ExceptionHandler(EntidadDuplicadaException.class)
    public ResponseEntity<String> handleDuplicada(EntidadDuplicadaException e) {
        return ResponseEntity.status(409).body("Error: " + e.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrity(DataIntegrityViolationException e) {
        String message = "Ya existe un registro con esos datos únicos";
        int status = 409;
        String cause = e.getMostSpecificCause().getMessage();

        System.out.println(">>> DataIntegrityViolationException cause: " + cause); // TEMPORAL

        if (cause != null) {
            if (cause.contains("violates not-null constraint")) {
                message = "Faltan datos obligatorios";
                status = 400;
            } else if (cause.contains("uq_communities_nif")) {
                message = "Ya existe una comunidad con ese NIF";
            } else if (cause.contains("uq_communities_registration_code")
                    || cause.contains("uq_communities_registraion_code")) {
                message = "Ya existe una comunidad con ese código de registro";
            } else if (cause.contains("users") && cause.contains("dni")) {
                message = "Ya existe un usuario con ese DNI";
            } else if (cause.contains("users") && cause.contains("email")) {
                message = "Ya existe un usuario con ese email";
            } else if (cause.contains("users") && cause.contains("phone")) {
                message = "Ya existe un usuario con ese teléfono";
            } else if (cause.contains("ck_incidences_status")) {
                message = "El estado de la incidencia debe estar entre 1 y 3";
                status = 400;
            } else if (cause.contains("ck_incidences_priority")) {
                message = "La prioridad de la incidencia debe estar entre 1 y 3";
                status = 400;
            } else if (cause.contains("ck_incidences_resolution_date")) {
                message = "La fecha máxima de resolución no puede ser anterior a la fecha de creación";
                status = 400;
            }
        }
        return ResponseEntity.status(status).body("Error: " + message);
    }

    // 400 - Errores de validación (@Valid en los DTO)
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<String> handleValidation(
            org.springframework.web.bind.MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(err -> err.getField() + ": " + err.getDefaultMessage())
                .findFirst()
                .orElse("Datos inválidos");
        return ResponseEntity.status(400).body("Error: " + msg);
    }

    // 413 - Una foto o la petición entera superan los límites de spring.servlet.multipart (application.yaml)
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<String> handleMaxUploadSize(
            org.springframework.web.multipart.MaxUploadSizeExceededException e) {
        return ResponseEntity.status(413)
                .body("Error: Las fotos son demasiado grandes (máximo 10 MB cada una y 50 MB en total)");
    }

    // 500 - Cualquier otra RuntimeException (último recurso)
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException e) {
        e.printStackTrace();   // TEMPORAL, quitar en producción
        return ResponseEntity.status(500).body("Error: error interno, contacte a soporte");
    }
}