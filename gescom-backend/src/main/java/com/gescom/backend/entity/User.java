package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long user_id;

    @Column(length = 100)
    @NotNull
    private String name;

    @Column(length = 150)
    @NotNull
    private String lastname;

    @Column
    @NotNull
    @Min(1)
    @Max(2)
    private Short type;

    @Column
    @Min(1)
    @Max(2)
    private Short resident_type;

    @Column(length = 255)
    private String avatar;

    @Column(length = 20, unique = true)
    @NotBlank
    private String dni;

    @Column(length = 20)
    private String phone_number;

    @Column(name="is_validated")
    @ColumnDefault("false")
    private boolean validated;

    @Column(name="is_active")
    @ColumnDefault("true")
    private boolean active;

    @Column(name="is_disabled")
    @ColumnDefault("false")
    private boolean disabled;

    @Column(length = 255, unique = true)
    @NotBlank
    private String email;

    @Column(length = 255)
    @NotNull
    private String password;

    @Column(length = 255)
    private String address;

    @Column(length = 10)
    private String zip_code;

    /*@Column
    private Short city_id;*/
    @ManyToOne
    @JoinColumn(
            name = "city_id",
            referencedColumnName = "city_id",
            foreignKey = @ForeignKey(name = "fk_users_city")
    )
    private City city;
}
