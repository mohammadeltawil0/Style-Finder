package CS431.Style_Finder.model;

import CS431.Style_Finder.model.enums.*;
import CS431.Style_Finder.model.converter.MaterialTypeConverter;
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

    @Convert(converter = MaterialTypeConverter.class)
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
    private Double bulk;

    @Column(name = "times_worn")
    private Integer timesWorn;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @PrePersist
    protected void onCreate() {
        if (timesWorn == null) timesWorn = 0;
        if (bulk == null) bulk = 0.0;
    }

    public Double getBulk() {
        return bulk == null ? 0.0 : bulk;
    }

    public double getWarmthScore() {
        // Base warmth is primarily determined by the item's physical thickness (bulk)
        double score = getBulk() * 10.0;

        // Null safety check
        if (material == null) return score;

        // Apply material-specific thermal modifiers
        switch (material) {
            // Highly Insulating (Winter/Cold Weather)
            case WOOL:
            case FLEECE:
                score += 5.0; // Maximum warmth retention
                break;
            case LEATHER: // Excellent windbreaker and heat trapper
                score += 3.0;
                break;
            // Moderate Insulation (Transitional Seasons)
            case POLYESTER:
            case KNIT:
                score += 1.0; // Slight warmth, depends mostly on bulk
                break;
            case DENIM:
                score += 2.0; // Moderately warm, wind-resistant but not insulating
                break;
            // Highly Breathable (Summer/Hot Weather)
            case LINEN:
            case SILK:
            // Neutral / Standard Synthetics (Warmth relies almost entirely on bulk)
            case COTTON:
            default:
                score += 0.0; // No inherent thermal bias
                break;
        }

        // Defensive programming: A piece of clothing cannot have "negative" warmth.
        // The absolute coldest an item can be is 0.0 (provides zero insulation).
        return Math.max(0.0, score);
    }
}
