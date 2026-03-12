package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUser_UserId(Long userId);
    List<Item> findByUser_UserIdAndType(Long userId, String type);
}
