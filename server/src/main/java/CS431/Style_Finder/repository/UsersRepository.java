package CS431.Style_Finder.repository;
import CS431.Style_Finder.entity.Users;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Long>{
    // Spring Boot writes the SQL for these automatically based on the method name!
    Optional<Users> findByEmail(String email);

    Optional<Users> findByUsername(String username);

    Boolean existsByEmail(String email);
}
