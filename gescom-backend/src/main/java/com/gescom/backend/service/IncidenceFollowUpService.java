package com.gescom.backend.service;

import com.gescom.backend.data.IncidenceCommentsRepository;
import com.gescom.backend.data.IncidenceRepository;
import com.gescom.backend.dto.IncidenceCommentItemResponse;
import com.gescom.backend.dto.IncidenceDetailResponse;
import com.gescom.backend.dto.IncidenceResponse;
import com.gescom.backend.entity.IncidenceComments;
import com.gescom.backend.entity.Incidences;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.IncidenceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/** Seguimiento de una incidencia: su detalle (con fotos y comentarios) y los comentarios nuevos. */
@Service
@RequiredArgsConstructor
public class IncidenceFollowUpService {

    private final IncidenceRepository incidenceRepository;
    private final IncidenceCommentsRepository commentsRepository;
    private final IncidenceMapper incidenceMapper;

    /** Comunidad a la que pertenece la incidencia (para comprobar permisos antes de actuar). */
    @Transactional(readOnly = true)
    public Long communityIdOf(Integer incidenceId) {
        return find(incidenceId).getCommunity().getCommunityId();
    }

    @Transactional(readOnly = true)
    public IncidenceDetailResponse detail(Integer incidenceId) {
        Incidences incidence = find(incidenceId);
        IncidenceResponse base = incidenceMapper.toResponse(incidence);
        List<IncidenceCommentItemResponse> comments = commentsRepository.findAllByIncidence_Id(incidenceId.longValue())
                .stream()
                .sorted(Comparator.comparing(IncidenceComments::getCreated_date).thenComparing(IncidenceComments::getComment_id))
                .map(this::toItem)
                .toList();
        return new IncidenceDetailResponse(
                base.id(), base.communityId(), base.propertyId(), base.reportedByUserId(), base.name(),
                base.description(), base.status(), base.priority(), base.createdDate(), base.maxResolutionDate(),
                base.pictures(), comments);
    }

    /** Añade un comentario de este usuario a la incidencia. */
    @Transactional
    public IncidenceCommentItemResponse addComment(Integer incidenceId, User author, String text) {
        Incidences incidence = find(incidenceId);
        IncidenceComments comment = new IncidenceComments();
        comment.setIncidence(incidence);
        comment.setUser(author);
        comment.setComment(text.trim());
        comment.setCreated_date(LocalDateTime.now());
        return toItem(commentsRepository.save(comment));
    }

    private Incidences find(Integer incidenceId) {
        return incidenceRepository.findById(incidenceId)
                .orElseThrow(() -> new EntidadNoEncontradaException("Incidencia no encontrada. Id: " + incidenceId));
    }

    private IncidenceCommentItemResponse toItem(IncidenceComments c) {
        return new IncidenceCommentItemResponse(
                c.getComment_id(), c.getIncidence().getId(), c.getUser().getUser_id(), c.getComment(), c.getCreated_date());
    }
}
