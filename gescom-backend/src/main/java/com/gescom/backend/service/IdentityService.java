package com.gescom.backend.service;

import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.data.UserRoleQueries;
import com.gescom.backend.dto.CommunityRoleResponse;
import com.gescom.backend.dto.MeResponse;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Construye la respuesta de GET /user/auth/me: el usuario y su cargo vigente en cada comunidad. */
@Service
@RequiredArgsConstructor
public class IdentityService {

    private static final List<String> CARGO_PRIORITY = List.of("administrator", "president", "caretaker");

    private final UserRepository userRepository;
    private final CommunityRepository communityRepository;
    private final UserRoleQueries roleQueries;
    private final UserMapper userMapper;

    @Transactional(readOnly = true)
    public MeResponse identityOf(String email) {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new EntidadNoEncontradaException("Usuario no encontrado: " + email);
        }

        List<CommunityRoleResponse> communities = new ArrayList<>();
        if (user.getType() != null && user.getType() == 1) {
            // El superadmin ve todas las comunidades no borradas
            for (Communities c : communityRepository.findByIsDeletedFalse()) {
                communities.add(new CommunityRoleResponse(c.getCommunityId(), c.getName(), "superadmin", null, null));
            }
        } else {
            communities.addAll(communitiesOf(user));
        }
        return new MeResponse(userMapper.toResponse(user), communities);
    }

    private List<CommunityRoleResponse> communitiesOf(User user) {
        // Mejor cargo vigente por comunidad (administrador > presidente > conserje)
        Map<Long, UserRoleQueries.Cargo> bestCargo = new LinkedHashMap<>();
        for (UserRoleQueries.Cargo cargo : roleQueries.currentCargos(user.getUser_id(), LocalDate.now())) {
            UserRoleQueries.Cargo current = bestCargo.get(cargo.communityId());
            if (current == null || CARGO_PRIORITY.indexOf(cargo.role()) < CARGO_PRIORITY.indexOf(current.role())) {
                bestCargo.put(cargo.communityId(), cargo);
            }
        }

        Set<Long> ids = new LinkedHashSet<>(bestCargo.keySet());
        ids.addAll(roleQueries.activeMembershipCommunityIds(user.getUser_id()));

        List<CommunityRoleResponse> result = new ArrayList<>();
        for (Communities community : communityRepository.findAllById(ids)) {
            if (Boolean.TRUE.equals(community.getIsDeleted())) {
                continue;
            }
            UserRoleQueries.Cargo cargo = bestCargo.get(community.getCommunityId());
            if (cargo != null) {
                result.add(new CommunityRoleResponse(community.getCommunityId(), community.getName(),
                        cargo.role(), cargo.startDate(), cargo.endDate()));
            } else {
                result.add(new CommunityRoleResponse(community.getCommunityId(), community.getName(),
                        residentRole(user), null, null));
            }
        }
        return result;
    }

    private String residentRole(User user) {
        if (user.getResident_type() == null) {
            return "none";
        }
        return user.getResident_type() == 1 ? "owner" : "tenant";
    }
}
