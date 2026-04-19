package CS431.Style_Finder.repository;

import CS431.Style_Finder.model.OutfitItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OutfitItemRepository extends JpaRepository<OutfitItem, Long> {
    long deleteByItem_ItemId(Long itemId);
}