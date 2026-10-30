package com.gescom.backend.service;

import com.gescom.backend.data.CommunitiesPresidentsRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.CommunitiesPresidentsResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesPresidents;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.CommunitiesPresidentsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunitiesPresidentsService {
    private final CommunitiesPresidentsRepository communitiesPresidentsRepository;
    private final CommunitiesPresidentsMapper communitiesPresidentsMapper;
    private final UserRepository userRepository;
    private final CommunityRepository communitiesRepository;

    public List<CommunitiesPresidentsResponse> getAllCommunityPresidents(Long communityId){
        return communitiesPresidentsRepository.findAllByCommunity_CommunityId(communityId)
                .stream()
                .map(communitiesPresidentsMapper::toResponse)
                .toList();
    }

    public void createCommunityPresident(Long userId, Long communityId){
        CommunitiesPresidents communitiesPresidents = new CommunitiesPresidents();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario no encontrado. Id: "+userId)
                );

        Communities communities = communitiesRepository.findById(communityId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Comunidad no encontrada. Id: "+communityId)
                );

        communitiesPresidents.setUser(user);
        communitiesPresidents.setCommunity(communities);

        LocalDate now = LocalDate.now();
        communitiesPresidents.setStart_date(now);

        communitiesPresidentsRepository.save(communitiesPresidents);
    }

    public CommunitiesPresidentsResponse endDateCommunityUser(Long communityPresidentId){
        LocalDate now = LocalDate.now();

        CommunitiesPresidents communitiesPresidents = communitiesPresidentsRepository.findById(communityPresidentId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario de comunidad no encontrado. Id: "+communityPresidentId)
                );

        communitiesPresidents.setEnd_date(now);

        return communitiesPresidentsMapper.toResponse(communitiesPresidentsRepository.save(communitiesPresidents));
    }
}
