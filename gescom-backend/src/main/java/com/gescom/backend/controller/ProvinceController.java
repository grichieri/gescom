package com.gescom.backend.controller;

import com.gescom.backend.dto.ProvinceDTO;
import com.gescom.backend.service.ProvinceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/provincias")
@RequiredArgsConstructor
public class ProvinceController {
    private final ProvinceService provinceService;

    @GetMapping
    public List<ProvinceDTO> getAll(){
        return provinceService.getAll();
    }
}
