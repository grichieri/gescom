package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "cities")
@Data
public class City {

    @Id
    private short city_id;

    @ManyToOne
    @JoinColumn(
            name = "province_id",
            referencedColumnName = "province_id",
            foreignKey = @ForeignKey(name = "fk_cities_province")
    )
    private Province province;

    @Column(length = 100)
    @NotNull
    private String name;
}
