package com.gescom.backend.dto;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;

import java.time.LocalDate;

/**
 * Filtros opcionales del listado de incidencias (INC-LB01). Pensado para recibirse como
 * parámetros de la URL, por ejemplo GET /api/incidences?communityId=1&status=1&createdFrom=2026-10-01.
 * Los que vienen vacíos no se aplican. Para conectarlo al controlador y al servicio ver
 * INC-B08-cambios-para-union.patch.
 */
public record IncidenceFilter(
        Long communityId,
        Short status,       // 1: Pendiente, 2: En progreso, 3: Resuelto
        Short priority,     // 1: Baja, 2: Media, 3: Alta
        @DateTimeFormat(iso = ISO.DATE) LocalDate createdFrom,
        @DateTimeFormat(iso = ISO.DATE) LocalDate createdTo,
        @DateTimeFormat(iso = ISO.DATE) LocalDate deadlineFrom,
        @DateTimeFormat(iso = ISO.DATE) LocalDate deadlineTo) {
}
