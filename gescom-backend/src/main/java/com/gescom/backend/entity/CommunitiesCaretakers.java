package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "communities_caretakers")
@Data
public class CommunitiesCaretakers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long community_caretaker_id;

    @ManyToOne
    @JoinColumn(
            name = "community_id",
            referencedColumnName = "community_id",
            foreignKey = @ForeignKey(name = "fk_communities_caretakers_community")
    )
    private Communities community;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "user_id",
            foreignKey = @ForeignKey(name = "fk_communities_caretakers_user")
    )
    private User user;

    @Column
    @NotNull
    private LocalDate start_date;

    @Column
    private LocalDate end_date;
}
