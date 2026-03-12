package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Preference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    Optional<Preference> findByUser_UserId(Long userId);
}