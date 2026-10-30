package com.gescom.backend.data;

import com.gescom.backend.entity.Incidences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidenceRepository extends JpaRepository<Incidences, Integer>,
        JpaSpecificationExecutor<Incidences> {

   List<Incidences> findByCommunityCommunityId(Long communityId);

   List<Incidences> findByCommunity_CommunityId(Long communityId);

   List<Incidences> findByCommunity_CommunityIdAndStatus(Long communityId, Integer status);

   List<Incidences> findByPropertyId(Integer propertyId);

   @Query("select i from Incidences i where i.reportedBy.user_id = :reportedByUserId")
   List<Incidences> findByReportedByUserId(@Param("reportedByUserId") Long reportedByUserId);
}