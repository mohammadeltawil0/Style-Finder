package CS431.Style_Finder.repository;
import CS431.Style_Finder.model.UserWeights;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserWeightsRepository extends JpaRepository<UserWeights, Long>{
    Optional<UserWeights> findUserWeightsByUser_UserId(Long userId);
}
