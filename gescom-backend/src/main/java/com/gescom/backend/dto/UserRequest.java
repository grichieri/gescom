package com.gescom.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserRequest {
    @NotNull
    @Size(max = 100)
    private String name;

    @NotNull
    @Size(max = 150)
    private String lastname;

    @NotNull
    private Byte type;

    private Byte residentType;

    @Size(max = 255)
    private String avatar;

    @Size(max = 20)
    private String dni;

    @Size(max = 20)
    private String phoneNumber;

    @NotNull
    @Email
    @Size(max = 255)
    private String email;

    @NotNull
    private String password;

    @Size(max = 255)
    private String address;

    @Size(max = 10)
    private String zipCode;

    private short cityId;

    // Opcionales: solo se tienen en cuenta en las rutas de la administración (PUT /api/users/{id} y alta en una comunidad).
    // El registro público los ignora, para que nadie pueda validarse a sí mismo.
    private Boolean isActive;
    private Boolean isValidated;
    private Boolean isDisabled;

}
