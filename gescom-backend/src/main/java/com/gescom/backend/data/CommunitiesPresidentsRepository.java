package com.gescom.backend.data;

import com.gescom.backend.entity.CommunitiesPresidents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunitiesPresidentsRepository extends JpaRepository<CommunitiesPresidents, Long> {
    List<CommunitiesPresidents> findAllByCommunity_CommunityId(Long communityId);
}
