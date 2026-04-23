package CS431.Style_Finder.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "shared_outfits")
public class SharedOutfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shared_outfit_id")
    private Long id;

    // Public unique token used in shareable link
    @Column(name = "share_token", nullable = false, unique = true)
    private String shareToken;

    // Link to the original outfit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "outfit_id", nullable = false)
    private Outfit outfit;

    // When the link was created
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Whether the link is still active (for revoke feature)
    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    //convenience method
    // public void incrementViewCount() {
    //     if (this.viewCount == null) {
    //         this.viewCount = 0;
    //     }
    //     this.viewCount++;
    // }
}