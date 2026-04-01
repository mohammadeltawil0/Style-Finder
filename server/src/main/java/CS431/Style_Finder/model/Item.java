package CS431.Style_Finder.model;

import CS431.Style_Finder.model.enums.PatternType;
import CS431.Style_Finder.model.enums.LengthType;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.Formality;
import CS431.Style_Finder.model.enums.ItemType;
import CS431.Style_Finder.model.enums.Season;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

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
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ItemType type;

    @Column(name = "color")
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "pattern")
    private PatternType pattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "length")
    private LengthType length;

    // Fabric warmth: 1 = thin/light, 5 = warm (wool, etc.)
    @Column(name = "material")
    private Integer material;

    @Column(name = "bulk")
    private Integer bulk;

    @Enumerated(EnumType.STRING)
    @Column(name = "season_wear")
    private Season seasonWear;

    @Enumerated(EnumType.STRING)
    @Column(name = "formality")
    private Formality formality;

    @Enumerated(EnumType.STRING)
    @Column(name = "fit")
    private Fit fit;

    @Column(name = "times_worn")
    private Integer timesWorn;

    @Column(name = "image_url")
    private String imageUrl;

    @PrePersist
    protected void onCreate() {
        if (timesWorn == null) timesWorn = 0;
    }
}
