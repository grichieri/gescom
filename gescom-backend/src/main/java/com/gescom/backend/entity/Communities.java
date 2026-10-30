package com.gescom.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "communities")
@Data
public class Communities {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "community_id")
    private Long communityId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String nif;

    @Column(nullable = false)
    private Short type;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(name = "zip_code", nullable = false, length = 10)
    private String zipCode;

    @Column(name = "city_id", nullable = false)
    private Short cityId;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "registration_code", nullable = false, unique = true,
            columnDefinition = "uuid")
    private UUID registrationCode;

    @PrePersist
    public void prePersist() {
        if (registrationCode == null) {
            registrationCode = UUID.randomUUID();
        }
        if (isDeleted == null) {
            isDeleted = false;
        }
    }
}