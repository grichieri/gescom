package com.gescom.backend.data;

import com.gescom.backend.entity.IncidencePicture;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidencePictureRepository extends JpaRepository<IncidencePicture, Long> {

    List<IncidencePicture> findByIncidence_Id(Long incidenceId);
}