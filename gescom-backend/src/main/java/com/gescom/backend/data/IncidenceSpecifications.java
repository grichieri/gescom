package com.gescom.backend.data;

import com.gescom.backend.dto.IncidenceFilter;
import com.gescom.backend.entity.Incidences;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

/** Convierte un IncidenceFilter en una consulta: cada filtro que viene relleno añade una condición WHERE. */
public final class IncidenceSpecifications {

    private IncidenceSpecifications() {
    }

    public static Specification<Incidences> from(IncidenceFilter f) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (f.communityId() != null) {
                predicates.add(cb.equal(root.get("community").get("communityId"), f.communityId()));
            }
            if (f.status() != null) {
                predicates.add(cb.equal(root.get("status"), f.status()));
            }
            if (f.priority() != null) {
                predicates.add(cb.equal(root.get("priority"), f.priority()));
            }
            // createdDate es fecha y hora: el límite superior es exclusivo (día siguiente a las 00:00)
            if (f.createdFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdDate"), f.createdFrom().atStartOfDay()));
            }
            if (f.createdTo() != null) {
                predicates.add(cb.lessThan(root.get("createdDate"), f.createdTo().plusDays(1).atStartOfDay()));
            }
            if (f.deadlineFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxResolutionDate"), f.deadlineFrom()));
            }
            if (f.deadlineTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("maxResolutionDate"), f.deadlineTo()));
            }

            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }
}
