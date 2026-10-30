package com.gescom.backend.service;

import com.gescom.backend.config.JwtUtils;
import com.gescom.backend.dto.LoginResponse;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.AccesoDenegadoException;
import com.gescom.backend.exception.InvalidCredentialsException;
import com.gescom.backend.data.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils){
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    public LoginResponse loginUser(String email, String password){
        User user = this.userRepository.findByEmail(email);
        if (user == null || !user.getPassword().equals(password))
            throw new InvalidCredentialsException("Credenciales invalidas");
        if (user.isDisabled() || !user.isActive())
            throw new AccesoDenegadoException("Tu cuenta está desactivada. Contacta con tu administrador.");
        if (!user.isValidated())
            throw new AccesoDenegadoException("Debes verificar tu correo antes de iniciar sesión.");
        String token = jwtUtils.generateJwToken(user.getEmail());
        return new LoginResponse("Logueado correctamente", token);
    }
}
