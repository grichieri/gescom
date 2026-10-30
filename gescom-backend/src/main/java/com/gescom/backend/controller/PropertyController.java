package com.gescom.backend.controller;

import com.gescom.backend.dto.PropertyRequest;
import com.gescom.backend.dto.PropertyResponse;
import com.gescom.backend.service.PropertyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    // GET /api/properties
    @GetMapping
    public ResponseEntity<List<PropertyResponse>> obtenerTodos() {
        return ResponseEntity.ok(propertyService.obtenerTodos());
    }

    // GET /api/properties/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PropertyResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(propertyService.obtenerPorId(id));
    }

    // GET /api/properties/community/{communityId}
    @GetMapping("/community/{communityId}")
    public ResponseEntity<List<PropertyResponse>> obtenerPorComunidad(@PathVariable Long communityId) {
        return ResponseEntity.ok(propertyService.obtenerPorComunidad(communityId));
    }

    // POST /api/properties
    @PostMapping
    public ResponseEntity<PropertyResponse> crear(@Valid @RequestBody PropertyRequest request) {
        PropertyResponse created = propertyService.guardar(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // PUT /api/properties/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PropertyResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PropertyRequest request) {
        return ResponseEntity.ok(propertyService.actualizar(id, request));
    }

    // DELETE /api/properties/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        propertyService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}