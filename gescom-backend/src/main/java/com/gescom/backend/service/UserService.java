package com.gescom.backend.service;

import com.gescom.backend.config.MailProperties;
import com.gescom.backend.data.CityRepository;
import com.gescom.backend.data.CommunityRepository;
import com.gescom.backend.data.UserRepository;
import com.gescom.backend.dto.UserRequest;
import com.gescom.backend.dto.UserResponse;
import com.gescom.backend.entity.City;
import com.gescom.backend.entity.Communities;
import com.gescom.backend.entity.CommunitiesUsers;
import com.gescom.backend.entity.User;
import com.gescom.backend.exception.EntidadNoEncontradaException;
import com.gescom.backend.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final CityRepository cityRepository;
    private final UserRepository usersRepository;
    private final UserMapper userMapper;
    private final CommunityRepository communityRepository;
    private final CommunitiesUsersService communitiesUsersService;
    private final MailProperties mailProperties;

    /**
     * Registro desde la URL de una comunidad. El usuario queda activo; queda validado al momento si el envío de
     * correos está desactivado (app.mail.enabled=false) o pendiente de verificar si está activado.
     */
    @Transactional
    public User createUserInCommunity(UUID registrationCode, UserRequest userRequest){
        Communities community = communityRepository.findByRegistrationCode(registrationCode)
                .orElseThrow(() -> new EntidadNoEncontradaException("Comunidad no encontrada. UUID: "+registrationCode));

        if (community.getIsDeleted()) {
            throw new EntidadNoEncontradaException("Comunidad no encontrada. UUID: "+registrationCode);
        }

        User user = userMapper.toEntity(userRequest);

        City city = cityRepository.findById(userRequest.getCityId())
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Ciudad no encontrada. Id: "+userRequest.getCityId())
                );

        user.setCity(city);
        // El registro público nunca puede decidir estos valores (aunque el cuerpo traiga type o isValidated, se ignora)
        user.setType((short) 2);
        user.setActive(true);
        user.setDisabled(false);
        user.setValidated(!mailProperties.isEnabled());

        User savedUser = usersRepository.save(user);

        communitiesUsersService.createCommunitiesUser(savedUser.getUser_id(), community.getCommunityId());
        return savedUser;
    }

    public List<UserResponse> getAllUsers(){
        return usersRepository.findAll()
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    public UserResponse getUserById(Long id){
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: "+id));
        return userMapper.toResponse(user);
    }

    public UserResponse createUser(UserRequest request) {
        User user = userMapper.toEntity(request);

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Ciudad no encontrada. Id: "+request.getCityId())
                );

        user.setCity(city);
        user.setActive(request.getIsActive() == null || request.getIsActive());
        user.setValidated(request.getIsValidated() == null || request.getIsValidated());
        user.setDisabled(Boolean.TRUE.equals(request.getIsDisabled()));

        User savedUser = usersRepository.save(user);

        return userMapper.toResponse(savedUser);
    }

    public UserResponse updatedUser(Long id, UserRequest request) {
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: " + id));

        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() ->
                        new EntidadNoEncontradaException("Ciudad no encontrada. Id: "+request.getCityId())
                );

        userMapper.updateEntity(request, user);
        user.setCity(city);
        // Dar de baja, reactivar o validar: solo se cambia lo que viene en el cuerpo
        if (request.getIsActive() != null) user.setActive(request.getIsActive());
        if (request.getIsValidated() != null) user.setValidated(request.getIsValidated());
        if (request.getIsDisabled() != null) user.setDisabled(request.getIsDisabled());

        User updatedUser = usersRepository.save(user);

        return userMapper.toResponse(updatedUser);
    }

    public void delete(Long id){
        User user = usersRepository.findById(id)
                .orElseThrow(() -> new EntidadNoEncontradaException("Usuario no encontrado. Id: " + id));

        usersRepository.delete(user);
    }
}
