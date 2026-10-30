package com.gescom.backend.service;

import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.dto.CommunityRequest;
import com.gescom.backend.dto.CommunityResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.exception.EntidadDuplicadaException;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.CommunityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMapper communityMapper;

    public List<CommunityResponse> obtenerTodos() {
        return communityRepository.findAll().stream()
                .map(communityMapper::toResponse)
                .collect(Collectors.toList());
    }

    public CommunityResponse obtenerPorId(Long id) {
        Communities community = communityRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada"));
        return communityMapper.toResponse(community);
    }

    public CommunityResponse guardar(CommunityRequest request) {
        if (communityRepository.existsByNif(request.getNif())) {
            throw new EntidadDuplicadaException("Ya existe una comunidad con ese NIF");
        }

        Communities community = communityMapper.toEntity(request);
        community.setIsDeleted(false);
        return communityMapper.toResponse(communityRepository.save(community));
    }

    @Transactional
    public CommunityResponse actualizar(Long id, CommunityRequest request) {
        Communities community = communityRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada"));

        communityMapper.updateEntityFromRequest(request, community);
        Communities actualizado = communityRepository.save(community);
        return communityMapper.toResponse(actualizado);
    }

    public void eliminar(Long id) {
        if (!communityRepository.existsById(id)) {
            throw new EntidadNoEncontradaException("Comunidad no encontrada");
        }
        communityRepository.deleteById(id);
    }
}