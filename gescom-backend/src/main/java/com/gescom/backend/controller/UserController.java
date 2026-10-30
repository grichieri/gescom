package com.gescom.backend.controller;

import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.dto.UserResponse;
import com.gescom.backend.entity.User;
import com.gescom.backend.service.AccessService;
import com.gescom.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/users")
@RequiredArgsConstructor
public class UserController {
    final private UserService userService;
    final private AccessService accessService;

    @GetMapping
    public List<UserResponse> getAllUsers (Authentication authentication) {
        accessService.requireSuperadmin(authentication);
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById (@PathVariable("id") Long id){
        return userService.getUserById(id);
    }

    @PostMapping
    public UserResponse createUser (@RequestBody UserRequest userRequest, Authentication authentication){
        accessService.requireSuperadmin(authentication);
        return userService.createUser(userRequest);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser (@PathVariable("id") Long id, @RequestBody UserRequest userRequest, Authentication authentication){
        User current = accessService.requireSelfOrAnyManager(authentication, id);
        if (!accessService.isSuperadmin(current)) {
            // Solo el superadmin puede cambiar el tipo de usuario: nadie se hace superadmin a sí mismo
            userRequest.setType(userService.getUserById(id).getType());
        }
        return userService.updatedUser(id,userRequest);
    }
}
