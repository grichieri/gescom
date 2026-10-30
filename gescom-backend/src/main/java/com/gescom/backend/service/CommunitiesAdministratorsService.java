package com.gescom.backend.service;

import com.gescom.backend.data.CommunitiesAdministratorsRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.CommunitiesAdministratorsResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesAdministrators;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.CommunitiesAdministratorsMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunitiesAdministratorsService {
    private final CommunitiesAdministratorsRepository communitiesAdministratorsRepository;
    private final CommunitiesAdministratorsMapper communitiesAdministratorsMapper;
    private final UserRepository userRepository;
    private final CommunityRepository communitiesRepository;

    public List<CommunitiesAdministratorsResponse> getAllCommunityAdministrators(Long communityId){
        return communitiesAdministratorsRepository.findAllByCommunity_CommunityId(communityId)
                .stream()
                .map(communitiesAdministratorsMapper::toResponse)
                .toList();
    }

    public void createCommunityAdministrator(Long userId, Long communityId){
        CommunitiesAdministrators communitiesAdministrators = new CommunitiesAdministrators();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario no encontrado. Id: "+userId)
                );

        Communities communities = communitiesRepository.findById(communityId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Comunidad no encontrada. Id: "+communityId)
                );

        communitiesAdministrators.setUser(user);
        communitiesAdministrators.setCommunity(communities);

        LocalDate now = LocalDate.now();
        communitiesAdministrators.setStart_date(now);

        communitiesAdministratorsRepository.save(communitiesAdministrators);
    }

    public CommunitiesAdministratorsResponse endDateCommunityAdministrator(Long communityAdministratorId){
        LocalDate now = LocalDate.now();

        CommunitiesAdministrators communitiesAdministrators = communitiesAdministratorsRepository.findById(communityAdministratorId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario de comunidad no encontrado. Id: "+communityAdministratorId)
                );

        communitiesAdministrators.setEnd_date(now);

        return communitiesAdministratorsMapper.toResponse(communitiesAdministratorsRepository.save(communitiesAdministrators));
    }
}
