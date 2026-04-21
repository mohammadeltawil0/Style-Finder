package CS431.Style_Finder.model;
import CS431.Style_Finder.model.enums.ColorCategory;
import CS431.Style_Finder.model.enums.Fit;
import CS431.Style_Finder.model.enums.MaterialType;
import CS431.Style_Finder.model.enums.PatternType;
import jakarta.persistence.*;
import lombok.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_weights")
// Backbone of the algorithm.
// 1.0 is the default weight.
// It is based on the user's preferences.'
public class UserWeights {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_weights_id")
    private Long userWeightsId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private double thermalBias = 1.0;
    private double colorHarmonyWeight = 1.0;

    @ElementCollection
    @CollectionTable(name="user_weights_dealbreakers", joinColumns=@JoinColumn(name="user_weights_id"))
    @Column(name="dealbreakers")
    private List<String> dealbreakers; // e.g., Item IDs or specific tags

    @ElementCollection
    @CollectionTable(name="user_weights_fit", joinColumns=@JoinColumn(name="user_weights_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name="fit_type")
    @Column(name="weight")
    private Map<Fit, Double> fitWeights = new HashMap<>();

    @ElementCollection
    @CollectionTable(name="user_weights_pattern", joinColumns=@JoinColumn(name="user_weights_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name="pattern_type")
    @Column(name="weight")
    private Map<PatternType, Double> patternWeights = new HashMap<>();

    @ElementCollection
    @CollectionTable(name="user_weights_color", joinColumns=@JoinColumn(name="user_weights_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name="color_category_type")
    @Column(name="weight")
    private Map<ColorCategory, Double> colorWeights = new HashMap<>();

    @ElementCollection
    @CollectionTable(name="user_weights_material", joinColumns=@JoinColumn(name="user_weights_id"))
    @MapKeyEnumerated(EnumType.STRING)
    @MapKeyColumn(name="material_type")
    @Column(name="weight")
    private Map<MaterialType, Double> materialWeights = new HashMap<>();
}