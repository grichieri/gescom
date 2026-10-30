package com.gescom.backend.service;

import com.gescom.backend.data.*;
import com.gescom.backend.dto.*;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.IncidencePicture;
import com.gescom.backend.entity.Incidences;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.ArchivoNoValidoException;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.IncidenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.ArrayList;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class IncidenceService {

    private static final short STATUS_PENDING = 1;
    private static final int MAX_PICTURES = 5;
    /** Subcarpeta de uploads/ donde se guardan las fotos de las incidencias */
    private static final String CARPETA_FOTOS = "incidencias";
    private final FileStorageService fileStorageService;
    private final IncidenceRepository incidenceRepository;
    private final IncidencePictureRepository incidencePictureRepository;
    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final IncidenceMapper incidenceMapper;

    public List<IncidenceResponse> obtenerTodos() {
        return incidenceRepository.findAll().stream()
                .map(incidenceMapper::toResponse)
                .toList();
    }

    public List<IncidenceResponse> obtenerTodosPorComunidad(Long id){
        return incidenceRepository.findByCommunityCommunityId(id).stream()
                .map(incidenceMapper::toResponse)
                .toList();
    }

    public IncidenceResponse obtenerPorId(Integer id) {
        Incidences incidence = incidenceRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Incidencia no encontrada. Id: " + id));
        return incidenceMapper.toResponse(incidence);
    }

   /* @Transactional
    public IncidenceResponse guardar(IncidenceRequest request) {
        Communities community = communityRepository.findById(request.communityId())
                .orElseThrow(() -> new EntidadNoEncontradaException(
                        "Comunidad no encontrada. Id: " + request.communityId()));

        User reportedBy = userRepository.findById(request.reportedByUserId())
                .orElseThrow(() -> new EntidadNoEncontradaException(
                        "Usuario no encontrado. Id: " + request.reportedByUserId()));

        validarNumeroFotos(request.picture());

        Incidences incidence = incidenceMapper.toEntity(request);
        incidence.setCommunity(community);
        incidence.setReportedBy(reportedBy);
        incidence.setStatus(1);
        if (incidence.getPriority() == null) {
            incidence.setPriority((short) 1);
        }

        // Añadir fotos (si vienen)
        if (request.picture() != null) {
            for (IncidencePictureRequest pReq : request.picture()) {
                IncidencePicture picture = new IncidencePicture();
                picture.setUrl(pReq.getUrl());
                incidence.addPicture(picture);
            }
        }

        Incidences saved = incidenceRepository.save(incidence);
        return incidenceMapper.toResponse(saved);
    }*/

    /**
     * Crea la incidencia con fotos subidas como archivos (POST multipart).
     * Cada archivo se guarda en disco y se añade a la incidencia como una foto más con su URL
     * (/upload/incidencias/...); el resto lo hace guardar(request).
     * Si algo falla, se borran los archivos ya guardados para no dejar fotos huérfanas en disco.
     */
    @Transactional
    public IncidenceResponse guardar(IncidenceRequest request, List<MultipartFile> fotos) {
        List<MultipartFile> archivos = fotos == null ? List.of() : fotos;
        List<IncidencePictureRequest> pictures = new ArrayList<>(
                request.picture() == null ? List.of() : request.picture());

        // Primero se valida todo; así, si una foto no vale, no se guarda ninguna
        if (pictures.size() + archivos.size() > MAX_PICTURES) {
            throw new ArchivoNoValidoException("Una incidencia no puede tener más de " + MAX_PICTURES + " fotos");
        }
        archivos.forEach(fileStorageService::validarImagen);

        List<String> urlsGuardadas = new ArrayList<>();
        try {
            for (MultipartFile foto : archivos) {
                String url = fileStorageService.guardar(foto, CARPETA_FOTOS);
                urlsGuardadas.add(url);
                IncidencePictureRequest picture = new IncidencePictureRequest();
                picture.setUrl(url);
                pictures.add(picture);
            }
            request = new IncidenceRequest(
                    request.communityId(),
                    request.propertyId(),
                    request.reportedByUserId(),
                    request.name(),
                    request.description(),
                    request.priority(),
                    request.maxResolutionDate(),
                    pictures);
            return guardar(request);
        } catch (RuntimeException e) {
            urlsGuardadas.forEach(fileStorageService::borrar);
            throw e;
        }
    }

    @Transactional
    public IncidenceResponse actualizar(Integer id, IncidenceUpdateRequest request) {
        Incidences incidence = incidenceRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Incidencia no encontrada. Id: " + id));
        if (request.communityId() != null) {
            Communities community = communityRepository.findById(request.communityId())
                    .orElseThrow(() -> new EntidadNoEncontradaException(
                            "Comunidad no encontrada. Id: " + request.communityId()));
            incidence.setCommunity(community);
        }
        if (request.reportedByUserId() != null) {
            User reportedBy = userRepository.findById(request.reportedByUserId())
                    .orElseThrow(() -> new EntidadNoEncontradaException(
                            "Usuario no encontrado. Id: " + request.reportedByUserId()));
            incidence.setReportedBy(reportedBy);
        }

        validarNumeroFotos(request.picture());
        // El plazo máximo solo se valida si cambia (así no se rechaza guardar el estado de una incidencia con un plazo ya vencido)
        if (request.maxResolutionDate() != null && !request.maxResolutionDate().equals(incidence.getMaxResolutionDate())) {
            validarFechaLimite(request.maxResolutionDate());
        }
        incidenceMapper.updateEntity(request, incidence);
        // Gestión de fotos: si llega lista, sustituimos la colección existente
        if (request.picture() != null) {
            actualizarFotos(incidence, request.picture());
        }
        Incidences actualizado = incidenceRepository.save(incidence);
        return incidenceMapper.toResponse(actualizado);
    }

    public void eliminar(Integer id) {
        if (!incidenceRepository.existsById(id)) {
            throw new EntidadNoEncontradaException("Incidencia no encontrada. Id: " + id);
        }
        incidenceRepository.deleteById(id);
    }

    // ---------- Helpers ----------

    private void validarNumeroFotos(List<IncidencePictureRequest> pictures) {
        if (pictures != null && pictures.size() > MAX_PICTURES) {
            throw new IllegalArgumentException(
                    "Una incidencia no puede tener más de " + MAX_PICTURES + " fotos");
        }
    }

    /**
     * Sincroniza la colección de fotos de la incidencia con la lista recibida.
     * - Si una foto trae pictureId, se busca y se actualiza su url.
     * - Si no trae pictureId, se crea una nueva.
     * - Las fotos que ya no están en la lista se eliminan (orphanRemoval).
     */
    private void actualizarFotos(Incidences incidence, List<IncidencePictureRequest> nuevas) {
        // Mapa de fotos existentes por id
        var existentes = incidence.getPictures().stream()
                .filter(p -> p.getPictureId() != null)
                .collect(java.util.stream.Collectors.toMap(
                        IncidencePicture::getPictureId, p -> p));

        // Marcar las que se van a conservar
        var idsConservados = nuevas.stream()
                .map(IncidencePictureRequest::getPictureId)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());

        // Borrar las que ya no vienen en la lista
        incidence.getPictures().removeIf(p ->
                p.getPictureId() != null && !idsConservados.contains(p.getPictureId()));

        // Actualizar o crear
        for (IncidencePictureRequest pReq : nuevas) {
            if (pReq.getPictureId() != null) {
                IncidencePicture existente = existentes.get(pReq.getPictureId());
                if (existente == null) {
                    throw new EntidadNoEncontradaException(
                            "Foto no encontrada. Id: " + pReq.getPictureId());
                }
                existente.setUrl(pReq.getUrl());
            } else {
                IncidencePicture nueva = new IncidencePicture();
                nueva.setUrl(pReq.getUrl());
                incidence.addPicture(nueva);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<IncidenceResponse> obtenerTodas(IncidenceFilter filtro) {
        validarRango("createdFrom", filtro.createdFrom(), "createdTo", filtro.createdTo());
        validarRango("deadlineFrom", filtro.deadlineFrom(), "deadlineTo", filtro.deadlineTo());

        // Más recientes primero; el id desempata las que tienen la misma fecha para que el orden sea estable
        Sort orden = Sort.by(Sort.Direction.DESC, "createdDate").and(Sort.by(Sort.Direction.DESC, "id"));

        return incidenceRepository
                .findAll(IncidenceSpecifications.from(filtro), orden)
                .stream()
                .map(incidenceMapper::toResponse)
                .toList();
    }

    public IncidenceResponse guardar(IncidenceRequest request) {
        validarFechaLimite(request.maxResolutionDate());

        Incidences incidence = incidenceMapper.toEntity(request);
        incidence.setCommunity(communityRepository.findById(request.communityId())
                .orElseThrow(() -> noEncontrado("Comunidad", request.communityId())));
        incidence.setReportedBy(userRepository.findById(request.reportedByUserId())
                .orElseThrow(() -> noEncontrado("Usuario", request.reportedByUserId())));

        // El mapper ignora "pictures", así que las fotos del cuerpo se añaden aquí (si no, se guardan en disco
        // pero no quedan enlazadas a la incidencia en la tabla incidence_pictures)
        if (request.picture() != null) {
            for (IncidencePictureRequest pReq : request.picture()) {
                IncidencePicture picture = new IncidencePicture();
                picture.setUrl(pReq.getUrl());
                incidence.addPicture(picture);
            }
        }

        return incidenceMapper.toResponse(incidenceRepository.save(incidence));
    }

    /*public IncidenceResponse actualizar(Long id, IncidenceUpdateRequest request) {
        validarFechaLimite(request.maxResolutionDate());

        Incidences incidence = buscar(id);
        incidenceMapper.updateEntity(request, incidence);

        return incidenceMapper.toResponse(incidenceRepository.save(incidence));
    }*/

    private Incidences buscar(Integer id) {
        return incidenceRepository.findById(id).orElseThrow(() -> noEncontrado("Incidencia", id));
    }

    private void validarRango(String desdeNombre, LocalDate desde, String hastaNombre, LocalDate hasta) {
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    desdeNombre + " no puede ser posterior a " + hastaNombre);
        }
    }

    private void validarFechaLimite(LocalDate fecha) {
        if (fecha != null && fecha.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha máxima de resolución no puede ser anterior a hoy");
        }
    }

    private ResponseStatusException noEncontrado(String entidad, Number id) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, entidad + " no encontrada: " + id);
    }
}