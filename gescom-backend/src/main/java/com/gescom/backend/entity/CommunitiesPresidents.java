package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "communities_presidents")
@Data
public class CommunitiesPresidents {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long community_president_id;

    @ManyToOne
    @NotNull
    @JoinColumn(
            name = "community_id",
            referencedColumnName = "community_id",
            foreignKey = @ForeignKey(name = "fk_communities_presidents_community")
    )
    private Communities community;

    @ManyToOne
    @NotNull
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "user_id",
            foreignKey = @ForeignKey(name = "fk_communities_presidents_user")
    )
    private User user;

    @Column
    @NotNull
    private LocalDate start_date;

    @Column
    private LocalDate end_date;
}
