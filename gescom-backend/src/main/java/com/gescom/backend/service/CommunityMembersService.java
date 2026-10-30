package com.gescom.backend.service;

import com.gescom.backend.config.MailProperties;
import com.gescom.backend.data.CityRepository;
import com.gescom.backend.data.CommunitiesAdministratorsRepository;
import com.gescom.backend.data.CommunitiesCaretakersRepository;
import com.gescom.backend.data.CommunitiesPresidentsRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.CommunityUserCreateRequest;
import com.gescom.backend.dto.RegistrationInfoResponse;
import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.entity.City;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesAdministrators;
import com.gescom.backend.entity.CommunitiesCaretakers;
import com.gescom.backend.entity.CommunitiesPresidents;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Set;
import java.util.UUID;

/**
 * Altas de usuarios por la administración y cambios de cargo dentro de una comunidad.
 * Reglas (las mismas que aplicaba el front en local):
 *  - un usuario tiene un solo cargo vigente por comunidad, así que al darle uno nuevo se cierra el que tuviera;
 *  - administrador, presidente y conserje son cargos de una sola persona a la vez: se cierra el del titular anterior.
 * "Cerrar" un cargo es poner su fecha de fin el día anterior al inicio del nuevo; el histórico se conserva.
 */
@Service
@RequiredArgsConstructor
public class CommunityMembersService {

    private static final Set<String> ROLES = Set.of("administrator", "president", "caretaker");

    private final CommunityRepository communityRepository;
    private final UserRepository userRepository;
    private final CityRepository cityRepository;
    private final CommunitiesAdministratorsRepository administratorsRepository;
    private final CommunitiesPresidentsRepository presidentsRepository;
    private final CommunitiesCaretakersRepository caretakersRepository;
    private final CommunitiesUsersService communitiesUsersService;
    private final UserMapper userMapper;
    private final MailProperties mailProperties;

    /** Crea un usuario ya validado, lo vincula a la comunidad (si es residente) y le da el cargo pedido. */
    @Transactional
    public User createMember(Long communityId, CommunityUserCreateRequest request) {
        Communities community = findCommunity(communityId);
        UserRequest userRequest = request.user();

        if (userRequest.getPassword() == null || userRequest.getPassword().isBlank()) {
            if (!mailProperties.isEnabled()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La contraseña es obligatoria cuando el envío de correos está desactivado");
            }
            // Sin contraseña: el usuario la define con el enlace del correo de bienvenida
            userRequest.setPassword(UUID.randomUUID().toString());
        }

        User user = userMapper.toEntity(userRequest);
        City city = cityRepository.findById(userRequest.getCityId())
                .orElseThrow(() -> new EntidadNoEncontradaException("Ciudad no encontrada. Id: " + userRequest.getCityId()));
        user.setCity(city);
        user.setActive(userRequest.getIsActive() == null || userRequest.getIsActive());
        user.setValidated(true);
        user.setDisabled(Boolean.TRUE.equals(userRequest.getIsDisabled()));
        User saved = userRepository.save(user);

        // Quien tiene vivienda (propietario o inquilino) además es residente de la comunidad
        if (userRequest.getResidentType() != null) {
            communitiesUsersService.createCommunitiesUser(saved.getUser_id(), community.getCommunityId());
        }
        if (request.role() != null && !request.role().isBlank()) {
            applyRole(community, saved, request.role(), request.roleStartDate(), request.roleEndDate());
        }
        return saved;
    }

