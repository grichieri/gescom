package com.gescom.backend.controller;

import com.gescom.backend.dto.RegistrationInfoResponse;
import com.gescom.backend.service.CommunityMembersService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/** GET api/register/{uuid}: nombre de la comunidad de un código de registro (pública, como el registro). */
@RestController
@RequestMapping("api/register")
@RequiredArgsConstructor
public class RegistroInfoController {

    private final CommunityMembersService communityMembersService;

    @GetMapping("/{communityUuid}")
    public RegistrationInfoResponse info(@PathVariable("communityUuid") UUID communityUuid) {
        return communityMembersService.registrationInfo(communityUuid);
    }
}
