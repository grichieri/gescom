package com.gescom.backend.data;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Consultas de los cargos vigentes de un usuario. Las tres tablas de cargos (administradores, presidentes y
 * conserjes) y la de residentes se consultan aquí para no tocar sus repositorios.
 */
@Repository
public class UserRoleQueries {

    /** Un cargo vigente: en qué comunidad, cuál es y entre qué fechas. */
    public record Cargo(Long communityId, String role, LocalDate startDate, LocalDate endDate) {
    }

    @PersistenceContext
    private EntityManager entityManager;

    /** Cargos (administrador, presidente, conserje) que el usuario tiene vigentes en la fecha indicada. */
    public List<Cargo> currentCargos(long userId, LocalDate today) {
        List<Cargo> result = new ArrayList<>();
        collect(result, "administrator", "CommunitiesAdministrators", userId, today);
        collect(result, "president", "CommunitiesPresidents", userId, today);
        collect(result, "caretaker", "CommunitiesCaretakers", userId, today);
        return result;
    }

    /** Comunidades en las que el usuario vive hoy (sin fecha de salida). */
    public List<Long> activeMembershipCommunityIds(long userId) {
        return entityManager.createQuery(
                        "select m.community.communityId from CommunitiesUsers m "
                                + "where m.user.user_id = :userId and m.move_out_date is null", Long.class)
                .setParameter("userId", userId)
                .getResultList();
    }

    private void collect(List<Cargo> result, String role, String entity, long userId, LocalDate today) {
        List<Object[]> rows = entityManager.createQuery(
                        "select c.community.communityId, c.start_date, c.end_date from " + entity + " c "
                                + "where c.user.user_id = :userId and c.start_date <= :today "
                                + "and (c.end_date is null or c.end_date >= :today)", Object[].class)
                .setParameter("userId", userId)
                .setParameter("today", today)
                .getResultList();
        for (Object[] row : rows) {
            result.add(new Cargo((Long) row[0], role, (LocalDate) row[1], (LocalDate) row[2]));
        }
    }
}
