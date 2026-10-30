package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;

@Entity
@Table(name = "communities_users")
@Data
public class CommunitiesUsers {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long community_user_id;

    @ManyToOne
    @NotNull
    @JoinColumn(
            name = "community_id",
            referencedColumnName = "community_id",
            foreignKey = @ForeignKey(name = "fk_communities_users_community")
    )
    private Communities community;

    @ManyToOne
    @NotNull
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "user_id",
            foreignKey = @ForeignKey(name = "fk_communities_users_user")
    )
    private User user;

    @Column
    @NotNull
    @ColumnDefault("CURRENT_DATE")
    private LocalDate move_in_date;

    @Column
    private LocalDate move_out_date;
}
