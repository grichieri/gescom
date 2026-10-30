package com.gescom.backend.service;

import com.gescom.backend.data.UserRepository;
import com.gescom.backend.data.UserRoleQueries;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.AccesoDenegadoException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Quién es el usuario del token y qué puede hacer en cada comunidad.
 * El cargo en una comunidad es: superadmin (todas), administrator, president, caretaker (cargo vigente)
 * o, si no tiene cargo, owner / tenant según su tipo de residente, siempre que viva en ella.
 */
@Service
@RequiredArgsConstructor
public class AccessService {

    public static final Set<String> MANAGER_ROLES = Set.of("superadmin", "administrator", "president", "caretaker");

    private static final List<String> CARGO_PRIORITY = List.of("administrator", "president", "caretaker");

    private final UserRepository userRepository;
    private final UserRoleQueries roleQueries;

    /** Usuario autenticado (el correo es el "sub" del token). */
    public User currentUser(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName());
        if (user == null) {
            throw new AccesoDenegadoException("Usuario no encontrado para este token.");
        }
        return user;
    }

    public boolean isSuperadmin(User user) {
        return user.getType() != null && user.getType() == 1;
    }

    /** Cargo del usuario en la comunidad, o null si no pertenece a ella. */
    public String roleIn(User user, Long communityId) {
        if (isSuperadmin(user)) {
            return "superadmin";
        }
        List<UserRoleQueries.Cargo> cargos = roleQueries.currentCargos(user.getUser_id(), LocalDate.now());
        for (String role : CARGO_PRIORITY) {
            boolean has = cargos.stream()
                    .anyMatch(c -> c.role().equals(role) && c.communityId().equals(communityId));
            if (has) {
                return role;
            }
        }
        if (roleQueries.activeMembershipCommunityIds(user.getUser_id()).contains(communityId)) {
            if (user.getResident_type() == null) {
                return "none";
            }
            return user.getResident_type() == 1 ? "owner" : "tenant";
        }
        return null;
    }

    /** El usuario debe pertenecer a la comunidad (o ser superadmin). */
    public User requireMember(Authentication authentication, Long communityId) {
        User user = currentUser(authentication);
        if (roleIn(user, communityId) == null) {
            throw new AccesoDenegadoException("No perteneces a esta comunidad.");
        }
        return user;
    }

    /** El usuario debe ser superadmin, administrador, presidente o conserje de la comunidad. */
    public User requireManager(Authentication authentication, Long communityId) {
        User user = currentUser(authentication);
        String role = roleIn(user, communityId);
        if (role == null || !MANAGER_ROLES.contains(role)) {
            throw new AccesoDenegadoException("No tienes permiso para hacer esto en esta comunidad.");
        }
        return user;
    }

    public User requireSuperadmin(Authentication authentication) {
        User user = currentUser(authentication);
        if (!isSuperadmin(user)) {
            throw new AccesoDenegadoException("Solo el superadministrador puede hacer esto.");
        }
        return user;
    }

    /** Solo uno mismo o el superadmin. */
    public User requireSelfOrSuperadmin(Authentication authentication, long userId) {
        User user = currentUser(authentication);
        if (!isSuperadmin(user) && user.getUser_id() != userId) {
            throw new AccesoDenegadoException("Solo puedes modificar tu propia cuenta.");
        }
        return user;
    }

    /** Uno mismo, el superadmin o alguien con un cargo vigente en alguna comunidad (para editar datos de otros usuarios). */
    public User requireSelfOrAnyManager(Authentication authentication, long userId) {
        User user = currentUser(authentication);
        boolean self = user.getUser_id() == userId;
        boolean anyCargo = !roleQueries.currentCargos(user.getUser_id(), LocalDate.now()).isEmpty();
        if (!self && !isSuperadmin(user) && !anyCargo) {
            throw new AccesoDenegadoException("No tienes permiso para modificar a este usuario.");
        }
        return user;
    }

    /** Administrador, presidente, conserje o superadmin de la comunidad (sin lanzar error). */
    public boolean isManagerOf(User user, Long communityId) {
        String role = roleIn(user, communityId);
        return role != null && MANAGER_ROLES.contains(role);
    }
}
