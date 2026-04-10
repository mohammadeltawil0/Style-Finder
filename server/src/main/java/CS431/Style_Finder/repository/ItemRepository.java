package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Item;
import CS431.Style_Finder.model.enums.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUser_UserId(Long userId);
    List<Item> findByUser_UserIdAndType(Long user_userId, ItemType type);
    Optional<Item> findByItemId(Long itemId);
}
