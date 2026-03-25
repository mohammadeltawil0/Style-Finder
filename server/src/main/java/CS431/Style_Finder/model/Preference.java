package CS431.Style_Finder.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "preferences")
public class Preference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preference_id")
    private Long preferenceId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    private String comfort;

    private String occasion;   
    private String weather;

    private String style;      
    
    @Column(name = "prefer_fit")
    private String preferFit;

    private String items;      
    
    @Column(name = "avoid_items")
    private String avoidItems;

    @Column(name = "colors_wear")
    private String colorsWear;

    @Column(name = "colors_avoid")
    private String colorsAvoid;

    @Column(name = "trip_priority")
    private String tripPriority;
}


