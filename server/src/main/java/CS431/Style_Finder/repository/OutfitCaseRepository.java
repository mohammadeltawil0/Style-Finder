package CS431.Style_Finder.repository;
import CS431.Style_Finder.model.OutfitCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface OutfitCaseRepository extends JpaRepository<OutfitCase, Long> {
    @Query("SELECT o FROM OutfitCase o WHERE o.userId = :userId " +
            "AND o.occasion = :occasion AND o.temperature BETWEEN :minTemp " +
            "AND :maxTemp AND o.rating >= 4")
    List<OutfitCase> findMatchingMemory(Long userId, String occasion, int minTemp, int maxTemp);
}
