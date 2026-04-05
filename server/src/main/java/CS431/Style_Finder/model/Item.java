package CS431.Style_Finder.model;

import CS431.Style_Finder.model.enums.LengthType;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.model.enums.Season;
import CS431.Style_Finder.model.enums.PatternType;
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
    private String color;

    // New column for the algorithm
    @Enumerated(EnumType.STRING)
    @Column(name = "pattern")
    private PatternType pattern;
    
    // @Column(name = "pattern")
    // private String pattern;
  
    // New column for the algorithm
    @Column(name = "color_category")
    private String colorCategory;

   @Enumerated(EnumType.STRING)
    @Column(name = "length")
    private LengthType length;

    // Fabric warmth: 1 = thin/light, 5 = warm (wool, etc.)
    @Column(name = "material")
    private Integer material;

    @Enumerated(EnumType.STRING)
    @Column(name = "season_wear")
    private Season seasonWear;

    @Enumerated(EnumType.STRING)
    @Column(name = "formality")
    private Formality formality;

    @Enumerated(EnumType.STRING)
    @Column(name = "fit")
    private Fit fit;

    // New column for the algorithm
    @Column(name = "bulk")
    private Double bulk;

    @Column(name = "times_worn")
    private Integer timesWorn;

    @Column(name = "image_url")
    private String imageUrl;

    @PrePersist
    protected void onCreate() {
        if (timesWorn == null) timesWorn = 0;
    }

    // New method for the algorithm
    public double getWarmthScore() { return bulk != null ? bulk * 10.0 : 0.0; }
}
