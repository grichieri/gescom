package com.gescom.backend.service;

import com.gescom.backend.data.CityRepository;
import com.gescom.backend.dto.CityDTO;
import com.gescom.backend.mapper.CityMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CityService {
    private final CityRepository cityRepository;
    private final CityMapper cityMapper;

    public List<CityDTO> getAll(){
        return cityRepository.findAll()
                .stream()
                .map(cityMapper::toDTO)
                .toList();
    }
}
