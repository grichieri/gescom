package com.gescom.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "provinces")
@Data
public class Province {
    @Id
    private short province_id;

    @Column(length = 30)
    @NotNull
    private String name;
}
