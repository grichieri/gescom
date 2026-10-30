package com.gescom.backend.service;

import com.gescom.backend.data.CommunitiesUsersRepository;
import com.gescom.backend.data.CommunitiesAdministratorsRepository;
import com.gescom.backend.data.CommunitiesCaretakersRepository;
import com.gescom.backend.data.CommunitiesPresidentsRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.CommunityUserResponse;
import com.gescom.backend.dto.CommunitiesUsersResponse;
import com.gescom.backend.entity.CommunitiesAdministrators;
import com.gescom.backend.entity.CommunitiesCaretakers;
import com.gescom.backend.entity.CommunitiesPresidents;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesUsers;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.CommunitiesUsersMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CommunitiesUsersService {
    private final CommunitiesUsersMapper communitiesUsersMapper;
    private final CommunitiesUsersRepository communitiesUsersRepository;
    private final CommunitiesAdministratorsRepository administratorsRepository;
    private final CommunitiesCaretakersRepository caretakersRepository;
    private final CommunitiesPresidentsRepository presidentsRepository;
    private final UserRepository userRepository;
    private final CommunityRepository communitiesRepository;

    public List<CommunityUserResponse> getAllUsersByCommunity(Long communityId) {
        Map<Long, CommunityUserResponse> users = new LinkedHashMap<>();
        for (CommunitiesUsers membership : communitiesUsersRepository.findAllByCommunity_CommunityId(communityId)) {
            CommunityUserResponse response = toCommunityUserResponse(membership.getUser());
            response.setRole("resident");
            response.setRoleStartDate(membership.getMove_in_date());
            response.setRoleEndDate(membership.getMove_out_date());
            users.put(membership.getUser().getUser_id(), response);
        }

        Map<Long, RoleAssignment> roles = new LinkedHashMap<>();
        for (CommunitiesPresidents president : presidentsRepository.findAllByCommunity_CommunityId(communityId)) {
            addRole(roles, president.getUser(), "president", president.getStart_date(), president.getEnd_date());
        }
        for (CommunitiesAdministrators administrator : administratorsRepository.findAllByCommunity_CommunityId(communityId)) {
            addRole(roles, administrator.getUser(), "administrator", administrator.getStart_date(), administrator.getEnd_date());
        }
        for (CommunitiesCaretakers caretaker : caretakersRepository.findAllByCommunity_CommunityId(communityId)) {
            addRole(roles, caretaker.getUser(), "caretaker", caretaker.getStart_date(), caretaker.getEnd_date());
        }

        roles.forEach((userId, assignment) -> {
            CommunityUserResponse response = users.computeIfAbsent(userId, ignored -> toCommunityUserResponse(assignment.user()));
            response.setRole(assignment.role());
            response.setRoleStartDate(assignment.startDate());
            response.setRoleEndDate(assignment.endDate());
        });
        return List.copyOf(users.values());
    }

    private CommunityUserResponse toCommunityUserResponse(User user) {
        CommunityUserResponse response = new CommunityUserResponse();
        response.setUserId(user.getUser_id());
        response.setName(user.getName());
        response.setLastname(user.getLastname());
        response.setResidentType(user.getResident_type() == null ? null : user.getResident_type().byteValue());
        response.setEmail(user.getEmail());
        response.setAvatar(user.getAvatar());
        response.setAddress(user.getAddress());
        response.setValidated(user.isValidated());
        response.setActive(user.isActive());
        response.setDisabled(user.isDisabled());
        return response;
    }

    private void addRole(Map<Long, RoleAssignment> roles, User user, String role, LocalDate startDate, LocalDate endDate) {
        RoleAssignment candidate = new RoleAssignment(user, role, startDate, endDate);
        roles.merge(user.getUser_id(), candidate, (existing, incoming) ->
                isPreferredRole(incoming, existing) ? incoming : existing);
    }

    private boolean isPreferredRole(RoleAssignment candidate, RoleAssignment existing) {
        if ((candidate.endDate() == null) != (existing.endDate() == null)) {
            return candidate.endDate() == null;
        }
        if (candidate.startDate() != null && existing.startDate() != null
                && !candidate.startDate().equals(existing.startDate())) {
            return candidate.startDate().isAfter(existing.startDate());
        }
        return rolePriority(candidate.role()) > rolePriority(existing.role());
    }

    private int rolePriority(String role) {
        return switch (role) {
            case "president" -> 3;
            case "administrator" -> 2;
            case "caretaker" -> 1;
            default -> 0;
        };
    }

    private record RoleAssignment(User user, String role, LocalDate startDate, LocalDate endDate) {}

    public List<CommunitiesUsersResponse> getAllUserByCommunity(Long communityId){
        return communitiesUsersRepository.findAllByCommunity_CommunityId(communityId)
                .stream()
                .map(communitiesUsersMapper::toResponse)
                .toList();
    }

    public void createCommunitiesUser(Long userId, Long communityId){
        CommunitiesUsers communitiesUsers = new CommunitiesUsers();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario no encontrado. Id: "+userId)
                );

        Communities communities = communitiesRepository.findById(communityId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Comunidad no encontrada. Id: "+communityId)
                );

        communitiesUsers.setUser(user);
        communitiesUsers.setCommunity(communities);

        LocalDate now = LocalDate.now();
        communitiesUsers.setMove_in_date(now);

        communitiesUsersRepository.save(communitiesUsers);
    }

    public CommunitiesUsersResponse moveOutCommunityUser(Long communityUserId){
        LocalDate now = LocalDate.now();

        CommunitiesUsers communitiesUsers = communitiesUsersRepository.findById(communityUserId)
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Usuario de comunidad no encontrado. Id: "+communityUserId)
                );

        communitiesUsers.setMove_out_date(now);

        return communitiesUsersMapper.toResponse(communitiesUsersRepository.save(communitiesUsers));
    }
}
