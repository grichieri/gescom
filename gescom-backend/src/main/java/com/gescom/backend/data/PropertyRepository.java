package com.gescom.backend.data;

import com.gescom.backend.entity.Properties;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface PropertyRepository extends JpaRepository <Properties, Long>{
    List<Properties> findByCommunity_CommunityId(Long communityId);
}

