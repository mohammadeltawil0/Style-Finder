package CS431.Style_Finder.model;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
// Java class to build a case for a user's outfit'
public class OutfitCase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;

    private int temperature;
    private String occasion;
    private String weather;

    @ElementCollection
    private List<Long> itemIds;
    private int rating;
}