    /** Cambia el cargo de un usuario en una comunidad. role = null quita el cargo que tuviera. */
    @Transactional
    public void changeRole(Long communityId, Long userId, String role, LocalDate startDate, LocalDate endDate) {
        Communities community = findCommunity(communityId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: " + userId));
        applyRole(community, user, role, startDate, endDate);
    }

    /** Comunidad (no borrada) de un código de registro. */
    @Transactional(readOnly = true)
    public RegistrationInfoResponse registrationInfo(UUID registrationCode) {
        Communities community = communityRepository.findByRegistrationCode(registrationCode)
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted()))
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada. UUID: " + registrationCode));
        return new RegistrationInfoResponse(community.getCommunityId(), community.getName());
    }

    public Communities communityOf(Long communityId) {
        return findCommunity(communityId);
    }

    // ---------- Helpers ----------

    private Communities findCommunity(Long communityId) {
        Communities community = communityRepository.findById(communityId)
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada. Id: " + communityId));
        if (Boolean.TRUE.equals(community.getIsDeleted())) {
            throw new EntidadNoEncontradaException("Comunidad no encontrada. Id: " + communityId);
        }
        return community;
    }

    private void applyRole(Communities community, User user, String role, LocalDate startDate, LocalDate endDate) {
        if (role != null && !role.isBlank() && !ROLES.contains(role)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cargo no válido: " + role);
        }
        boolean hasRole = role != null && !role.isBlank();
        LocalDate today = LocalDate.now();
        LocalDate start = startDate != null ? startDate : today;
        if (hasRole && endDate != null && endDate.isBefore(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La fecha de fin no puede ser anterior a la de inicio");
        }

        Long communityId = community.getCommunityId();
        // 1. El usuario deja el cargo que tuviera (si recibe uno nuevo, el anterior acaba el día antes)
        closeCurrent(communityId, hasRole ? start : today, user.getUser_id(), null);
        if (!hasRole) {
            return;
        }
        // 2. El titular anterior de ese cargo lo deja
        closeCurrent(communityId, start, null, role);
        // 3. Nuevo cargo
        switch (role) {
            case "administrator" -> {
                CommunitiesAdministrators row = new CommunitiesAdministrators();
                row.setCommunity(community);
                row.setUser(user);
                row.setStart_date(start);
                row.setEnd_date(endDate);
                administratorsRepository.save(row);
            }
            case "president" -> {
                CommunitiesPresidents row = new CommunitiesPresidents();
                row.setCommunity(community);
                row.setUser(user);
                row.setStart_date(start);
                row.setEnd_date(endDate);
                presidentsRepository.save(row);
            }
            default -> {
                CommunitiesCaretakers row = new CommunitiesCaretakers();
                row.setCommunity(community);
                row.setUser(user);
                row.setStart_date(start);
                row.setEnd_date(endDate);
                caretakersRepository.save(row);
            }
        }
    }

    /**
     * Cierra los cargos vigentes de la comunidad: los de un usuario (onlyUserId) o los de un tipo de cargo (onlyKind).
     * Fecha de fin = el día anterior a "from". Si el cargo empezó ese mismo día (o después) no se puede terminar antes de
     * empezar (la base de datos exige fin >= inicio), y dejarlo con fin = inicio lo mantendría vigente ese día, con dos
     * titulares a la vez; por eso en ese caso se borra el registro: el cargo no llegó a ejercerse.
     */
    private void closeCurrent(Long communityId, LocalDate from, Long onlyUserId, String onlyKind) {
        LocalDate today = LocalDate.now();
        LocalDate end = from.minusDays(1);

        if (onlyKind == null || onlyKind.equals("administrator")) {
            for (CommunitiesAdministrators row : administratorsRepository.findAllByCommunity_CommunityId(communityId)) {
                if (isCurrent(row.getStart_date(), row.getEnd_date(), today) && matches(row.getUser(), onlyUserId)) {
                    if (row.getStart_date().isBefore(from)) {
                        row.setEnd_date(end);
                        administratorsRepository.save(row);
                    } else {
                        administratorsRepository.delete(row); // empezó el mismo día (o después): no llegó a ejercer, no queda registro
                    }
                }
            }
        }
        if (onlyKind == null || onlyKind.equals("president")) {
            for (CommunitiesPresidents row : presidentsRepository.findAllByCommunity_CommunityId(communityId)) {
                if (isCurrent(row.getStart_date(), row.getEnd_date(), today) && matches(row.getUser(), onlyUserId)) {
                    if (row.getStart_date().isBefore(from)) {
                        row.setEnd_date(end);
                        presidentsRepository.save(row);
                    } else {
                        presidentsRepository.delete(row); // empezó el mismo día (o después): no llegó a ejercer, no queda registro
                    }
                }
            }
        }
        if (onlyKind == null || onlyKind.equals("caretaker")) {
            for (CommunitiesCaretakers row : caretakersRepository.findAllByCommunity_CommunityId(communityId)) {
                if (isCurrent(row.getStart_date(), row.getEnd_date(), today) && matches(row.getUser(), onlyUserId)) {
                    if (row.getStart_date().isBefore(from)) {
                        row.setEnd_date(end);
                        caretakersRepository.save(row);
                    } else {
                        caretakersRepository.delete(row); // empezó el mismo día (o después): no llegó a ejercer, no queda registro
                    }
                }
            }
        }
    }

    private static boolean matches(User holder, Long onlyUserId) {
        return onlyUserId == null || holder.getUser_id() == onlyUserId;
    }

    private static boolean isCurrent(LocalDate start, LocalDate end, LocalDate today) {
        return !start.isAfter(today) && (end == null || !end.isBefore(today));
    }
}
