package CS431.Style_Finder.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "outfits")
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "outfit_id")
    private Long outfitId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "saved", nullable = false)
    private Boolean saved;

    @Column(name = "trip_outfit")
    private Boolean isTripOutfit;

    @Column(name = "comments")
    private String comments;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "outfit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OutfitItem> outfitItems = new ArrayList<>();

    @OneToMany(mappedBy = "outfit", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TripOutfit> tripOutfits = new ArrayList<>();

//    This is used so user can delete outfit what was shared before
//    @OneToMany(mappedBy = "outfit", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<SharedOutfit> sharedOutfits = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (saved == null) saved = false;
    }
}
