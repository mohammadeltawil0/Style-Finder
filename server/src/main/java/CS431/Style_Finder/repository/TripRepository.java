package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findByUser_UserId(Long userId);
}