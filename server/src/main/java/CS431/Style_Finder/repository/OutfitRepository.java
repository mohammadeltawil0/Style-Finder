package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Outfit;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutfitRepository extends JpaRepository<Outfit, Long> {

    @EntityGraph(attributePaths = {"outfitItems", "outfitItems.item", "user"})
    List<Outfit> findByUser_UserId(Long userId);

    @EntityGraph(attributePaths = {"outfitItems", "outfitItems.item", "user"})
    List<Outfit> findByUser_UserIdAndSavedTrue(Long userId);
}