package com.gescom.backend.service;

import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.PropertyRepository;
import com.gescom.backend.dto.PropertyRequest;
import com.gescom.backend.dto.PropertyResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.Properties;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final CommunityRepository communityRepository;
    private final PropertyMapper propertyMapper;

    // ------------------- LISTAR -------------------

    @Transactional(readOnly = true)
    public List<PropertyResponse> obtenerTodos() {
        return propertyRepository.findAll().stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PropertyResponse obtenerPorId(Long id) {
        Properties property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Propiedad no encontrada"));
        return propertyMapper.toResponse(property);
    }

    @Transactional(readOnly = true)
    public List<PropertyResponse> obtenerPorComunidad(Long communityId) {
        return propertyRepository.findByCommunity_CommunityId(communityId).stream()
                .map(propertyMapper::toResponse)
                .toList();
    }

    // ------------------- CREAR -------------------

    @Transactional
    public PropertyResponse guardar(PropertyRequest request) {
        Communities community = communityRepository.findById(request.getCommunityId())
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada"));

        Properties property = propertyMapper.toEntity(request);
        property.setCommunity(community);   // ← aquí se asigna la FK
        Properties saved = propertyRepository.save(property);
        return propertyMapper.toResponse(saved);
    }

    // ------------------- ACTUALIZAR -------------------

    @Transactional
    public PropertyResponse actualizar(Long id, PropertyRequest request) {
        Properties property = propertyRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Propiedad no encontrada"));

        // Si cambia la comunidad, la recargamos
        if (!property.getCommunity().getCommunityId().equals(request.getCommunityId())) {
            Communities community = communityRepository.findById(request.getCommunityId())
                    .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada"));
            property.setCommunity(community);
        }

        propertyMapper.updateEntityFromRequest(request, property);
        Properties updated = propertyRepository.save(property);
        return propertyMapper.toResponse(updated);
    }

    // ------------------- BORRAR -------------------

    @Transactional
    public void eliminar(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new EntidadNoEncontradaException("Propiedad no encontrada");
        }
        propertyRepository.deleteById(id);
    }
}