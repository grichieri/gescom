package com.gescom.backend.controller;

import com.gescom.backend.dto.CommunitiesAdministratorsResponse;
import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.service.CommunitiesAdministratorsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/comunidades/{comunityId}")
@RequiredArgsConstructor
public class CommunitiesAdministratorsController {
    private final CommunitiesAdministratorsService communitiesAdministratorsService;

    @GetMapping
    public List<CommunitiesAdministratorsResponse> getAll(@PathVariable("comunityId") Long comunityId){
        return communitiesAdministratorsService.getAllCommunityAdministrators(comunityId);
    }

    /*@PostMapping
    public void createAdministrator(@PathVariable("comunityId") Long comunityId, @RequestBody UserRequest userRequest){
        communitiesAdministratorsService.createCommunityAdministrator(userRequest.);
    }*/
}
