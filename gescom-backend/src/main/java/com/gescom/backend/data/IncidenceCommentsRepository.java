package com.gescom.backend.data;

import com.gescom.backend.entity.IncidenceComments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenceCommentsRepository extends JpaRepository<IncidenceComments, Long> {
    List<IncidenceComments> findAllByIncidence_Id(Long incidence_id);
}
