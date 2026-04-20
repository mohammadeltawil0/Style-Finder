package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.enums.ItemType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    @EntityGraph(attributePaths = {"user"})
    List<Item> findByUser_UserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<Item> findByUser_UserIdAndType(Long user_userId, ItemType type);

    @EntityGraph(attributePaths = {"user"})
    Optional<Item> findByItemId(Long itemId);
}
