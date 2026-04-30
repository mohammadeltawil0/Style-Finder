package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.TripOutfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripOutfitRepository extends JpaRepository<TripOutfit, Long> {
    TripOutfit findByTrip_TripIdAndOutfit_OutfitId(Long tripId, Long outfitId);
    TripOutfit findByTrip_TripId(Long tripId);

    List<TripOutfit> findTripOutfitsByTrip_TripId(Long tripTripId);
}
