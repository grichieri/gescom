package com.gescom.backend.data;

import com.gescom.backend.entity.Communities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Communities, Long> {

    boolean existsByNif(String nif);
    boolean existsByRegistrationCode(UUID registrationCode);
    List<Communities> findByIsDeletedFalse();
    Optional<Communities> findByRegistrationCode(UUID registrationCode);
}
