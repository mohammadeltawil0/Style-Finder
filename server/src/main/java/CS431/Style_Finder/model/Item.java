package CS431.Style_Finder.model;

import CS431.Style_Finder.model.enums.*;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "items")
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ItemType type;

    @Column(name = "color")
    private String color; // Specific hex/name for UI

    @Enumerated(EnumType.STRING)
    @Column(name = "pattern")
    private PatternType pattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "color_category")
    private ColorCategory colorCategory; // Standardized for Algorithm

    @Enumerated(EnumType.STRING)
    @Column(name = "length")
    private LengthType length;

    @Enumerated(EnumType.STRING)
    @Column(name = "material")
    private MaterialType material; // Changed from Integer

    @Enumerated(EnumType.STRING)
    @Column(name = "season_wear")
    private Season seasonWear;

    @Enumerated(EnumType.STRING)
    @Column(name = "formality")
    private Formality formality;

    @Enumerated(EnumType.STRING)
    @Column(name = "fit")
    private Fit fit;

    @Column(name = "bulk")
    private double bulk;

    @Column(name = "times_worn")
    private Integer timesWorn;

    @Column(name = "image_url")
    private String imageUrl;

    @PrePersist
    protected void onCreate() {
        if (timesWorn == null) timesWorn = 0;
    }

    public double getWarmthScore() {
        // Base warmth is primarily determined by the item's physical thickness (bulk)
        double score = bulk * 10.0;

        // Null safety check
        if (material == null) return score;

        // Apply material-specific thermal modifiers
        switch (material) {
            // Highly Insulating (Winter/Cold Weather)
            case WOOL:
            case FLEECE:
                score += 5.0; // Maximum warmth retention
                break;
            case ACRYLIC: // Common synthetic wool substitute
            case LEATHER: // Excellent windbreaker and heat trapper
                score += 3.0;
                break;

            // Highly Breathable (Summer/Hot Weather)
            case LINEN:
            case HEMP:
                score -= 4.0; // Maximum breathability, actively cools
                break;
            case SILK:
            case RAYON:
            case LYOCELL:
            case MODAL:
                score -= 2.0; // Lightweight, breathable cellulose/natural fibers
                break;

            // Neutral / Standard Synthetics (Warmth relies almost entirely on bulk)
            case COTTON:
            case POLYESTER:
            case NYLON:
            case SPANDEX:
            case ACETATE:
            default:
                score += 0.0; // No inherent thermal bias
                break;
        }

        // Defensive programming: A piece of clothing cannot have "negative" warmth.
        // The absolute coldest an item can be is 0.0 (provides zero insulation).
        return Math.max(0.0, score);
    }
}
