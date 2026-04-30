package CS431.Style_Finder.model;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trip_id")
    private Long tripId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "trip_location")
    private String tripLocation;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TripOutfit> tripOutfits = new ArrayList<>();

////   This is used so user can delete outfit what was shared before
//    @OneToMany(mappedBy = "trip", cascade = CascadeType.ALL, orphanRemoval = true)
//    @Builder.Default
//    private List<SharedTrip> sharedTrips = new ArrayList<>();
}
