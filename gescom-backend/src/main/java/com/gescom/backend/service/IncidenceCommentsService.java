package com.gescom.backend.service;

import com.gescom.backend.data.IncidenceCommentsRepository;
import com.gescom.backend.data.IncidenceRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.IncidenceCommentsRequest;
import com.gescom.backend.dto.IncidenceCommentsResponse;
import com.gescom.backend.entity.IncidenceComments;
import com.gescom.backend.entity.Incidences;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.IncidenceCommentsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncidenceCommentsService {
    private final IncidenceCommentsRepository incidenceCommentsRepository;
    private final IncidenceCommentsMapper incidenceCommentsMapper;
    private final IncidenceRepository incidenceRepository;
    private final UserRepository userRepository;

    public List<IncidenceCommentsResponse> getAllByIncidence(Long incidence_id){
        return incidenceCommentsRepository.findAllByIncidence_Id(incidence_id)
                .stream()
                .map(comment -> new IncidenceCommentsResponse(
                        comment.getComment_id(),
                        comment.getIncidence().getId(),
                        comment.getUser().getUser_id(),
                        comment.getComment(),
                        comment.getCreated_date()))
                .toList();
    }

    public IncidenceCommentsResponse createIncidenceComment(IncidenceCommentsRequest request) {
        IncidenceComments incidenceComments = incidenceCommentsMapper.toEntity(request);

        Incidences incidence = incidenceRepository.findById(Math.toIntExact(request.getIncidence_id()))
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Incidencia no encontrada. Id: "+request.getIncidence_id())
                );

        User user = userRepository.findById(request.getUser_id())
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario no encontrado. Id: "+request.getIncidence_id())
                );

        LocalDateTime now = LocalDateTime.now();
        incidenceComments.setCreated_date(now);
        incidenceComments.setIncidence(incidence);

        IncidenceComments saved = incidenceCommentsRepository.save(incidenceComments);

        return incidenceCommentsMapper.toResponse(saved);
    }

    public void deleteComment(Long comment_id){
        IncidenceComments comment = incidenceCommentsRepository.findById(comment_id)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Comentario no encontrado. Id: "+comment_id)
                );

        incidenceCommentsRepository.delete(comment);
    }

    public void deleteAllIncidenceComments(Long incidence_id){
        List<IncidenceComments> comments =
                incidenceCommentsRepository.findAllByIncidence_Id(incidence_id);

        incidenceCommentsRepository.deleteAll(comments);
    }
}
