package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.SharedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SharedTripRepository extends JpaRepository<SharedTrip, Long> {

    Optional<SharedTrip> findByShareToken(String shareToken);

    Optional<SharedTrip> findByTrip_TripId(Long tripId);
}