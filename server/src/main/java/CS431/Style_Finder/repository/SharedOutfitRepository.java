package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.SharedOutfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SharedOutfitRepository extends JpaRepository<SharedOutfit, Long> {
    Optional<SharedOutfit> findByShareToken(String shareToken);
    Optional<SharedOutfit> findByOutfit_OutfitId(Long outfitId);
}