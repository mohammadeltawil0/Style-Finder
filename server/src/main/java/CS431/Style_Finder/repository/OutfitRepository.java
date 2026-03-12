package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Outfit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutfitRepository extends JpaRepository<Outfit, Long> {
    List<Outfit> findByUser_UserId(Long userId);
    List<Outfit> findByUser_UserIdAndSavedTrue(Long userId);
}