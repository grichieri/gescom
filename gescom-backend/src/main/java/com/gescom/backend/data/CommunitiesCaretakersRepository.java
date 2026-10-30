package com.gescom.backend.data;

import com.gescom.backend.entity.CommunitiesCaretakers;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommunitiesCaretakersRepository extends JpaRepository<CommunitiesCaretakers, Long> {
    List<CommunitiesCaretakers> findAllByCommunity_CommunityId(Long communityId);
}
