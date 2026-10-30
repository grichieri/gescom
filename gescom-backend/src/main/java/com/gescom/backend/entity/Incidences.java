package com.gescom.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Incidencia reportada en una comunidad (tabla incidences). */
@Entity
@Table(name = "incidences")
@Getter
@Setter
@NoArgsConstructor
public class Incidences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "incidence_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "community_id", nullable = false)
    private Communities community;

    /** Zona común, bloque, piso o chalet afectado. Opcional. */
    @Column(name = "property_id")
    private Integer propertyId;

    /** Usuario que reporta. Solo puede editar mientras el estado sea PENDING. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reported_by_user_id", nullable = false)
    private User reportedBy;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer status = 1;

    @Column(nullable = false)
    private Short priority = 1;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    /** Plazo máximo de resolución. No puede ser anterior a la fecha de creación. */
    @Column(name = "max_resolution_date")
    private LocalDate maxResolutionDate;

    @OneToMany(mappedBy = "incidence", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<IncidencePicture> pictures = new ArrayList<>();

    public void addPicture(IncidencePicture picture) {
        pictures.add(picture);
        picture.setIncidence(this);
    }

    @PrePersist
    void onCreate() {
        if (createdDate == null) {
            createdDate = LocalDateTime.now();
        }
    }
}
