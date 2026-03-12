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

    // One-to-One: each user has exactly one preference record
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "color_often_wear")
    private String colorOftenWear;

    @Column(name = "prefer_fit")
    private String preferFit;

    @Column(name = "fabric_prefer")
    private String fabricPrefer;

    @Column(name = "outfit_need_most")
    private String outfitNeedMost;

    @Column(name = "gender")
    private String gender;
}


