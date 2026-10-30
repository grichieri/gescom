package com.gescom.backend.controller;

import com.gescom.backend.dto.IncidenceCommentCreateRequest;
import com.gescom.backend.dto.IncidenceCommentItemResponse;
import com.gescom.backend.dto.IncidenceDetailResponse;
import com.gescom.backend.dto.IncidenceRequest;
import com.gescom.backend.dto.IncidenceResponse;
import com.gescom.backend.dto.IncidenceFilter;
import com.gescom.backend.dto.IncidenceUpdateRequest;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.AccesoDenegadoException;
import com.gescom.backend.service.AccessService;
import com.gescom.backend.service.IncidenceFollowUpService;
import com.gescom.backend.service.IncidenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("api/incidences")
@RequiredArgsConstructor
public class IncidencesController {
    final private IncidenceService incidenceService;
    final private IncidenceFollowUpService followUpService;
    final private AccessService accessService;

    @PostMapping
    public IncidenceResponse createIncidence(@Valid @RequestBody IncidenceRequest incidenceRequest,
                                             Authentication authentication) {
        checkReporter(incidenceRequest, authentication);
        return incidenceService.guardar(incidenceRequest);
    }

    /**
     * Crear incidencia con fotos (multipart/form-data), como la envía el front:
     *  - parte "incidencia": el JSON de la incidencia (con Content-Type: application/json)
     *  - parte "fotos": de 0 a 5 imágenes
     * Spring elige este método cuando la petición es multipart; si es JSON, usa el de arriba.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IncidenceResponse createIncidenceWithPictures(
            @Valid @RequestPart("incidencia") IncidenceRequest incidenceRequest,
            @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos,
            Authentication authentication) {
        checkReporter(incidenceRequest, authentication);
        return incidenceService.guardar(incidenceRequest, fotos);
    }

    @GetMapping
    public List<IncidenceResponse> obtenerTodas(IncidenceFilter filtro) {
        return incidenceService.obtenerTodas(filtro);
    }

    @GetMapping("/{id}")
    public IncidenceDetailResponse obtenerPorId(@PathVariable Integer id, Authentication authentication) {
        accessService.requireMember(authentication, followUpService.communityIdOf(id));
        return followUpService.detail(id);
    }

    @PutMapping("/{id}")
    public IncidenceResponse actualizar(@PathVariable Integer id,
                                       @Valid @RequestBody IncidenceUpdateRequest request,
                                       Authentication authentication) {
        // Solo superadmin, administrador, presidente y conserje de la comunidad cambian estado y prioridad
        accessService.requireManager(authentication, followUpService.communityIdOf(id));
        return incidenceService.actualizar(id, request);
    }

    /** POST /api/incidences/{id}/comments: quien comenta es el usuario del token. */
    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public IncidenceCommentItemResponse addComment(@PathVariable Integer id,
                                                   @Valid @RequestBody IncidenceCommentCreateRequest request,
                                                   Authentication authentication) {
        User author = accessService.requireMember(authentication, followUpService.communityIdOf(id));
        return followUpService.addComment(id, author, request.comment());
    }

    @DeleteMapping("/{id}")
    public void deleteIncidence(@PathVariable Integer id, Authentication authentication) {
        accessService.requireManager(authentication, followUpService.communityIdOf(id));
        incidenceService.eliminar(id);
    }

    /** Hay que pertenecer a la comunidad y reportar a nombre propio (el superadmin puede reportar por otro). */
    private void checkReporter(IncidenceRequest request, Authentication authentication) {
        User current = accessService.requireMember(authentication, request.communityId());
        if (!accessService.isSuperadmin(current) && current.getUser_id() != request.reportedByUserId()) {
            throw new AccesoDenegadoException("Solo puedes reportar incidencias a tu nombre.");
        }
    }
}