package CS431.Style_Finder.model;
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
    private List<String> dealbreakers;

    @ElementCollection
    @CollectionTable(name="user_weights_fit", joinColumns=@JoinColumn(name="user_id"))
    @MapKeyColumn(name="fit_type")
    @Column(name="weight")
    private Map<String, Double> fitWeights = new HashMap<>();
    // e.g., {"Oversized": 1.5, "Skinny": 0.2, "Regular": 1.0}

    @ElementCollection
    @CollectionTable(name="user_weights_pattern", joinColumns=@JoinColumn(name="user_id"))
    @MapKeyColumn(name="pattern_type")
    @Column(name="weight")
    private Map<String, Double> patternWeights = new HashMap<>();
    // e.g., {"Solid": 1.2, "Striped": 0.8, "Floral": 0.0}

    @ElementCollection
    @CollectionTable(name="user_weights_color", joinColumns=@JoinColumn(name="user_id"))
    @MapKeyColumn(name="color_category_type")
    @Column(name="weight")
    private Map<String, Double> colorWeights = new HashMap<>();

    @ElementCollection
    @CollectionTable(name="user_weights_material", joinColumns=@JoinColumn(name="user_id"))
    @MapKeyColumn(name="material_type")
    @Column(name="weight")
    private Map<String, Double> materialWeights = new HashMap<>();

}
