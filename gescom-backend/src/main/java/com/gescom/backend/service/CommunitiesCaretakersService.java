package com.gescom.backend.service;

import com.gescom.backend.data.CommunitiesCaretakersRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.CommunitiesCaretakersResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesCaretakers;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.CommunitiesCaretakersMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunitiesCaretakersService {
    private final CommunitiesCaretakersRepository communitiesCaratakersRepository;
    private final CommunitiesCaretakersMapper communitiesCaratakersMapper;
    private final UserRepository userRepository;
    private final CommunityRepository communitiesRepository;

    public List<CommunitiesCaretakersResponse> getAllCommunityCaretakers(Long communityId){
        return communitiesCaratakersRepository.findAllByCommunity_CommunityId(communityId)
                .stream()
                .map(communitiesCaratakersMapper::toResponse)
                .toList();
    }

    public void createCommunityCaretaker(Long userId, Long communityId){
        CommunitiesCaretakers communitiesCaretakers = new CommunitiesCaretakers();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario no encontrado. Id: "+userId)
                );

        Communities communities = communitiesRepository.findById(communityId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Comunidad no encontrada. Id: "+communityId)
                );

        communitiesCaretakers.setUser(user);
        communitiesCaretakers.setCommunity(communities);

        LocalDate now = LocalDate.now();
        communitiesCaretakers.setStart_date(now);

        communitiesCaratakersRepository.save(communitiesCaretakers);
    }

    public CommunitiesCaretakersResponse endDateCommunityCaretaker(Long communityCaretakerId){
        LocalDate now = LocalDate.now();

        CommunitiesCaretakers communitiesCaretakers = communitiesCaratakersRepository.findById(communityCaretakerId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario de comunidad no encontrado. Id: "+communityCaretakerId)
                );

        communitiesCaretakers.setEnd_date(now);

        return communitiesCaratakersMapper.toResponse(communitiesCaratakersRepository.save(communitiesCaretakers));
    }
}
