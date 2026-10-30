package com.gescom.backend.data;

import com.gescom.backend.entity.CommunitiesAdministrators;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunitiesAdministratorsRepository extends JpaRepository<CommunitiesAdministrators, Long> {
    List<CommunitiesAdministrators> findAllByCommunity_CommunityId(Long communityId);
}
