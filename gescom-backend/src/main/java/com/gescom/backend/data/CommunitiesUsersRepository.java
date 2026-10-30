package com.gescom.backend.data;

import com.gescom.backend.entity.CommunitiesUsers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunitiesUsersRepository extends JpaRepository<CommunitiesUsers, Long> {
    List<CommunitiesUsers> findAllByCommunity_CommunityId(Long communityId);
}
