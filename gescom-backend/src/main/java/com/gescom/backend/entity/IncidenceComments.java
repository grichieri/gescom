package com.gescom.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidence_comments")
@Data
public class IncidenceComments {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long comment_id;

    @ManyToOne
    @JoinColumn(
            name = "incidence_id",
            referencedColumnName = "incidence_id",
            foreignKey = @ForeignKey(name = "fk_incidence_comments_incidence")
    )
    private Incidences incidence;

    @ManyToOne
    @JoinColumn(
            name = "user_id",
            referencedColumnName = "user_id",
            foreignKey = @ForeignKey(name = "fk_communities_users_user")
    )
    private User user;

    @Column
    @NotNull
    @NotBlank
    private String comment;

    @Column
    @NotNull
    @ColumnDefault("CURRENT_TIMESTAMP")
    private LocalDateTime created_date;
}
