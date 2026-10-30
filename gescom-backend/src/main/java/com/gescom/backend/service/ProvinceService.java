package com.gescom.backend.service;

import com.gescom.backend.data.ProvinceRepository;
import com.gescom.backend.dto.ProvinceDTO;
import com.gescom.backend.mapper.ProvinceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProvinceService {
    private final ProvinceRepository provinceRepository;
    private final ProvinceMapper provinceMapper;

    public List<ProvinceDTO> getAll(){
        return provinceRepository.findAll()
                .stream()
                .map(provinceMapper::toDTO)
                .toList();
    }
}
