package com.gescom.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "properties")
@Data
public class Properties {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Long propertyId;

    // Sin aplicar la restriccion de clave foranea
    // @Column(name = "community_id", nullable = false)
    // private Integer communityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Communities community;

    @Column(name = "block_portal", length = 50)
    private String blockPortal;

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "address", length = 255, nullable = false)
    private String address;

    @Column(name = "zip_code", length = 10, nullable = false)
    private String zipCode;
}